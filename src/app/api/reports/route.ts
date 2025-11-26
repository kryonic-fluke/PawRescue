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

    // Validate required fields
    if (!reportData.reporterEmail || !reportData.reporterName || !reportData.animalType || !reportData.location) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    // Insert report into database
    const [newReport] = await db.insert(reports).values({
      ...reportData,
      status: 'pending'
    }).returning();

    // Send email notification
    await sendReportEmail({
      to: reportData.reporterEmail,
      report: newReport,
      reportId: newReport.id
    });

    return res.json({
      success: true,
      report: newReport
    });

  } catch (error) {
    console.error('Error submitting report:', error);
    return res.status(500).json({ 
      error: 'Failed to submit report' 
    });
  }
});

// GET /api/reports - Get all reports
router.get('/', async (req, res) => {
  try {
    const allReports = await db.select().from(reports);
    return res.json(allReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch reports' 
    });
  }
});

export default router;