"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoomsaeEntryById = exports.deletePoomsaeEntry = exports.getPoomsaeStats = exports.getAllPoomsaeEntries = exports.createPoomsaeEntry = void 0;
const poomsae_1 = require("../models/poomsae");
const poomsaeFormService_1 = require("../services/poomsaeFormService");
const poomsaeSchemas_1 = require("../schemas/poomsaeSchemas");
const formGenerator = new poomsaeFormService_1.PoomsaeFormGenerator();
const formatPoomsaeResponse = (poomsae) => ({
    id: poomsae._id.toString(),
    entryId: poomsae.entryId,
    division: poomsae.division,
    category: poomsae.category,
    gender: poomsae.gender,
    name: poomsae.name,
    stateOrg: poomsae.stateOrg,
    district: poomsae.district,
    dateOfBirth: poomsae.dateOfBirth.toISOString(),
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
    createdAt: poomsae.createdAt?.toISOString()
});
// Generate unique entry ID
const generatePoomsaeEntryId = async () => {
    const count = await poomsae_1.Poomsae.countDocuments();
    const id = (count + 1).toString().padStart(6, '0');
    return `PMS-${id}`;
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
        // Generate entry ID
        const entryId = await generatePoomsaeEntryId();
        console.log(`📝 Creating poomsae entry: ${entryId}`);
        // Generate form
        const formResult = await formGenerator.generatePoomsaeForm({
            entryId,
            ...entryData,
            name: entryData.name.toUpperCase()
        });
        console.log(`✅ Form generated: ${formResult.fileName}`);
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
        res.status(201).json({
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
    catch (error) {
        console.error('❌ Create poomsae entry error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'TFI ID or Dan Certificate number already exists'
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.division)
            filter.division = req.query.division;
        if (req.query.category)
            filter.category = req.query.category;
        const entries = await poomsae_1.Poomsae.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const totalCount = await poomsae_1.Poomsae.countDocuments(filter);
        res.status(200).json({
            success: true,
            message: 'Poomsae entries retrieved successfully',
            data: entries.map(entry => formatPoomsaeResponse(entry)),
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            totalItems: totalCount
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch entries'
        });
    }
};
exports.getAllPoomsaeEntries = getAllPoomsaeEntries;
const getPoomsaeStats = async (req, res) => {
    try {
        const totalEntries = await poomsae_1.Poomsae.countDocuments();
        const byDivision = await poomsae_1.Poomsae.aggregate([
            { $group: { _id: '$division', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const byCategory = await poomsae_1.Poomsae.aggregate([
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
        const poomsae = await poomsae_1.Poomsae.findOneAndDelete({ entryId });
        if (!poomsae) {
            return res.status(404).json({
                success: false,
                message: 'Entry not found'
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
        const poomsae = await poomsae_1.Poomsae.findOne({ entryId });
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
