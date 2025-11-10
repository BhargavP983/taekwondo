import { Response, NextFunction } from 'express';
import { Cadet } from '../models/cadet';
import { getNextSequence } from '../models/counter';
import { CadetFormGenerator } from '../services/cadetFormService';
import { AuthRequest } from '../middleware/authMiddleware';
import { CadetData, ApiResponse, PaginatedResponse } from '../types/api';
import { ValidationError, NotFoundError } from '../types/errors';
import { ICadetDocument, IFormGeneratorResult } from '../models/interfaces';
import { isValidObjectId } from 'mongoose';
import { CadetQuery, RouteParams } from '../types/express';

const formGenerator = new CadetFormGenerator();

const formatCadetResponse = (cadet: ICadetDocument): CadetData => ({
  id: cadet._id.toString(),
  entryId: cadet.entryId,
  name: cadet.name,
  dateOfBirth: cadet.dateOfBirth.toISOString(),
  gender: cadet.gender as 'male' | 'female' | 'other',
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
  formFileName: (cadet as any).formFileName,
  createdAt: (cadet as any).createdAt?.toISOString?.() || (cadet as any).createdAt,
  formDownloadUrl: (cadet as any).formFileName ? `${process.env.BASE_URL || 'http://localhost:5000'}/forms/${(cadet as any).formFileName}` : undefined
});

interface CadetFormData {
  entryId?: string;
  gender: 'male' | 'female' | 'other' | 'Boy' | 'Girl';
  weightCategory?: string;
  name: string;
  dateOfBirth: string;
  age: string;
  parentGuardianName: string;
  state: string;
  district: string;
  presentBeltGrade: string;
  tfiIdCardNo?: string;
  academicQualification?: string;
  schoolName?: string;
  weight?: string;
}

// Generate unique entry ID (atomic counter)
const generateCadetEntryId = async (): Promise<string> => {
  const next = await getNextSequence('cadet', async () => {
    // fallback initial: compute max existing numeric portion
    const latest = await Cadet.findOne().sort({ createdAt: -1 }).select('entryId').lean();
    const num = latest?.entryId?.split('-')[1];
    const parsed = num ? parseInt(num, 10) : 0;
    return isNaN(parsed) ? 0 : parsed;
  });
  const id = next.toString().padStart(6, '0');
  return `CAD-${id}`;
};

export const createCadetEntry = async (
  req: AuthRequest<{}, ApiResponse<CadetData>, CadetFormData>, 
  res: Response<ApiResponse<CadetData>>, 
  next: NextFunction
) => {
  try {
    let {
      gender,
      weightCategory,
      name,
      dateOfBirth,
      age,
      weight,
      parentGuardianName,
      state,
      presentBeltGrade,
      tfiIdCardNo,
      academicQualification,
      schoolName,
      district
    } = req.body;

    // Normalize gender values from UI (Boy/Girl) to schema enum values
  if (gender === 'Boy') gender = 'male';
  if (gender === 'Girl') gender = 'female';

    // Parse numeric values once (these do not depend on entryId)
    const parsedAge = parseInt(age, 10);
    const parsedWeight = weight ? parseFloat(weight) : undefined;

    if (isNaN(parsedAge)) {
      throw new ValidationError('Invalid age format');
    }
    if (weight && parsedWeight !== undefined && isNaN(parsedWeight)) {
      throw new ValidationError('Invalid weight format');
    }

    // Enforce TFI uniqueness only when provided (non-empty)
    if (tfiIdCardNo && tfiIdCardNo.trim() !== '') {
      const existingCadet = await Cadet.findOne({ tfiIdCardNo });
      if (existingCadet) {
        throw new ValidationError('TFI ID Card number already exists');
      }
    } else {
      tfiIdCardNo = '' as any; // normalize blank
    }

    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any = null;
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
      }) as IFormGeneratorResult;

      if (!formResult.success) {
        throw new ValidationError(formResult.message || 'Failed to generate form');
      }
      console.log(`✅ Form generated: ${formResult.fileName}`);

      try {
        const cadetDoc = await Cadet.create({
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
      } catch (err: any) {
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
    throw new ValidationError('Entry ID collision. Please retry.');

  } catch (error) {
    next(error);
  }
};

export const getAllCadetEntries = async (
  req: AuthRequest<{}, PaginatedResponse<CadetData>, {}, CadetQuery>,
  res: Response<PaginatedResponse<CadetData>>,
  next: NextFunction
) => {
  try {
    // Pagination
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);
    const skip = (page - 1) * limit;

  // Filters
  const filter: Record<string, any> = {};
  if (req.query.district) filter.district = req.query.district;
  if (req.query.state) filter.state = req.query.state;
  if (req.query.gender) filter.gender = req.query.gender;

    // Execute query with pagination
    const [cadets, total] = await Promise.all([
      Cadet.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Cadet.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      message: 'Cadets retrieved successfully',
      data: {
        items: cadets.map(cadet => formatCadetResponse(cadet as unknown as ICadetDocument)),
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCadetByEntryId = async (
  req: AuthRequest<{ entryId: string }, ApiResponse<CadetData>>,
  res: Response<ApiResponse<CadetData>>,
  next: NextFunction
) => {
  try {
    const { entryId } = req.params;
    const cadet = await Cadet.findOne({ entryId });

    if (!cadet) {
      throw new NotFoundError('Cadet entry not found');
    }

    res.status(200).json({
      success: true,
      message: 'Cadet entry retrieved successfully',
      data: formatCadetResponse(cadet)
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCadetEntry = async (
  req: AuthRequest<{ entryId: string }, ApiResponse<null>>,
  res: Response<ApiResponse<null>>,
  next: NextFunction
) => {
  try {
    const { entryId } = req.params;
    const cadet = await Cadet.findOneAndDelete({ entryId });

    if (!cadet) {
      throw new NotFoundError('Cadet entry not found');
    }

    res.status(200).json({
      success: true,
      message: 'Cadet entry deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

interface CadetStats {
  totalEntries: number;
  byGender: Array<{ _id: string; count: number }>;
  byDistrict: Array<{ _id: string; count: number }>;
  recentEntries: Array<{
    id: string;
    entryId: string;
    name: string;
    state: string;
    createdAt: Date;
  }>;
}

export const getCadetStats = async (
  req: Request,
  res: Response<ApiResponse<CadetStats>>,
  next: NextFunction
) => {
  try {
    const [totalEntries, byGender, byDistrict, recentEntries] = await Promise.all([
      Cadet.countDocuments(),
      Cadet.aggregate([
        { $group: { _id: '$gender', count: { $sum: 1 } } }
      ]),
      Cadet.aggregate([
        { $group: { _id: '$district', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Cadet.find()
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
  } catch (error) {
    next(error);
  }
};

export const getCadetsForDistrictAdmin = async (
  req: AuthRequest<{}, {}, {}, CadetQuery>,
  res: Response<PaginatedResponse<CadetData>>,
  next: NextFunction
) => {
  try {
    const userDistrict = req.user?.district;
    if (!userDistrict) {
      throw new ValidationError('District information not found');
    }

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);
    const skip = (page - 1) * limit;

    // Filters
    const filter: Record<string, any> = { district: userDistrict };
    if (req.query.gender) filter.gender = req.query.gender;

    // Execute query with pagination
    const [cadets, total] = await Promise.all([
      Cadet.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Cadet.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      message: 'Cadets retrieved successfully',
      data: {
        items: cadets.map(cadet => formatCadetResponse(cadet as unknown as ICadetDocument)),
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
