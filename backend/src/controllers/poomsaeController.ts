import { Request, Response } from 'express';
import { PoomsaeDataManager } from '../utils/poomsaeDataManager';
import { PoomsaeFormGenerator } from '../services/poomsaeFormService';

const formGenerator = new PoomsaeFormGenerator();

export const createPoomsaeEntry = async (req: Request, res: Response) => {
  try {
    const entryData = req.body;

    if (!entryData.name || !entryData.division || !entryData.gender) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const entryId = PoomsaeDataManager.addEntry({
      ...entryData,
      name: entryData.name.toUpperCase()
    });

    const formResult = await formGenerator.generatePoomsaeForm({
      entryId,
      ...entryData,
      name: entryData.name.toUpperCase()
    });

    res.status(201).json({
      success: true,
      message: 'Poomsae entry created successfully',
      data: {
        entryId,
        applicationNumber: entryId,
        downloadUrl: `${req.protocol}://${req.get('host')}${formResult.filePath}`,
        fileName: formResult.fileName
      }
    });
  } catch (error: any) {
    console.error('Create poomsae entry error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create entry'
    });
  }
};

export const getAllPoomsaeEntries = async (req: Request, res: Response) => {
  try {
    const entries = PoomsaeDataManager.getAllEntries();
    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entries'
    });
  }
};
