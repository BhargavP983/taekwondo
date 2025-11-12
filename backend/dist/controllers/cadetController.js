"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistrictCadetStats = exports.getCadetsForDistrictAdmin = exports.getCadetStats = exports.deleteCadetEntry = exports.getCadetByEntryId = exports.getAllCadetEntries = exports.createCadetEntry = void 0;
const cadet_1 = require("../models/cadet");
const counter_1 = require("../models/counter");
const cadetFormService_1 = require("../services/cadetFormService");
const errors_1 = require("../types/errors");
const formGenerator = new cadetFormService_1.CadetFormGenerator();
const formatCadetResponse = (cadet) => ({
    id: cadet._id.toString(),
    entryId: cadet.entryId,
    name: cadet.name,
    dateOfBirth: cadet.dateOfBirth.toISOString(),
    gender: cadet.gender,
    age: cadet.age,
    weight: cadet.weight,
    weightCategory: cadet.weightCategory,
    parentGuardianName: cadet.parentGuardianName,
    state: cadet.state,
    district: cadet.district,
    presentBeltGrade: cadet.presentBeltGrade,
    tfiIdCardNo: cadet.tfiIdCardNo,
    academicQualification: cadet.academicQualification,
    schoolName: cadet.schoolName,
    applicationStatus: cadet.applicationStatus || 'pending',
    formFileName: cadet.formFileName,
    createdAt: cadet.createdAt?.toISOString?.() || cadet.createdAt,
    formDownloadUrl: cadet.formFileName ? `${process.env.BASE_URL}/uploads/forms/${cadet.formFileName}` : undefined
});
// Generate unique entry ID (atomic counter)
const generateCadetEntryId = async () => {
    const next = await (0, counter_1.getNextSequence)('cadet', async () => {
        // fallback initial: compute max existing numeric portion
        const latest = await cadet_1.Cadet.findOne().sort({ createdAt: -1 }).select('entryId').lean();
        const num = latest?.entryId?.split('-')[1];
        const parsed = num ? parseInt(num, 10) : 0;
        return isNaN(parsed) ? 0 : parsed;
    });
    const id = next.toString().padStart(6, '0');
    return `CAD-${id}`;
};
const createCadetEntry = async (req, res, next) => {
    try {
        let { gender, weightCategory, name, dateOfBirth, age, weight, parentGuardianName, state, presentBeltGrade, tfiIdCardNo, academicQualification, schoolName, district } = req.body;
        // Normalize gender values from UI (Boy/Girl) to schema enum values
        if (gender === 'Boy')
            gender = 'male';
        if (gender === 'Girl')
            gender = 'female';
        // Parse numeric values once (these do not depend on entryId)
        const parsedAge = parseInt(age, 10);
        const parsedWeight = weight ? parseFloat(weight) : undefined;
        if (isNaN(parsedAge)) {
            throw new errors_1.ValidationError('Invalid age format');
        }
        if (weight && parsedWeight !== undefined && isNaN(parsedWeight)) {
            throw new errors_1.ValidationError('Invalid weight format');
        }
        // Enforce TFI uniqueness only when provided (non-empty)
        if (tfiIdCardNo && tfiIdCardNo.trim() !== '') {
            const existingCadet = await cadet_1.Cadet.findOne({ tfiIdCardNo });
            if (existingCadet) {
                throw new errors_1.ValidationError('TFI ID Card number already exists');
            }
        }
        else {
            tfiIdCardNo = ''; // normalize blank
        }
        let attempts = 0;
        const maxAttempts = 3;
        let lastError = null;
        while (attempts < maxAttempts) {
            const entryId = await generateCadetEntryId();
            console.log(`📝 Creating cadet entry: ${entryId}`);
            // Generate application form for this attempt
            const formResult = await formGenerator.generateCadetForm({
                entryId,
                gender, // normalized already
                weightCategory: weightCategory || '',
                name: name.toUpperCase(),
                dateOfBirth,
                age: age.toString(),
                weight: weight || '',
                parentGuardianName,
                state,
                district,
                presentBeltGrade,
                tfiIdCardNo: tfiIdCardNo || '',
                academicQualification: academicQualification || '',
                schoolName: schoolName || ''
            });
            if (!formResult.success) {
                throw new errors_1.ValidationError(formResult.message || 'Failed to generate form');
            }
            console.log(`✅ Form generated: ${formResult.fileName}`);
            try {
                const cadetDoc = await cadet_1.Cadet.create({
                    entryId,
                    gender,
                    weightCategory,
                    name: name.toUpperCase(),
                    dateOfBirth: new Date(dateOfBirth),
                    age: parsedAge,
                    weight: parsedWeight,
                    parentGuardianName,
                    state,
                    district,
                    presentBeltGrade,
                    tfiIdCardNo,
                    academicQualification,
                    schoolName,
                    applicationStatus: 'pending',
                    formFileName: formResult.fileName
                });
                console.log(`✅ Cadet saved to MongoDB: ${cadetDoc._id}`);
                return res.status(201).json({
                    success: true,
                    message: 'Cadet entry created successfully',
                    data: {
                        ...formatCadetResponse(cadetDoc),
                        formPath: formResult.filePath,
                        downloadUrl: `${req.protocol}://${req.get('host')}${formResult.filePath}`,
                        applicationNumber: entryId,
                        formDownloadUrl: `${req.protocol}://${req.get('host')}${formResult.filePath}`
                    }
                });
            }
            catch (err) {
                lastError = err;
                if (err?.code === 11000 && (err?.keyPattern?.entryId || (err?.message || '').includes('entryId'))) {
                    console.warn('⚠️ Duplicate cadet entryId detected, retrying ID generation...');
                    attempts++;
                    continue; // retry loop
                }
                // Duplicate TFI already handled earlier; other errors propagate
                throw err;
            }
        }
        // Exhausted retries
        throw new errors_1.ValidationError('Entry ID collision. Please retry.');
    }
    catch (error) {
        next(error);
    }
};
exports.createCadetEntry = createCadetEntry;
const getAllCadetEntries = async (req, res, next) => {
    try {
        // Pagination
        const page = Math.max(parseInt(req.query.page || '1', 10), 1);
        const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);
        const skip = (page - 1) * limit;
        // Filters based on user role
        const filter = {};
        // District admins can ONLY see their own district
        if (req.user?.role === 'districtAdmin') {
            if (!req.user.district) {
                throw new errors_1.ValidationError('District information not found for district admin');
            }
            filter.district = req.user.district;
        }
        // State admins can ONLY see their own state
        else if (req.user?.role === 'stateAdmin') {
            if (!req.user.state) {
                throw new errors_1.ValidationError('State information not found for state admin');
            }
            filter.state = req.user.state;
        }
        // Super admins can apply query filters
        else if (req.user?.role === 'superAdmin') {
            if (req.query.district)
                filter.district = req.query.district;
            if (req.query.state)
                filter.state = req.query.state;
        }
        // Common filters for all roles
        if (req.query.gender)
            filter.gender = req.query.gender;
        // Execute query with pagination
        const [cadets, total] = await Promise.all([
            cadet_1.Cadet.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            cadet_1.Cadet.countDocuments(filter)
        ]);
        res.status(200).json({
            success: true,
            message: 'Cadets retrieved successfully',
            data: {
                items: cadets.map(cadet => formatCadetResponse(cadet)),
                total,
                page,
                pageSize: limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllCadetEntries = getAllCadetEntries;
const getCadetByEntryId = async (req, res, next) => {
    try {
        const { entryId } = req.params;
        // Build filter based on user role
        const filter = { entryId };
        // District admins can ONLY see their own district
        if (req.user?.role === 'districtAdmin') {
            if (!req.user.district) {
                throw new errors_1.ValidationError('District information not found for district admin');
            }
            filter.district = req.user.district;
        }
        // State admins can ONLY see their own state
        else if (req.user?.role === 'stateAdmin') {
            if (!req.user.state) {
                throw new errors_1.ValidationError('State information not found for state admin');
            }
            filter.state = req.user.state;
        }
        const cadet = await cadet_1.Cadet.findOne(filter);
        if (!cadet) {
            throw new errors_1.NotFoundError('Cadet entry not found or access denied');
        }
        res.status(200).json({
            success: true,
            message: 'Cadet entry retrieved successfully',
            data: formatCadetResponse(cadet)
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCadetByEntryId = getCadetByEntryId;
const deleteCadetEntry = async (req, res, next) => {
    try {
        const { entryId } = req.params;
        // Build filter based on user role
        const filter = { entryId };
        // District admins can ONLY delete their own district's entries
        if (req.user?.role === 'districtAdmin') {
            if (!req.user.district) {
                throw new errors_1.ValidationError('District information not found for district admin');
            }
            filter.district = req.user.district;
        }
        // State admins can ONLY delete their own state's entries
        else if (req.user?.role === 'stateAdmin') {
            if (!req.user.state) {
                throw new errors_1.ValidationError('State information not found for state admin');
            }
            filter.state = req.user.state;
        }
        const cadet = await cadet_1.Cadet.findOneAndDelete(filter);
        if (!cadet) {
            throw new errors_1.NotFoundError('Cadet entry not found or access denied');
        }
        res.status(200).json({
            success: true,
            message: 'Cadet entry deleted successfully',
            data: null
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCadetEntry = deleteCadetEntry;
const getCadetStats = async (req, res, next) => {
    try {
        // Build filter based on user role
        const filter = {};
        // District admins can ONLY see their own district stats
        if (req.user?.role === 'districtAdmin') {
            if (!req.user.district) {
                throw new errors_1.ValidationError('District information not found for district admin');
            }
            filter.district = req.user.district;
        }
        // State admins can ONLY see their own state stats
        else if (req.user?.role === 'stateAdmin') {
            if (!req.user.state) {
                throw new errors_1.ValidationError('State information not found for state admin');
            }
            filter.state = req.user.state;
        }
        const [totalEntries, byGender, byDistrict, recentEntries] = await Promise.all([
            cadet_1.Cadet.countDocuments(filter),
            cadet_1.Cadet.aggregate([
                { $match: filter },
                { $group: { _id: '$gender', count: { $sum: 1 } } }
            ]),
            cadet_1.Cadet.aggregate([
                { $match: filter },
                { $group: { _id: '$district', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            cadet_1.Cadet.find(filter)
                .sort({ createdAt: -1 })
                .limit(5)
                .select('entryId name state createdAt')
                .lean()
        ]);
        res.status(200).json({
            success: true,
            message: 'Statistics retrieved successfully',
            data: {
                totalEntries,
                byGender,
                byDistrict,
                recentEntries: recentEntries.map(entry => ({
                    id: entry._id.toString(),
                    entryId: entry.entryId,
                    name: entry.name,
                    state: entry.state,
                    createdAt: entry.createdAt || new Date()
                }))
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCadetStats = getCadetStats;
const getCadetsForDistrictAdmin = async (req, res, next) => {
    try {
        const userDistrict = req.user?.district;
        if (!userDistrict) {
            throw new errors_1.ValidationError('District information not found');
        }
        const page = Math.max(parseInt(req.query.page || '1', 10), 1);
        const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);
        const skip = (page - 1) * limit;
        // Filters
        const filter = { district: userDistrict };
        if (req.query.gender)
            filter.gender = req.query.gender;
        // Execute query with pagination
        const [cadets, total] = await Promise.all([
            cadet_1.Cadet.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            cadet_1.Cadet.countDocuments(filter)
        ]);
        res.status(200).json({
            success: true,
            message: 'Cadets retrieved successfully',
            data: {
                items: cadets.map(cadet => formatCadetResponse(cadet)),
                total,
                page,
                pageSize: limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCadetsForDistrictAdmin = getCadetsForDistrictAdmin;
const getDistrictCadetStats = async (req, res, next) => {
    try {
        const userDistrict = req.user?.district;
        if (!userDistrict) {
            throw new errors_1.ValidationError('District information not found');
        }
        const filter = { district: userDistrict };
        const [totalEntries, byGender, recentEntries] = await Promise.all([
            cadet_1.Cadet.countDocuments(filter),
            cadet_1.Cadet.aggregate([
                { $match: filter },
                { $group: { _id: '$gender', count: { $sum: 1 } } }
            ]),
            cadet_1.Cadet.find(filter)
                .sort({ createdAt: -1 })
                .limit(5)
                .select('entryId name state createdAt')
                .lean()
        ]);
        res.status(200).json({
            success: true,
            message: 'District statistics retrieved successfully',
            data: {
                totalEntries,
                byGender,
                byDistrict: [{ _id: userDistrict, count: totalEntries }],
                recentEntries: recentEntries.map(entry => ({
                    id: entry._id.toString(),
                    entryId: entry.entryId,
                    name: entry.name,
                    state: entry.state,
                    createdAt: entry.createdAt || new Date()
                }))
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDistrictCadetStats = getDistrictCadetStats;
