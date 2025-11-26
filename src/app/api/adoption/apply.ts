// src/pages/api/adoption/apply.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { adoptionApplications, pets } from '@/lib/db/schema';
import { and,eq } from 'drizzle-orm';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { petId, userId, ...applicationData } = req.body;

      // Verify pet exists and is available
      const pet = await db
        .select()
        .from(pets)
        .where(and(eq(pets.id, petId), eq(pets.status, 'available')))
        .limit(1);

      if (!pet.length) {
        return res.status(400).json({ success: false, error: 'Pet not available for adoption' });
      }

      // Create application
      const [application] = await db
        .insert(adoptionApplications)
        .values({
          petId,
          userId: userId || null,
          status: 'pending',
          ...applicationData,
        })
        .returning();

      // Update pet status
      await db
        .update(pets)
        .set({ status: 'pending' })
        .where(eq(pets.id, petId));

      // Send confirmation email
      if (process.env.NODE_ENV === 'production') {
        await resend.emails.send({
          from: 'adoptions@pawrescue.org',
          to: applicationData.email,
          subject: `Adoption Application Received - ${pet[0].name}`,
          text: `Thank you for your interest in adopting ${pet[0].name}!\n\n` +
                `We've received your application and will review it shortly. ` +
                `Our team will contact you at ${applicationData.phone} or ${applicationData.email} ` +
                `within 2-3 business days.\n\n` +
                `Application ID: ${application.id}\n` +
                `Pet: ${pet[0].name} (${pet[0].type})\n` +
                `Shelter: ${pet[0].shelterId}\n\n` +
                `Thank you for choosing adoption!`
        });
      }

      return res.status(201).json({ success: true, data: application });
    } catch (error) {
      console.error('Error submitting adoption application:', error);
      return res.status(500).json({ success: false, error: 'Failed to submit application' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}