"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCadetsForDistrictAdmin = exports.getCadetStats = exports.deleteCadetEntry = exports.getCadetByEntryId = exports.getAllCadetEntries = exports.createCadetEntry = void 0;
const cadet_1 = require("../models/cadet");
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
    applicationStatus: cadet.applicationStatus || 'pending'
});
// Generate unique entry ID
const generateCadetEntryId = async () => {
    const count = await cadet_1.Cadet.countDocuments();
    const id = (count + 1).toString().padStart(6, '0');
    return `CAD-${id}`;
};
const createCadetEntry = async (req, res, next) => {
    try {
        const { gender, weightCategory, name, dateOfBirth, age, weight, parentGuardianName, state, presentBeltGrade, tfiIdCardNo, academicQualification, schoolName, district } = req.body;
        // Generate entry ID
        const entryId = await generateCadetEntryId();
        console.log(`📝 Creating cadet entry: ${entryId}`);
        // Parse numeric values
        const parsedAge = parseInt(age, 10);
        const parsedWeight = weight ? parseFloat(weight) : undefined;
        if (isNaN(parsedAge)) {
            throw new errors_1.ValidationError('Invalid age format');
        }
        if (weight && parsedWeight !== undefined && isNaN(parsedWeight)) {
            throw new errors_1.ValidationError('Invalid weight format');
        }
        // Check if TFI ID Card number already exists
        if (tfiIdCardNo) {
            const existingCadet = await cadet_1.Cadet.findOne({ tfiIdCardNo });
            if (existingCadet) {
                throw new errors_1.ValidationError('TFI ID Card number already exists');
            }
        }
        // Generate application form
        const formResult = await formGenerator.generateCadetForm({
            entryId,
            gender,
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
        // Save to MongoDB
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
        const cadet = cadetDoc.toObject();
        console.log(`✅ Cadet saved to MongoDB: ${cadet._id}`);
        // Return success response with properly typed data
        res.status(201).json({
            success: true,
            message: 'Cadet entry created successfully',
            data: {
                ...formatCadetResponse(cadetDoc),
                formPath: formResult.filePath,
                downloadUrl: `${req.protocol}://${req.get('host')}${formResult.filePath}`
            }
        });
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
        // Filters
        const filter = {};
        if (req.query.district)
            filter.district = req.query.district;
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
        const cadet = await cadet_1.Cadet.findOne({ entryId });
        if (!cadet) {
            throw new errors_1.NotFoundError('Cadet entry not found');
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
        const cadet = await cadet_1.Cadet.findOneAndDelete({ entryId });
        if (!cadet) {
            throw new errors_1.NotFoundError('Cadet entry not found');
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
        const [totalEntries, byGender, byDistrict, recentEntries] = await Promise.all([
            cadet_1.Cadet.countDocuments(),
            cadet_1.Cadet.aggregate([
                { $group: { _id: '$gender', count: { $sum: 1 } } }
            ]),
            cadet_1.Cadet.aggregate([
                { $group: { _id: '$district', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            cadet_1.Cadet.find()
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
