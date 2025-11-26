// src/app/api/reports.ts
import { Router } from 'express';
import { db } from '@/lib/db';
import { reports } from '@/lib/db/reports';
import { sendReportEmail } from '@/lib/email/report-email';

const router = Router();

// POST /api/reports - Create a new report
router.post('/', async (req, res) => {
  try {
    const reportData = req.body;

    // Validate required fields (accept both camelCase and snake_case)
    const reporterEmail = reportData.reporter_email || reportData.reporterEmail;
    const reporterName = reportData.reporter_name || reportData.reporterName;
    const animalType = reportData.animal_type || reportData.animalType;

    if (!reporterEmail || !reporterName || !animalType || !reportData.location) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          reporter_email: !reporterEmail ? 'Email is required' : undefined,
          reporter_name: !reporterName ? 'Name is required' : undefined,
          animal_type: !animalType ? 'Animal type is required' : undefined,
          location: !reportData.location ? 'Location is required' : undefined
        }
      });
    }

    // Insert report into database with consistent field names
    const reportToInsert = {
      reporter_name: reporterName,
      reporter_email: reporterEmail,
      reporter_phone: reportData.reporter_phone || reportData.reporterPhone || '',
      animal_type: animalType,
      breed: reportData.breed || '',
      color: reportData.color || '',
      location: reportData.location,
      city: reportData.city || reportData.location.split(',')[0] || 'Unknown',
      description: reportData.description || '',
      urgency: reportData.urgency || 'medium',
      has_injuries: reportData.has_injuries || false,
      injuries_description: reportData.injuries_description || '',
      is_dangerous: reportData.is_dangerous || false,
      additional_info: reportData.additional_info || '',
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    };

    const [newReport] = await db.insert(reports)
      .values(reportToInsert)
      .returning();

    // Send email notification
    await sendReportEmail({
      to: reporterEmail,
      report: newReport,
      reportId: newReport.id
    });

    return res.json({
      success: true,
      report: newReport
    });

  } catch (error) {
    console.error('Error submitting report:', error);
    return res.status(500).json({ error: 'Failed to submit report' });
  }
});

// GET /api/reports - Get all reports
router.get('/', async (req, res) => {
  try {
    const allReports = await db.select().from(reports);
    return res.json(allReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

export default router;