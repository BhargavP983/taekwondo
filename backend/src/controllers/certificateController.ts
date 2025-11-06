import { Request, Response } from 'express';
import { CertificateService } from '../services/certificateService';
import { AuthRequest } from '../middleware/authMiddleware';

const certificateService = new CertificateService();

export const createCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { name, date, grade } = req.body;

    if (!name || !date || !grade) {
      return res.status(400).json({ success: false, message: 'Name, date, and grade are required.' });
    }

    const generatedBy = req.user?.userId || req.user?.email || 'system';

    // Service handles both image file and MongoDB record
    const cert = await certificateService.generateAndSaveCertificate({
      name,
      date,
      grade,
      generatedBy
    });

    res.status(201).json({ success: true, data: { ...cert, previewUrl: `http://localhost:5000${cert.filePath}` } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, message });
  }
};

/**
 * Get all certificates (returns MongoDB records, not files).
 */
export const getCertificates = async (req: Request, res: Response) => {
  try {
    const certs = await certificateService.listAllCertificates();
    res.json({ success: true, data: certs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch certificates' });
  }
};

/**
 * Delete a certificate by ID (deletes both DB record and image file).
 */
export const deleteCertificate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Certificate id required' });

    const deleted = await certificateService.deleteCertificateById(id);
    if (deleted) {
      res.json({ success: true, message: 'Certificate deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Certificate not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete certificate' });
  }
};

/**
 * Optionally: Get stats
 */
export const getCertificateStats = async (_: Request, res: Response) => {
  try {
    const stats = await certificateService.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};
