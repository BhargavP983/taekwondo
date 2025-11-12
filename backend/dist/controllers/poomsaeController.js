"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistrictPoomsaeStats = exports.getPoomsaeForDistrictAdmin = exports.getPoomsaeEntryById = exports.deletePoomsaeEntry = exports.getPoomsaeStats = exports.getAllPoomsaeEntries = exports.createPoomsaeEntry = void 0;
const poomsae_1 = require("../models/poomsae");
const poomsaeFormService_1 = require("../services/poomsaeFormService");
const poomsaeSchemas_1 = require("../schemas/poomsaeSchemas");
const counter_1 = require("../models/counter");
const formGenerator = new poomsaeFormService_1.PoomsaeFormGenerator();
const formatPoomsaeResponse = (poomsae) => ({
    _id: poomsae._id.toString(),
    entryId: poomsae.entryId,
    division: poomsae.division,
    category: poomsae.category,
    gender: poomsae.gender,
    name: poomsae.name,
    stateOrg: poomsae.stateOrg,
    district: poomsae.district,
    dateOfBirth: poomsae.dateOfBirth instanceof Date ? poomsae.dateOfBirth.toISOString() : poomsae.dateOfBirth,
    age: poomsae.age,
    weight: poomsae.weight,
    parentGuardianName: poomsae.parentGuardianName,
    mobileNo: poomsae.mobileNo,
    currentBeltGrade: poomsae.currentBeltGrade,
    tfiIdNo: poomsae.tfiIdNo,
    danCertificateNo: poomsae.danCertificateNo,
    academicQualification: poomsae.academicQualification,
    nameOfCollege: poomsae.nameOfCollege,
    nameOfBoardUniversity: poomsae.nameOfBoardUniversity,
    formFileName: poomsae.formFileName,
    formDownloadUrl: poomsae.formFileName ? `${process.env.BASE_URL}/uploads/forms/${poomsae.formFileName}` : undefined,
    createdAt: poomsae.createdAt instanceof Date ? poomsae.createdAt.toISOString() : poomsae.createdAt
});
// Generate unique entry ID (atomic counter, resilient to deletions and concurrency)
const generatePoomsaeEntryId = async () => {
    const next = await (0, counter_1.getNextSequence)('poomsae', async () => {
        // Fallback: find highest existing numeric portion if counter collection is missing
        const latest = await poomsae_1.Poomsae.findOne().sort({ createdAt: -1 }).select('entryId').lean();
        const num = latest?.entryId?.split('-')[1];
        const parsed = num ? parseInt(num, 10) : 0;
        return isNaN(parsed) ? 0 : parsed;
    });
    const padded = next.toString().padStart(6, '0');
    return `PMS-${padded}`;
};
const createPoomsaeEntry = async (req, res) => {
    try {
        // Validate request body
        const validationResult = poomsaeSchemas_1.poomsaeEntrySchema.safeParse(req);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationResult.error.issues
            });
        }
        const entryData = validationResult.data.body;
        // Normalize and enforce TFI ID uniqueness only when provided
        if (entryData.tfiIdNo && String(entryData.tfiIdNo).trim() !== '') {
            const existing = await poomsae_1.Poomsae.findOne({ tfiIdNo: entryData.tfiIdNo });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'TFI ID already exists'
                });
            }
        }
        else {
            entryData.tfiIdNo = '';
        }
        let attempts = 0;
        const maxAttempts = 3;
        let lastError = null;
        while (attempts < maxAttempts) {
            // Generate entry ID
            const entryId = await generatePoomsaeEntryId();
            console.log(`📝 Creating poomsae entry: ${entryId}`);
            // Generate form for this ID
            const formResult = await formGenerator.generatePoomsaeForm({
                entryId,
                ...entryData,
                name: entryData.name.toUpperCase()
            });
            console.log(`✅ Form generated: ${formResult.fileName}`);
            try {
                // Save to MongoDB
                const poomsae = await poomsae_1.Poomsae.create({
                    entryId,
                    ...entryData,
                    name: entryData.name.toUpperCase(),
                    dateOfBirth: new Date(entryData.dateOfBirth),
                    age: parseInt(entryData.age),
                    weight: parseFloat(entryData.weight),
                    formFileName: formResult.fileName
                });
                console.log(`✅ Poomsae saved to MongoDB: ${poomsae._id}`);
                return res.status(201).json({
                    success: true,
                    message: 'Poomsae entry created successfully',
                    data: {
                        entryId: poomsae.entryId,
                        applicationNumber: poomsae.entryId,
                        downloadUrl: `${req.protocol}://${req.get('host')}${formResult.filePath}`,
                        fileName: formResult.fileName,
                        createdAt: poomsae.createdAt
                    }
                });
            }
            catch (err) {
                lastError = err;
                // If duplicate on entryId, retry with a new sequence
                if (err?.code === 11000 && (err?.keyPattern?.entryId || (err?.errmsg || '').includes('entryId'))) {
                    console.warn('⚠️ Duplicate entryId detected, retrying ID generation...');
                    attempts++;
                    continue;
                }
                // Other errors: break and fall through to outer catch
                throw err;
            }
        }
        // If we exhausted retries, throw last error
        throw lastError || new Error('Failed to create entry after retries');
    }
    catch (error) {
        console.error('❌ Create poomsae entry error:', error);
        if (error.code === 11000) {
            // Differentiate which unique field caused the duplicate error
            const key = error.keyPattern || error.keyValue || {};
            let message = 'Duplicate value';
            if (key.tfiIdNo)
                message = 'TFI ID already exists';
            else if (key.entryId)
                message = 'Entry ID collision. Please retry.';
            return res.status(400).json({
                success: false,
                message
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create entry'
        });
    }
};
exports.createPoomsaeEntry = createPoomsaeEntry;
const getAllPoomsaeEntries = async (req, res) => {
    try {
        console.log('📡 Poomsae API called with query:', req.query);
        // First check if we can connect to the database
        console.log('🔗 Checking database connection...');
        const mongoose = require('mongoose');
        console.log('📊 DB readyState:', mongoose.connection.readyState);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filters based on user role
        const filter = {};
        // District admins can ONLY see their own district
        if (req.user?.role === 'districtAdmin') {
            if (!req.user.district) {
                return res.status(400).json({
                    success: false,
                    message: 'District information not found for district admin'
                });
            }
            filter.district = req.user.district;
        }
        // State admins can ONLY see their own state
        else if (req.user?.role === 'stateAdmin') {
            if (!req.user.state) {
                return res.status(400).json({
                    success: false,
                    message: 'State information not found for state admin'
                });
            }
            filter.stateOrg = req.user.state;
        }
        // Super admins can apply query filters
        else if (req.user?.role === 'superAdmin') {
            if (req.query.division)
                filter.division = req.query.division;
            if (req.query.category)
                filter.category = req.query.category;
        }
        console.log('🔍 Poomsae filter:', filter);
        console.log('⏳ Starting database query...');
        // Try a simple count first
        const totalCount = await poomsae_1.Poomsae.countDocuments(filter);
        console.log(`📊 Total count query completed: ${totalCount}`);
        const entries = await poomsae_1.Poomsae.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        console.log('✅ Database query completed, found entries:', entries.length);
        console.log('🔄 Processing entries...');
        const processedData = entries.map(entry => {
            try {
                return formatPoomsaeResponse(entry);
            }
            catch (err) {
                console.error('❌ Error processing entry:', entry._id, err);
                return null;
            }
        }).filter(item => item !== null);
        console.log(`📊 Processed ${processedData.length} entries successfully`);
        const responseData = {
            success: true,
            message: 'Poomsae entries retrieved successfully',
            data: processedData,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            totalItems: totalCount
        };
        console.log('📤 Sending response...');
        res.status(200).json(responseData);
        console.log('✅ Response sent successfully');
    }
    catch (error) {
        console.error('❌ Poomsae API error:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch entries'
        });
    }
};
exports.getAllPoomsaeEntries = getAllPoomsaeEntries;
const getPoomsaeStats = async (req, res) => {
    try {
        // Build filter based on user role
        const filter = {};
        // District admins can ONLY see their own district stats
        if (req.user?.role === 'districtAdmin') {
            if (!req.user.district) {
                return res.status(400).json({
                    success: false,
                    message: 'District information not found for district admin'
                });
            }
            filter.district = req.user.district;
        }
        // State admins can ONLY see their own state stats
        else if (req.user?.role === 'stateAdmin') {
            if (!req.user.state) {
                return res.status(400).json({
                    success: false,
                    message: 'State information not found for state admin'
                });
            }
            filter.stateOrg = req.user.state;
        }
        const totalEntries = await poomsae_1.Poomsae.countDocuments(filter);
        const byDivision = await poomsae_1.Poomsae.aggregate([
            { $match: filter },
            { $group: { _id: '$division', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const byCategory = await poomsae_1.Poomsae.aggregate([
            { $match: filter },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        res.status(200).json({
            success: true,
            data: {
                totalEntries,
                byDivision,
                byCategory
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch statistics'
        });
    }
};
exports.getPoomsaeStats = getPoomsaeStats;
const deletePoomsaeEntry = async (req, res) => {
    try {
        const { entryId } = req.params;
        // Build filter based on user role
        const filter = { entryId };
        // District admins can ONLY delete their own district's entries
        if (req.user?.role === 'districtAdmin') {
            if (!req.user.district) {
                return res.status(400).json({
                    success: false,
                    message: 'District information not found for district admin'
                });
            }
            filter.district = req.user.district;
        }
        // State admins can ONLY delete their own state's entries
        else if (req.user?.role === 'stateAdmin') {
            if (!req.user.state) {
                return res.status(400).json({
                    success: false,
                    message: 'State information not found for state admin'
                });
            }
            filter.stateOrg = req.user.state;
        }
        const poomsae = await poomsae_1.Poomsae.findOneAndDelete(filter);
        if (!poomsae) {
            return res.status(404).json({
                success: false,
                message: 'Entry not found or access denied'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Entry deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete entry'
        });
    }
};
exports.deletePoomsaeEntry = deletePoomsaeEntry;
const getPoomsaeEntryById = async (req, res) => {
    try {
        const { entryId } = req.params;
        // Build filter based on user role
        const filter = { entryId };
        // District admins can ONLY see their own district
        if (req.user?.role === 'districtAdmin') {
            if (!req.user.district) {
                return res.status(400).json({
                    success: false,
                    message: 'District information not found for district admin'
                });
            }
            filter.district = req.user.district;
        }
        // State admins can ONLY see their own state
        else if (req.user?.role === 'stateAdmin') {
            if (!req.user.state) {
                return res.status(400).json({
                    success: false,
                    message: 'State information not found for state admin'
                });
            }
            filter.stateOrg = req.user.state;
        }
        const poomsae = await poomsae_1.Poomsae.findOne(filter);
        if (!poomsae) {
            return res.status(404).json({
                success: false,
                message: 'Entry not found'
            });
        }
        res.status(200).json({
            success: true,
            data: poomsae
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch entry'
        });
    }
};
exports.getPoomsaeEntryById = getPoomsaeEntryById;
// Get poomsae entries for district admin (filtered by their district)
const getPoomsaeForDistrictAdmin = async (req, res) => {
    try {
        const userDistrict = req.user?.district;
        if (!userDistrict) {
            return res.status(400).json({
                success: false,
                message: 'District information not found'
            });
        }
        const page = Math.max(parseInt(req.query.page || '1', 10), 1);
        const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);
        const skip = (page - 1) * limit;
        // Filters
        const filter = { district: userDistrict };
        if (req.query.gender)
            filter.gender = req.query.gender;
        if (req.query.division)
            filter.division = req.query.division;
        if (req.query.category)
            filter.category = req.query.category;
        // Execute query with pagination
        const [poomsae, total] = await Promise.all([
            poomsae_1.Poomsae.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            poomsae_1.Poomsae.countDocuments(filter)
        ]);
        res.status(200).json({
            success: true,
            message: 'Poomsae entries retrieved successfully',
            data: {
                items: poomsae.map(p => formatPoomsaeResponse(p)),
                total,
                page,
                pageSize: limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch poomsae entries'
        });
    }
};
exports.getPoomsaeForDistrictAdmin = getPoomsaeForDistrictAdmin;
// Get district poomsae statistics
const getDistrictPoomsaeStats = async (req, res) => {
    try {
        const userDistrict = req.user?.district;
        if (!userDistrict) {
            return res.status(400).json({
                success: false,
                message: 'District information not found'
            });
        }
        const totalEntries = await poomsae_1.Poomsae.countDocuments({ district: userDistrict });
        // Group by gender
        const byGender = await poomsae_1.Poomsae.aggregate([
            { $match: { district: userDistrict } },
            { $group: { _id: '$gender', count: { $sum: 1 } } }
        ]);
        // Group by division
        const byDivision = await poomsae_1.Poomsae.aggregate([
            { $match: { district: userDistrict } },
            { $group: { _id: '$division', count: { $sum: 1 } } }
        ]);
        // Group by category
        const byCategory = await poomsae_1.Poomsae.aggregate([
            { $match: { district: userDistrict } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        // Recent entries (last 10)
        const recentEntries = await poomsae_1.Poomsae.find({ district: userDistrict })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('entryId name stateOrg createdAt')
            .lean();
        res.status(200).json({
            success: true,
            message: 'District poomsae statistics retrieved successfully',
            data: {
                totalEntries,
                byGender,
                byDivision,
                byCategory,
                recentEntries: recentEntries.map(entry => ({
                    id: entry._id.toString(),
                    entryId: entry.entryId,
                    name: entry.name,
                    state: entry.stateOrg,
                    createdAt: entry.createdAt
                }))
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch district poomsae statistics'
        });
    }
};
exports.getDistrictPoomsaeStats = getDistrictPoomsaeStats;
