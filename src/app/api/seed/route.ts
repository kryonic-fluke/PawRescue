import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ngos, partnerships, ngoReviews, appUsers } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    // Simple seed: create a few NGOs, partnerships, users, and reviews
    const now = new Date();

    const ngoData = [
      { name: 'Animal Care Trust', description: 'Rescue and rehabilitation', address: 'Sector 12, Delhi', city: 'Delhi', state: 'Delhi', phone: '+91-1111111111', email: 'contact@animalcare.org', website: 'https://animalcare.org', createdAt: now, updatedAt: now },
      { name: 'Friends of Strays', description: 'Street dog welfare', address: 'Koramangala', city: 'Bangalore', state: 'Karnataka', phone: '+91-2222222222', email: 'info@friendsofstrays.org', website: 'https://friendsofstrays.org', createdAt: now, updatedAt: now },
      { name: 'Hope Pet Foundation', description: 'Adoption and foster network', address: 'Andheri', city: 'Mumbai', state: 'Maharashtra', phone: '+91-3333333333', email: 'hello@hopepet.org', website: 'https://hopepet.org', createdAt: now, updatedAt: now },
    ];

    const insertedNgos = [];
    for (const n of ngoData) {
      const r = await db.insert(ngos).values(n).returning();
      insertedNgos.push(r[0]);
    }

    const partnershipData = [
      { title: 'Community Vaccination Drive', description: 'Free vaccination camps for street dogs', programType: 'Vaccination', geographicFocus: 'Delhi,Bangalore,Mumbai', beneficiaries: 'Street dogs', fundingSources: 'Donations', contactName: 'Asha Rao', contactEmail: 'asha@animalcare.org', contactPhone: '+91-9876543210', website: 'https://animalcare.org/vaccine', status: 'active', createdAt: now, updatedAt: now, ngoId: insertedNgos[0].id },
      { title: 'Spay/Neuter Subsidy Program', description: 'Subsidized sterilization surgeries', programType: 'Sterilization', geographicFocus: 'All India', beneficiaries: 'Community animals', fundingSources: 'Grants', contactName: 'Dr. Sanjay', contactEmail: 'sanjay@spayneuter.org', contactPhone: '+91-9123456780', website: 'https://spayneuter.org', status: 'active', createdAt: now, updatedAt: now, ngoId: insertedNgos[1].id },
      { title: 'Foster & Adoption Network', description: 'Connect foster families with adoptable pets', programType: 'Adoption', geographicFocus: 'Metro Cities', beneficiaries: 'Orphaned pets', fundingSources: 'Crowdfunding', contactName: 'Rina Mehta', contactEmail: 'rina@fosternetwork.org', contactPhone: '+91-9988776655', website: 'https://fosternetwork.org', status: 'active', createdAt: now, updatedAt: now, ngoId: insertedNgos[2].id },
    ];

    for (const p of partnershipData) {
      await db.insert(partnerships).values(p).returning();
    }

    // Create a demo user
    const user = await db.insert(appUsers).values({ name: 'Demo Admin', email: 'admin@pawrescue.local', passwordHash: 'demo', role: 'admin', createdAt: now, updatedAt: now }).returning();

    // Add a sample review
    await db.insert(ngoReviews).values({ ngoId: insertedNgos[0].id, userId: user[0].id, rating: 5, title: 'Great work!', body: 'They rescued and rehabilitated 2 dogs in my area.', createdAt: now }).returning();

    return NextResponse.json({ success: true, ngos: insertedNgos }, { status: 201 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed data', details: (error as Error).message }, { status: 500 });
  }
}
