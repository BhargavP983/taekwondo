import { Request, Response } from 'express';
import { CadetDataManager } from '../utils/CadetDataManager';
import { ApplicationFormGenerator } from '../services/cadetFormService';

const formGenerator = new ApplicationFormGenerator();

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

    // Validate required fields
    if (!gender || !name || !dateOfBirth || !parentGuardianName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Save entry
    const entryId = CadetDataManager.addEntry({
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

    // Generate application form
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

    res.status(201).json({
      success: true,
      message: 'Cadet entry created successfully',
      data: {
        entryId,
        applicationNumber: entryId,
        downloadUrl: `${req.protocol}://${req.get('host')}${formResult.filePath}`,
        fileName: formResult.fileName
      }
    });
  } catch (error: any) {
    console.error('Create cadet entry error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create entry'
    });
  }
};

export const getAllCadetEntries = async (req: Request, res: Response) => {
  try {
    const entries = CadetDataManager.getAllEntries();
    
    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    console.error('Get cadet entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entries'
    });
  }
};

export const getCadetEntryById = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const entry = CadetDataManager.getEntryById(entryId);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Get cadet entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entry'
    });
  }
};

export const downloadApplicationForm = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const entry = CadetDataManager.getEntryById(entryId);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }

    // Regenerate form
    const formResult = await formGenerator.generateApplicationForm(entry);

    res.status(200).json({
      success: true,
      data: {
        downloadUrl: `${req.protocol}://${req.get('host')}${formResult.filePath}`,
        fileName: formResult.fileName
      }
    });
  } catch (error) {
    console.error('Download application form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate form'
    });
  }
};

export const deleteCadetEntry = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const deleted = CadetDataManager.deleteEntry(entryId);

    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'Entry deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }
  } catch (error) {
    console.error('Delete cadet entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete entry'
    });
  }
};

export const getCadetStats = async (req: Request, res: Response) => {
  try {
    const stats = CadetDataManager.getStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get cadet stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};
