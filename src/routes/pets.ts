import { Router } from 'express';
import { db } from '../db/index.js';
import { pets, organizations, adoptions, pet_alerts } from '../db/schema.js';
import { eq, and, or, sql, gte, lte, ilike, inArray } from 'drizzle-orm';
import { authenticate } from '../middleware/auth.js';
import { z } from 'zod';
import { generateAdoptionReceipt } from '../services/receiptService.js';
import { sendEmail } from '../services/emailservice.js';

const router = Router();

// Input validation schemas
const adoptionSchema = z.object({
  pet_id: z.string().uuid(),
  applicant_name: z.string().min(2).max(100),
  applicant_email: z.string().email(),
  applicant_phone: z.string().min(10).max(15),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  message: z.string().max(1000).optional(),
  send_notification_to_org: z.boolean().default(true)
});

const alertSchema = z.object({
  criteria: z.object({
    species: z.string().optional(),
    breed: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    age_min: z.number().min(0).max(30).optional(),
    age_max: z.number().min(0).max(30).optional(),
    size: z.enum(['small', 'medium', 'large']).optional(),
    gender: z.enum(['M', 'F', 'Unknown']).optional()
  }),
  notification_type: z.enum(['email', 'push', 'both']).default('email'),
  device_token: z.string().optional()
});

/**
 * @openapi
 * /api/pets:
 *   get:
 *     summary: Get pets with filtering options
 *     tags: [Pets]
 *     parameters:
 *       - in: query
 *         name: species
 *         schema:
 *           type: string
 *         description: Filter by species (e.g., 'dog', 'cat')
 *       - in: query
 *         name: breed
 *         schema:
 *           type: string
 *         description: Filter by breed
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         description: Filter by district
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, adopted, pending, reserved]
 *         description: Filter by adoption status
 *       - in: query
 *         name: age_min
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Minimum age in months
 *       - in: query
 *         name: age_max
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Maximum age in months
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *           enum: [small, medium, large]
 *         description: Filter by size
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [M, F, Unknown]
 *         description: Filter by gender
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search term for name or description
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: List of pets matching the criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 pets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pet'
 */
router.get('/', async (req, res) => {
  try {
    const {
      species,
      breed,
      city,
      district,
      status = 'available',
      age_min,
      age_max,
      size,
      gender,
      q,
      limit = 20,
      offset = 0
    } = req.query;

    // Build the query
    let query = db
      .select({
        id: pets.id,
        name: pets.name,
        species: pets.species,
        breed: pets.breed,
        age_months: pets.age_months,
        gender: pets.gender,
        size: pets.size,
        color: pets.color,
        status: pets.status,
        health_status: pets.health_status,
        description: pets.description,
        photos: pets.photos,
        created_at: pets.created_at,
        org: {
          id: organizations.id,
          name: organizations.name,
          type: organizations.organization_type,
          address: organizations.address,
          city: organizations.city,
          district: organizations.district,
          primary_phone: organizations.primary_phone,
          email: organizations.email,
          website: organizations.website,
          verified: organizations.verified
        }
      })
      .from(pets)
      .leftJoin(organizations, eq(pets.organization_id, organizations.id))
      .where(and(
        status ? eq(pets.status, status) : undefined,
        species ? eq(pets.species, species) : undefined,
        breed ? eq(pets.breed, breed) : undefined,
        city ? eq(organizations.city, city) : undefined,
        district ? eq(organizations.district, district) : undefined,
        age_min ? gte(pets.age_months, parseInt(age_min)) : undefined,
        age_max ? lte(pets.age_months, parseInt(age_max)) : undefined,
        size ? eq(pets.size, size) : undefined,
        gender ? eq(pets.gender, gender) : undefined,
        q ? or(
          ilike(pets.name, `%${q}%`),
          ilike(pets.description, `%${q}%`),
          ilike(organizations.name, `%${q}%`)
        ) : undefined
      ))
      .orderBy(desc(pets.created_at));

    // Get total count for pagination
    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(query.as('subquery'));
    
    const total = countResult[0]?.count || 0;
    
    // Apply pagination
    const result = await query.limit(parseInt(limit)).offset(parseInt(offset));

    res.json({
      total,
      pets: result.map(pet => ({
        ...pet,
        org: {
          ...pet.org,
          // Only include contact info if the organization is verified
          primary_phone: pet.org?.verified ? pet.org.primary_phone : null,
          email: pet.org?.verified ? pet.org.email : null
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({ error: 'Failed to fetch pets' });
  }
});

/**
 * @openapi
 * /api/pets/{id}:
 *   get:
 *     summary: Get a specific pet by ID
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Pet ID
 *     responses:
 *       200:
 *         description: Pet details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       404:
 *         description: Pet not found
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const pet = await db.query.pets.findFirst({
      where: eq(pets.id, id),
      with: {
        organization: true
      }
    });

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Only include contact info if the organization is verified
    const { organization, ...petData } = pet;
    const response = {
      ...petData,
      org: organization ? {
        id: organization.id,
        name: organization.name,
        type: organization.organization_type,
        address: organization.address,
        city: organization.city,
        district: organization.district,
        primary_phone: organization.verified ? organization.primary_phone : null,
        email: organization.verified ? organization.email : null,
        website: organization.website,
        verified: organization.verified
      } : null
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching pet:', error);
    res.status(500).json({ error: 'Failed to fetch pet' });
  }
});

/**
 * @openapi
 * /api/adoptions:
 *   post:
 *     summary: Submit an adoption application
 *     tags: [Adoptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdoptionApplication'
 *     responses:
 *       201:
 *         description: Adoption application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 receipt_url:
 *                   type: string
 *                   format: uri
 *                   description: URL to download the adoption receipt
 */
router.post('/adoptions', async (req, res) => {
  try {
    // Validate request body
    const validation = adoptionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: validation.error.issues
      });
    }

    const data = validation.data;
    const userId = req.user?.id;

    // Check if pet exists and is available
    const pet = await db.query.pets.findFirst({
      where: and(
        eq(pets.id, data.pet_id),
        eq(pets.status, 'available')
      )
    });

    if (!pet) {
      return res.status(404).json({ error: 'Pet not available for adoption' });
    }

    // Start a transaction
    await db.transaction(async (tx) => {
      // Create adoption record
      const [adoption] = await tx.insert(adoptions).values({
        pet_id: data.pet_id,
        user_id: userId,
        applicant_name: data.applicant_name,
        applicant_email: data.applicant_email,
        applicant_phone: data.applicant_phone,
        address: data.address,
        city: data.city,
        message: data.message,
        status: 'submitted',
        metadata: {
          user_agent: req.get('user-agent'),
          ip_address: req.ip
        }
      }).returning();

      // Update pet status to pending
      await tx.update(pets)
        .set({ status: 'pending', updated_at: new Date() })
        .where(eq(pets.id, data.pet_id));

      // Generate receipt
      const receiptText = await generateAdoptionReceipt(adoption.id);
      
      // In a real app, you would save this to a file storage and get a URL
      const receiptUrl = `/api/adoptions/${adoption.id}/receipt`;
      
      // Update adoption with receipt path
      await tx.update(adoptions)
        .set({ receipt_path: receiptUrl })
        .where(eq(adoptions.id, adoption.id));

      // Send confirmation email to applicant
      await sendEmail({
        to: data.applicant_email,
        subject: 'Adoption Application Received',
        text: `Thank you for your adoption application for ${pet.name}.\n\n` +
              `Your application ID is: ${adoption.id}\n` +
              `You can download your receipt here: ${receiptUrl}\n\n` +
              'The shelter will contact you soon with next steps.'
      });

      // If requested, send notification to organization
      if (data.send_notification_to_org) {
        const org = await db.query.organizations.findFirst({
          where: eq(organizations.id, pet.organization_id)
        });

        if (org?.email) {
          await sendEmail({
            to: org.email,
            subject: `New Adoption Application for ${pet.name}`,
            text: `A new adoption application has been submitted for ${pet.name}.\n\n` +
                  `Applicant: ${data.applicant_name}\n` +
                  `Email: ${data.applicant_email}\n` +
                  `Phone: ${data.applicant_phone}\n` +
                  `Address: ${data.address}, ${data.city}\n\n` +
                  `${data.message ? `Message: ${data.message}\n\n` : ''}` +
                  'Please log in to the admin panel to review this application.'
          });

          // Update adoption record with notification info
          await tx.update(adoptions)
            .set({ 
              org_notified: true,
              org_notification_sent_at: new Date()
            })
            .where(eq(adoptions.id, adoption.id));
        }
      }

      res.status(201).json({
        id: adoption.id,
        receipt_url: receiptUrl
      });
    });
  } catch (error) {
    console.error('Error submitting adoption application:', error);
    res.status(500).json({ error: 'Failed to submit adoption application' });
  }
});

/**
 * @openapi
 * /api/adoptions/{id}/receipt:
 *   get:
 *     summary: Get adoption receipt
 *     tags: [Adoptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Adoption application ID
 *     responses:
 *       200:
 *         description: Adoption receipt as plain text
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       404:
 *         description: Adoption not found
 */
router.get('/adoptions/:id/receipt', async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app, you would verify the user has permission to view this receipt
    // For now, we'll just check if the adoption exists
    const adoption = await db.query.adoptions.findFirst({
      where: eq(adoptions.id, id)
    });

    if (!adoption) {
      return res.status(404).send('Adoption not found');
    }

    // Generate receipt
    const receiptText = await generateAdoptionReceipt(id);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=adoption_receipt_${id}.txt`);
    
    // Send the receipt
    res.send(receiptText);
  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).send('Failed to generate receipt');
  }
});

/**
 * @openapi
 * /api/alerts/subscribe:
 *   post:
 *     summary: Subscribe to pet alerts
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PetAlertSubscription'
 *     responses:
 *       201:
 *         description: Successfully subscribed to alerts
 *       400:
 *         description: Invalid request body
 */
router.post('/alerts/subscribe', authenticate, async (req, res) => {
  try {
    // Validate request body
    const validation = alertSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: validation.error.issues
      });
    }

    const { criteria, notification_type, device_token } = validation.data;
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Check if a similar alert already exists for this user
    const existingAlert = await db.query.pet_alerts.findFirst({
      where: and(
        eq(pet_alerts.user_id, userId),
        // Simple check for similar criteria (in a real app, you might want a more sophisticated comparison)
        sql`${pet_alerts.criteria}::jsonb @> ${JSON.stringify(criteria)}::jsonb`
      )
    });

    if (existingAlert) {
      // Update existing alert
      await db.update(pet_alerts)
        .set({
          criteria,
          notification_type,
          device_token: device_token || existingAlert.device_token,
          active: true,
          updated_at: new Date()
        })
        .where(eq(pet_alerts.id, existingAlert.id));
      
      return res.status(200).json({
        message: 'Alert subscription updated',
        alert_id: existingAlert.id
      });
    }

    // Create new alert
    const [alert] = await db.insert(pet_alerts).values({
      user_id: userId,
      user_email: userEmail,
      device_token,
      criteria,
      notification_type,
      active: true
    }).returning();

    res.status(201).json({
      message: 'Successfully subscribed to alerts',
      alert_id: alert.id
    });
  } catch (error) {
    console.error('Error subscribing to alerts:', error);
    res.status(500).json({ error: 'Failed to subscribe to alerts' });
  }
});

export default router;
