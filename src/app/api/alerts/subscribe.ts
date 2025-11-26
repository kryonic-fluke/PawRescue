// src/pages/api/alerts/subscribe.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { adoptionAlerts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { userId, email, phone, type, breed, ageRange, size, location } = req.body;

      const [alert] = await db
        .insert(adoptionAlerts)
        .values({
          userId,
          email,
          phone,
          type,
          breed,
          ageRange,
          size,
          location,
          active: true
        })
        .returning();

      return res.status(201).json({ success: true, data: alert });
    } catch (error) {
      console.error('Error creating adoption alert:', error);
      return res.status(500).json({ success: false, error: 'Failed to create alert' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}