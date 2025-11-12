import { Request, Response } from 'express';
import { Poomsae } from '../models/poomsae';
import { PoomsaeFormGenerator } from '../services/poomsaeFormService';
import { poomsaeEntrySchema } from '../schemas/poomsaeSchemas';
import { ValidationError } from '../types/errors';
import { IPoomsae } from '../models/poomsae';
import { getNextSequence } from '../models/counter';
import { AuthRequest } from '../middleware/authMiddleware';

const formGenerator = new PoomsaeFormGenerator();

const formatPoomsaeResponse = (poomsae: IPoomsae): any => ({
  _id: (poomsae._id as any).toString(),
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
const generatePoomsaeEntryId = async (): Promise<string> => {
  const next = await getNextSequence('poomsae', async () => {
    // Fallback: find highest existing numeric portion if counter collection is missing
    const latest = await Poomsae.findOne().sort({ createdAt: -1 }).select('entryId').lean();
    const num = latest?.entryId?.split('-')[1];
    const parsed = num ? parseInt(num, 10) : 0;
    return isNaN(parsed) ? 0 : parsed;
  });
  const padded = next.toString().padStart(6, '0');
  return `PMS-${padded}`;
};

export const createPoomsaeEntry = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = poomsaeEntrySchema.safeParse(req);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.issues
      });
    }

    const entryData = validationResult.data.body as any;

    // Normalize and enforce TFI ID uniqueness only when provided
    if (entryData.tfiIdNo && String(entryData.tfiIdNo).trim() !== '') {
      const existing = await Poomsae.findOne({ tfiIdNo: entryData.tfiIdNo });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'TFI ID already exists'
        });
      }
    } else {
      entryData.tfiIdNo = '';
    }

    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any = null;
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
        const poomsae = await Poomsae.create({
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
      } catch (err: any) {
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

  } catch (error: any) {
    console.error('❌ Create poomsae entry error:', error);
    
    if (error.code === 11000) {
      // Differentiate which unique field caused the duplicate error
      const key = (error as any).keyPattern || (error as any).keyValue || {};
      let message = 'Duplicate value';
      if (key.tfiIdNo) message = 'TFI ID already exists';
      else if (key.entryId) message = 'Entry ID collision. Please retry.';
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

export const getAllPoomsaeEntries = async (req: AuthRequest, res: Response) => {
  try {
    console.log('📡 Poomsae API called with query:', req.query);
    
    // First check if we can connect to the database
    console.log('🔗 Checking database connection...');
    const mongoose = require('mongoose');
    console.log('📊 DB readyState:', mongoose.connection.readyState);
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Filters based on user role
    const filter: any = {};
    
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
      if (req.query.division) filter.division = req.query.division;
      if (req.query.category) filter.category = req.query.category;
    }

    console.log('🔍 Poomsae filter:', filter);
    console.log('⏳ Starting database query...');

    // Try a simple count first
    const totalCount = await Poomsae.countDocuments(filter);
    console.log(`📊 Total count query completed: ${totalCount}`);

    const entries = await Poomsae.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log('✅ Database query completed, found entries:', entries.length);

    console.log('🔄 Processing entries...');
    const processedData = entries.map(entry => {
      try {
        return formatPoomsaeResponse(entry as IPoomsae);
      } catch (err: any) {
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
  } catch (error: any) {
    console.error('❌ Poomsae API error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch entries'
    });
  }
};

export const getPoomsaeStats = async (req: AuthRequest, res: Response) => {
  try {
    // Build filter based on user role
    const filter: Record<string, any> = {};
    
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

    const totalEntries = await Poomsae.countDocuments(filter);
    
    const byDivision = await Poomsae.aggregate([
      { $match: filter },
      { $group: { _id: '$division', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const byCategory = await Poomsae.aggregate([
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch statistics'
    });
  }
};

export const deletePoomsaeEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { entryId } = req.params;
    
    // Build filter based on user role
    const filter: Record<string, any> = { entryId };
    
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

    const poomsae = await Poomsae.findOneAndDelete(filter);

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete entry'
    });
  }
};

export const getPoomsaeEntryById = async (req: AuthRequest, res: Response) => {
  try {
    const { entryId } = req.params;
    
    // Build filter based on user role
    const filter: Record<string, any> = { entryId };
    
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

    const poomsae = await Poomsae.findOne(filter);

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch entry'
    });
  }
};

// Get poomsae entries for district admin (filtered by their district)
export const getPoomsaeForDistrictAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const userDistrict = req.user?.district;
    if (!userDistrict) {
      return res.status(400).json({
        success: false,
        message: 'District information not found'
      });
    }

    const page = Math.max(parseInt(req.query.page as string || '1', 10), 1);
    const limit = Math.min(parseInt(req.query.limit as string || '10', 10), 100);
    const skip = (page - 1) * limit;

    // Filters
    const filter: Record<string, any> = { district: userDistrict };
    if (req.query.gender) filter.gender = req.query.gender;
    if (req.query.division) filter.division = req.query.division;
    if (req.query.category) filter.category = req.query.category;

    // Execute query with pagination
    const [poomsae, total] = await Promise.all([
      Poomsae.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Poomsae.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      message: 'Poomsae entries retrieved successfully',
      data: {
        items: poomsae.map(p => formatPoomsaeResponse(p as unknown as IPoomsae)),
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch poomsae entries'
    });
  }
};

// Get district poomsae statistics
export const getDistrictPoomsaeStats = async (req: AuthRequest, res: Response) => {
  try {
    const userDistrict = req.user?.district;
    if (!userDistrict) {
      return res.status(400).json({
        success: false,
        message: 'District information not found'
      });
    }

    const totalEntries = await Poomsae.countDocuments({ district: userDistrict });

    // Group by gender
    const byGender = await Poomsae.aggregate([
      { $match: { district: userDistrict } },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    // Group by division
    const byDivision = await Poomsae.aggregate([
      { $match: { district: userDistrict } },
      { $group: { _id: '$division', count: { $sum: 1 } } }
    ]);

    // Group by category
    const byCategory = await Poomsae.aggregate([
      { $match: { district: userDistrict } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Recent entries (last 10)
    const recentEntries = await Poomsae.find({ district: userDistrict })
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch district poomsae statistics'
    });
  }
};

