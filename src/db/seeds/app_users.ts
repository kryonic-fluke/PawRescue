import { db } from '@/db';
import { appUsers } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            name: 'Admin User',
            email: 'admin@pawrescue.com',
            passwordHash: '$2b$10$K7L/8Y/xQvW4KxHc0p3b2.Z9XmF8J3lE6sG7pN4vB2wA5rH8yD1k',
            phone: '+91-981-234-5678',
            role: 'admin',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            name: 'Delhi Animal Welfare Society',
            email: 'ngo@delhianimal.org',
            passwordHash: '$2b$10$M9P/3X/yRwX5LyIc1q4c3.A1YnG9K4mF7tH8qO5wC3xB6sI9zE2l',
            phone: '+91-982-345-6789',
            role: 'ngo',
            avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=DAWS',
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-02-01').toISOString(),
        },
        {
            name: 'Noida Pet Care Center',
            email: 'info@noidapet.org',
            passwordHash: '$2b$10$N8Q/4Y/zSxY6MzJd2r5d4.B2ZoH0L5nG8uI9rP6xD4yC7tJ0Af3m',
            phone: '+91-983-456-7890',
            role: 'ngo',
            avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=NPCC',
            createdAt: new Date('2024-02-10').toISOString(),
            updatedAt: new Date('2024-02-10').toISOString(),
        },
        {
            name: 'Rajesh Kumar',
            email: 'rajesh.kumar@gmail.com',
            passwordHash: '$2b$10$O7R/5Z/0TyZ7NaKe3s6e5.C3ApI1M6oH9vJ0sQ7yE5zD8uK1Bg4n',
            phone: '+91-984-567-8901',
            role: 'user',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh',
            createdAt: new Date('2024-02-20').toISOString(),
            updatedAt: new Date('2024-02-20').toISOString(),
        },
        {
            name: 'Priya Sharma',
            email: 'priya.sharma@yahoo.com',
            passwordHash: '$2b$10$P6S/6A/1UzA8ObLf4t7f6.D4BqJ2N7pH0wK1tR8zF6Ad9vL2Ch5o',
            phone: '+91-985-678-9012',
            role: 'user',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
            createdAt: new Date('2024-03-01').toISOString(),
            updatedAt: new Date('2024-03-01').toISOString(),
        }
    ];

    await db.insert(appUsers).values(sampleUsers);
    
    console.log('✅ App users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});