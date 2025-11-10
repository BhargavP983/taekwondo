import { Request, Response } from 'express';
import { Poomsae } from '../models/poomsae';
import { PoomsaeFormGenerator } from '../services/poomsaeFormService';
import { poomsaeEntrySchema } from '../schemas/poomsaeSchemas';
import { ValidationError } from '../types/errors';
import { IPoomsae } from '../models/poomsae';
import { getNextSequence } from '../models/counter';

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
  formDownloadUrl: poomsae.formFileName ? `${process.env.BASE_URL || 'http://localhost:5000'}/forms/${poomsae.formFileName}` : undefined,
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

export const getAllPoomsaeEntries = async (req: Request, res: Response) => {
  try {
    console.log('📡 Poomsae API called with query:', req.query);
    
    // First check if we can connect to the database
    console.log('🔗 Checking database connection...');
    const mongoose = require('mongoose');
    console.log('📊 DB readyState:', mongoose.connection.readyState);
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.division) filter.division = req.query.division;
    if (req.query.category) filter.category = req.query.category;

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

export const getPoomsaeStats = async (req: Request, res: Response) => {
  try {
    const totalEntries = await Poomsae.countDocuments();
    
    const byDivision = await Poomsae.aggregate([
      { $group: { _id: '$division', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const byCategory = await Poomsae.aggregate([
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

export const deletePoomsaeEntry = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const poomsae = await Poomsae.findOneAndDelete({ entryId });

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete entry'
    });
  }
};

export const getPoomsaeEntryById = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const poomsae = await Poomsae.findOne({ entryId });

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
