import { Request, Response } from 'express';
import { Poomsae } from '../models/poomsae';
import { PoomsaeFormGenerator } from '../services/poomsaeFormService';

const formGenerator = new PoomsaeFormGenerator();

// Generate unique entry ID
const generatePoomsaeEntryId = async (): Promise<string> => {
  const count = await Poomsae.countDocuments();
  const id = (count + 1).toString().padStart(6, '0');
  return `PMS-${id}`;
};

export const createPoomsaeEntry = async (req: Request, res: Response) => {
  try {
    const entryData = req.body;

    // Validation
    if (!entryData.name || !entryData.division || !entryData.gender) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

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

  } catch (error: any) {
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

export const getAllPoomsaeEntries = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.division) filter.division = req.query.division;
    if (req.query.category) filter.category = req.query.category;

    const entries = await Poomsae.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await Poomsae.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: entries.length,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      data: entries
    });
  } catch (error: any) {
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
