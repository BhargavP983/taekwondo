import { Response } from 'express';
import ExcelJS from 'exceljs';
import { Cadet } from '../models/cadet';
import { Poomsae } from '../models/poomsae';
import { AuthRequest } from '../middleware/authMiddleware';

// Export Cadet Applications to Excel
export const exportCadets = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;
    const userState = req.user?.state;
    const userDistrict = req.user?.district;

    // Build filter based on role
    const filter: Record<string, any> = {};

    if (userRole === 'districtAdmin') {
      filter.district = userDistrict;
    } else if (userRole === 'stateAdmin') {
      filter.state = userState;
    }
    // SuperAdmin can export all

    // Fetch all cadets based on filter
    const cadets = await Cadet.find(filter).sort({ createdAt: -1 }).lean();

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Cadet Applications');

    // Define columns with headers
    worksheet.columns = [
      { header: 'Entry ID', key: 'entryId', width: 15 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Weight Category', key: 'weightCategory', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Date of Birth', key: 'dob', width: 15 },
      { header: 'Age', key: 'age', width: 8 },
      { header: 'Weight (kg)', key: 'weight', width: 12 },
      { header: 'Parent/Guardian Name', key: 'parent', width: 25 },
      { header: 'State', key: 'state', width: 20 },
      { header: 'Present Belt Grade', key: 'beltGrade', width: 18 },
      { header: 'TFI ID No', key: 'tfiId', width: 15 },
      { header: 'Academic Qualification', key: 'qualification', width: 22 },
      { header: 'School', key: 'school', width: 30 },
      { header: 'District', key: 'district', width: 20 },
      { header: 'Form Path', key: 'formPath', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data rows
    cadets.forEach(cadet => {
      worksheet.addRow({
        entryId: cadet.entryId || '',
        gender: cadet.gender || '',
        weightCategory: cadet.weightCategory || '',
        name: cadet.name || '',
        dob: cadet.dateOfBirth ? new Date(cadet.dateOfBirth).toLocaleDateString('en-IN') : '',
        age: cadet.age || '',
        weight: cadet.weight || '',
        parent: cadet.parentGuardianName || '',
        state: cadet.state || '',
        beltGrade: cadet.presentBeltGrade || '',
        tfiId: cadet.tfiIdCardNo || '',
        qualification: cadet.academicQualification || '',
        school: cadet.schoolName || '',
        district: cadet.district || '',
        formPath: cadet.formFileName || '',
        createdAt: cadet.createdAt ? new Date(cadet.createdAt).toLocaleString('en-IN') : ''
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Generate filename based on role
    const date = new Date().toISOString().split('T')[0];
    let filename = '';
    
    if (userRole === 'districtAdmin') {
      const districtName = userDistrict?.replace(/\s+/g, '_') || 'Unknown_District';
      filename = `${districtName}_Cadet_${date}.xlsx`;
    } else if (userRole === 'stateAdmin') {
      const stateName = userState?.replace(/\s+/g, '_') || 'Unknown_State';
      filename = `${stateName}_Cadet_${date}.xlsx`;
    } else {
      // SuperAdmin
      filename = `All_Cadet_Applications_${date}.xlsx`;
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error: any) {
    console.error('Export cadets error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to export cadet applications'
    });
  }
};

// Export Poomsae Applications to Excel
export const exportPoomsae = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;
    const userState = req.user?.state;
    const userDistrict = req.user?.district;

    // Build filter based on role
    const filter: Record<string, any> = {};

    if (userRole === 'districtAdmin') {
      filter.district = userDistrict;
    } else if (userRole === 'stateAdmin') {
      filter.stateOrg = userState;
    }
    // SuperAdmin can export all

    // Fetch all poomsae based on filter
    const poomsaeList = await Poomsae.find(filter).sort({ createdAt: -1 }).lean();

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Poomsae Applications');

    // Define columns with headers
    worksheet.columns = [
      { header: 'Entry ID', key: 'entryId', width: 15 },
      { header: 'Division', key: 'division', width: 12 },
      { header: 'Category', key: 'category', width: 12 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'State/Organization', key: 'stateOrg', width: 20 },
      { header: 'District', key: 'district', width: 20 },
      { header: 'Date of Birth', key: 'dob', width: 15 },
      { header: 'Age', key: 'age', width: 8 },
      { header: 'Weight (kg)', key: 'weight', width: 12 },
      { header: 'Parent/Guardian Name', key: 'parent', width: 25 },
      { header: 'Mobile No', key: 'mobile', width: 15 },
      { header: 'Current Belt Grade', key: 'beltGrade', width: 18 },
      { header: 'TFI ID No', key: 'tfiId', width: 15 },
      { header: 'Dan Certificate No', key: 'danCert', width: 20 },
      { header: 'Academic Qualification', key: 'qualification', width: 22 },
      { header: 'College Name', key: 'college', width: 30 },
      { header: 'Board/University', key: 'board', width: 25 },
      { header: 'Form Path', key: 'formPath', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6F42C1' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data rows
    poomsaeList.forEach(poomsae => {
      worksheet.addRow({
        entryId: poomsae.entryId || '',
        division: poomsae.division || '',
        category: poomsae.category || '',
        gender: poomsae.gender || '',
        name: poomsae.name || '',
        stateOrg: poomsae.stateOrg || '',
        district: poomsae.district || '',
        dob: poomsae.dateOfBirth ? new Date(poomsae.dateOfBirth).toLocaleDateString('en-IN') : '',
        age: poomsae.age || '',
        weight: poomsae.weight || '',
        parent: poomsae.parentGuardianName || '',
        mobile: poomsae.mobileNo || '',
        beltGrade: poomsae.currentBeltGrade || '',
        tfiId: poomsae.tfiIdNo || '',
        danCert: poomsae.danCertificateNo || '',
        qualification: poomsae.academicQualification || '',
        college: poomsae.nameOfCollege || '',
        board: poomsae.nameOfBoardUniversity || '',
        formPath: poomsae.formFileName || '',
        createdAt: poomsae.createdAt ? new Date(poomsae.createdAt).toLocaleString('en-IN') : ''
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Generate filename based on role
    const date = new Date().toISOString().split('T')[0];
    let filename = '';
    
    if (userRole === 'districtAdmin') {
      const districtName = userDistrict?.replace(/\s+/g, '_') || 'Unknown_District';
      filename = `${districtName}_Poomsae_${date}.xlsx`;
    } else if (userRole === 'stateAdmin') {
      const stateName = userState?.replace(/\s+/g, '_') || 'Unknown_State';
      filename = `${stateName}_Poomsae_${date}.xlsx`;
    } else {
      // SuperAdmin
      filename = `All_Poomsae_Applications_${date}.xlsx`;
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error: any) {
    console.error('Export poomsae error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to export poomsae applications'
    });
  }
};
