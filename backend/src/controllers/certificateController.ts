import { Request, Response } from 'express';
import { CertificateService } from '../services/certificateService';

const certificateService = new CertificateService();

export const generateCertificate = async (req: Request, res: Response) => {
  try {
    const { name, date, grade } = req.body;

    // Validation
    if (!name || !date || !grade) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, date, grade'
      });
    }

    // Generate certificate
    const result = await certificateService.generateCertificate({ name, date, grade });

    // Send response
    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully',
      data: {
        serialNumber: result.serialNumber,
        downloadUrl: `${req.protocol}://${req.get('host')}${result.filePath}`,
        fileName: result.fileName
      }
    });
  } catch (error: any) {
    console.error('Generate certificate error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate certificate'
    });
  }
};

export const listCertificates = async (req: Request, res: Response) => {
  try {
    const certificates = certificateService.getAllCertificates();
    
    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates.map(fileName => ({
        fileName,
        url: `${req.protocol}://${req.get('host')}/certificates/${fileName}`
      }))
    });
  } catch (error) {
    console.error('List certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates'
    });
  }
};

export const deleteCertificate = async (req: Request, res: Response) => {
  try {
    const { fileName } = req.params;
    const deleted = certificateService.deleteCertificate(fileName);

    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'Certificate deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
  } catch (error) {
    console.error('Delete certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete certificate'
    });
  }
};
