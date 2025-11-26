import { db } from '@/db';
import { adoptionApplicationsNew } from '@/db/schema';

async function main() {
    const sampleApplications = [
        {
            userId: 4,
            petId: 3,
            status: 'pending',
            applicationDate: new Date('2024-11-25').toISOString(),
            notes: 'I have a large backyard and previous experience with dogs',
            createdAt: new Date('2024-11-25').toISOString(),
        },
        {
            userId: 5,
            petId: 7,
            status: 'approved',
            applicationDate: new Date('2024-11-28').toISOString(),
            notes: 'Looking for a calm cat as I live in an apartment',
            createdAt: new Date('2024-11-28').toISOString(),
        },
        {
            userId: 4,
            petId: 12,
            status: 'pending',
            applicationDate: new Date('2024-12-01').toISOString(),
            notes: 'I work from home and can give full attention to the pet',
            createdAt: new Date('2024-12-01').toISOString(),
        },
        {
            userId: 5,
            petId: 15,
            status: 'rejected',
            applicationDate: new Date('2024-12-03').toISOString(),
            notes: 'We have two children who love animals',
            createdAt: new Date('2024-12-03').toISOString(),
        },
        {
            userId: 4,
            petId: 19,
            status: 'approved',
            applicationDate: new Date('2024-12-05').toISOString(),
            notes: "I'm interested in adopting for companionship",
            createdAt: new Date('2024-12-05').toISOString(),
        },
        {
            userId: 5,
            petId: 22,
            status: 'pending',
            applicationDate: new Date('2024-12-08').toISOString(),
            notes: null,
            createdAt: new Date('2024-12-08').toISOString(),
        },
        {
            userId: 4,
            petId: 25,
            status: 'approved',
            applicationDate: new Date('2024-12-10').toISOString(),
            notes: 'I have a large backyard and previous experience with dogs',
            createdAt: new Date('2024-12-10').toISOString(),
        },
        {
            userId: 5,
            petId: 1,
            status: 'pending',
            applicationDate: new Date('2024-12-12').toISOString(),
            notes: 'Looking for a calm cat as I live in an apartment',
            createdAt: new Date('2024-12-12').toISOString(),
        },
        {
            userId: 4,
            petId: 5,
            status: 'rejected',
            applicationDate: new Date('2024-12-15').toISOString(),
            notes: null,
            createdAt: new Date('2024-12-15').toISOString(),
        },
        {
            userId: 5,
            petId: 9,
            status: 'approved',
            applicationDate: new Date('2024-12-17').toISOString(),
            notes: 'I work from home and can give full attention to the pet',
            createdAt: new Date('2024-12-17').toISOString(),
        },
        {
            userId: 4,
            petId: 14,
            status: 'pending',
            applicationDate: new Date('2024-12-19').toISOString(),
            notes: 'We have two children who love animals',
            createdAt: new Date('2024-12-19').toISOString(),
        },
        {
            userId: 5,
            petId: 17,
            status: 'approved',
            applicationDate: new Date('2024-12-21').toISOString(),
            notes: "I'm interested in adopting for companionship",
            createdAt: new Date('2024-12-21').toISOString(),
        },
        {
            userId: 4,
            petId: 20,
            status: 'pending',
            applicationDate: new Date('2024-12-23').toISOString(),
            notes: null,
            createdAt: new Date('2024-12-23').toISOString(),
        },
        {
            userId: 5,
            petId: 27,
            status: 'rejected',
            applicationDate: new Date('2024-12-26').toISOString(),
            notes: 'I have a large backyard and previous experience with dogs',
            createdAt: new Date('2024-12-26').toISOString(),
        },
        {
            userId: 4,
            petId: 30,
            status: 'pending',
            applicationDate: new Date('2024-12-28').toISOString(),
            notes: 'Looking for a calm cat as I live in an apartment',
            createdAt: new Date('2024-12-28').toISOString(),
        },
    ];

    await db.insert(adoptionApplicationsNew).values(sampleApplications);
    
    console.log('✅ Adoption applications seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});