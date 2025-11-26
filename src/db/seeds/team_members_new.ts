import { db } from '@/db';
import { teamMembersNew } from '@/db/schema';

async function main() {
    const sampleTeamMembers = [
        {
            name: 'Dr. Amit Verma',
            role: 'Veterinarian',
            specialty: 'Emergency Surgery',
            bio: '15 years of experience in veterinary medicine, specialized in emergency and trauma care',
            imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
            phone: '+91-981-111-2222',
            email: 'dr.amit@pawrescue.org',
            experienceYears: 15,
            createdAt: new Date('2022-03-15').toISOString(),
        },
        {
            name: 'Dr. Priya Malhotra',
            role: 'Veterinarian',
            specialty: 'Internal Medicine',
            bio: 'Specialized in diagnosing and treating complex medical conditions in animals',
            imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
            phone: '+91-982-222-3333',
            email: 'dr.priya@pawrescue.org',
            experienceYears: 12,
            createdAt: new Date('2022-06-20').toISOString(),
        },
        {
            name: 'Rajesh Singh',
            role: 'Rescue Coordinator',
            specialty: 'Street Animal Rescue',
            bio: 'Coordinates rescue operations across Delhi/NCR, handles emergency rescue calls',
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
            phone: '+91-983-333-4444',
            email: 'rajesh@pawrescue.org',
            experienceYears: 8,
            createdAt: new Date('2022-09-10').toISOString(),
        },
        {
            name: 'Anjali Reddy',
            role: 'Animal Care Specialist',
            specialty: 'Post-Rescue Rehabilitation',
            bio: 'Focuses on rehabilitating rescued animals, ensuring proper nutrition and care',
            imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
            phone: '+91-984-444-5555',
            email: 'anjali@pawrescue.org',
            experienceYears: 6,
            createdAt: new Date('2023-01-25').toISOString(),
        },
        {
            name: 'Vikram Patel',
            role: 'Field Officer',
            specialty: 'Urban Rescue Operations',
            bio: 'Handles rescue operations in urban areas, trained in animal handling techniques',
            imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
            phone: '+91-985-555-6666',
            email: 'vikram@pawrescue.org',
            experienceYears: 5,
            createdAt: new Date('2023-04-12').toISOString(),
        },
        {
            name: 'Neha Kapoor',
            role: 'Volunteer Coordinator',
            specialty: 'Community Outreach',
            bio: 'Manages volunteer programs and community engagement initiatives',
            imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
            phone: '+91-986-666-7777',
            email: 'neha@pawrescue.org',
            experienceYears: 4,
            createdAt: new Date('2023-07-08').toISOString(),
        },
        {
            name: 'Sanjay Gupta',
            role: 'Adoption Counselor',
            specialty: 'Pet Adoption Matching',
            bio: 'Helps match pets with suitable families, conducts home visits and follow-ups',
            imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
            phone: '+91-987-777-8888',
            email: 'sanjay@pawrescue.org',
            experienceYears: 7,
            createdAt: new Date('2023-10-18').toISOString(),
        },
        {
            name: 'Meera Sharma',
            role: 'Shelter Manager',
            specialty: 'Facility Management',
            bio: 'Oversees daily shelter operations, ensures animal welfare standards are maintained',
            imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
            phone: '+91-988-888-9999',
            email: 'meera@pawrescue.org',
            experienceYears: 10,
            createdAt: new Date('2024-01-05').toISOString(),
        }
    ];

    await db.insert(teamMembersNew).values(sampleTeamMembers);
    
    console.log('✅ Team members seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});