import { Request, Response } from 'express';
import { Cadet } from '../models/cadet';
import { ApplicationFormGenerator } from '../services/cadetFormService';

const formGenerator = new ApplicationFormGenerator();

// Generate unique entry ID
const generateCadetEntryId = async (): Promise<string> => {
  const count = await Cadet.countDocuments();
  const id = (count + 1).toString().padStart(6, '0');
  return `CAD-${id}`;
};

export const createCadetEntry = async (req: Request, res: Response) => {
  try {
    const {
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
      schoolName
    } = req.body;

    // Validation
    if (!gender || !name || !dateOfBirth || !parentGuardianName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Generate entry ID
    const entryId = await generateCadetEntryId();

    console.log(`📝 Creating cadet entry: ${entryId}`);

    // Generate application form image
    const formResult = await formGenerator.generateApplicationForm({
      entryId,
      gender,
      weightCategory,
      name: name.toUpperCase(),
      dateOfBirth,
      age,
      weight,
      parentGuardianName,
      state,
      presentBeltGrade,
      tfiIdCardNo,
      academicQualification,
      schoolName
    });

    console.log(`✅ Form generated: ${formResult.fileName}`);

    // Save to MongoDB
    const cadet = await Cadet.create({
      entryId,
      gender,
      weightCategory,
      name: name.toUpperCase(),
      dateOfBirth: new Date(dateOfBirth),
      age: parseInt(age),
      weight: parseFloat(weight),
      parentGuardianName,
      state,
      presentBeltGrade,
      tfiIdCardNo,
      academicQualification,
      schoolName,
      formFileName: formResult.fileName
    });

    console.log(`✅ Cadet saved to MongoDB: ${cadet._id}`);

    res.status(201).json({
      success: true,
      message: 'Cadet entry created successfully',
      data: {
        entryId: cadet.entryId,
        applicationNumber: cadet.entryId,
        downloadUrl: `${req.protocol}://${req.get('host')}${formResult.filePath}`,
        fileName: formResult.fileName,
        createdAt: cadet.createdAt
      }
    });

  } catch (error: any) {
    console.error('❌ Create cadet entry error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'TFI ID Card number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create entry'
    });
  }
};

export const getAllCadetEntries = async (req: Request, res: Response) => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const filter: any = {};
    if (req.query.state) filter.state = req.query.state;
    if (req.query.gender) filter.gender = req.query.gender;

    const cadets = await Cadet.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await Cadet.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: cadets.length,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      data: cadets
    });
  } catch (error: any) {
    console.error('❌ Get cadet entries error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch entries'
    });
  }
};

export const getCadetEntryById = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const cadet = await Cadet.findOne({ entryId });

    if (!cadet) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: cadet
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch entry'
    });
  }
};

export const deleteCadetEntry = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const cadet = await Cadet.findOneAndDelete({ entryId });

    if (!cadet) {
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

export const getCadetStats = async (req: Request, res: Response) => {
  try {
    const totalEntries = await Cadet.countDocuments();
    
    const byGender = await Cadet.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);
    
    const byState = await Cadet.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentEntries = await Cadet.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('entryId name state createdAt');

    res.status(200).json({
      success: true,
      data: {
        totalEntries,
        byGender,
        byState,
        recentEntries
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch statistics'
    });
  }
};
