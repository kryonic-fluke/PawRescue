import { db } from '@/db';
import { emailNotificationsNew } from '@/db/schema';

async function main() {
    const sampleNotifications = [
        {
            userId: 1,
            recipientEmail: 'care@animalrescue.org',
            subject: 'New Rescue Report: Injured Dog in Need of Immediate Help',
            message: 'A new rescue report has been submitted for an injured dog found near Central Park. The reporter indicates the animal appears to have a leg injury and is unable to walk. Urgency level: High. Please review and assign a rescue team as soon as possible.',
            notificationType: 'rescue_report_created',
            sentAt: new Date('2024-12-28T09:15:00').getTime(),
            status: 'sent',
        },
        {
            userId: 2,
            recipientEmail: 'john.smith@email.com',
            subject: 'Rescue Report Status Update: Now In Progress',
            message: 'Good news! Your rescue report for the injured dog near Central Park has been assigned to our rescue team. Our volunteers are currently en route to the location. We will keep you updated on the animals condition and next steps.',
            notificationType: 'rescue_report_status_update',
            sentAt: new Date('2024-12-28T10:30:00').getTime(),
            status: 'sent',
        },
        {
            userId: 3,
            recipientEmail: 'sarah.johnson@email.com',
            subject: 'Adoption Application Received - Max the Golden Retriever',
            message: 'Thank you for submitting your adoption application for Max, our 3-year-old Golden Retriever. We have received your application and our team is currently reviewing it. We will contact you within 48 hours to schedule a meet-and-greet. In the meantime, feel free to reach out if you have any questions.',
            notificationType: 'adoption_application_submitted',
            sentAt: new Date('2024-12-27T14:20:00').getTime(),
            status: 'sent',
        },
        {
            userId: 4,
            recipientEmail: 'mike.davis@email.com',
            subject: 'Congratulations! Your Adoption Application Has Been Approved',
            message: 'We are thrilled to inform you that your adoption application for Luna the Persian Cat has been approved! Congratulations on your new family member. Please contact us at your earliest convenience to schedule the final adoption paperwork and pickup. We cant wait for you to meet Luna and start your journey together.',
            notificationType: 'adoption_application_approved',
            sentAt: new Date('2024-12-26T11:45:00').getTime(),
            status: 'sent',
        },
        {
            userId: 5,
            recipientEmail: 'emma.wilson@email.com',
            subject: 'Adoption Application Status Update',
            message: 'Thank you for your interest in adopting Charlie the Labrador. After careful consideration, we have determined that another applicant may be a better match for Charlies specific needs and temperament. We encourage you to browse our other available pets, as we have many wonderful animals looking for loving homes. Our team is happy to help you find your perfect companion.',
            notificationType: 'adoption_application_rejected',
            sentAt: new Date('2024-12-25T16:00:00').getTime(),
            status: 'sent',
        },
        {
            recipientEmail: 'newuser@email.com',
            subject: 'Welcome to PawRescue - Your Journey Begins Here',
            message: 'Welcome to PawRescue! We are so glad you joined our community dedicated to animal welfare and rescue. Whether you are here to adopt, volunteer, or report animals in need, your participation makes a real difference. Explore our platform to find pets available for adoption, learn about our rescue efforts, and connect with our community. Thank you for being a part of our mission to give every animal a second chance.',
            notificationType: 'welcome',
            sentAt: new Date('2024-12-29T08:00:00').getTime(),
            status: 'sent',
        },
        {
            userId: 2,
            recipientEmail: 'john.smith@email.com',
            subject: 'Password Reset Request for Your Account',
            message: 'We received a request to reset the password for your PawRescue account. To complete the password reset process, please click the link below within the next 24 hours. If you did not request this password reset, please ignore this email and your password will remain unchanged. For security purposes, this link will expire in 24 hours.',
            notificationType: 'password_reset',
            sentAt: new Date('2024-12-29T12:30:00').getTime(),
            status: 'sent',
        },
        {
            userId: 3,
            recipientEmail: 'sarah.johnson@email.com',
            subject: 'New Pet Available: Bella the Beagle',
            message: 'Great news! A new pet matching your preferences is now available for adoption. Meet Bella, a sweet 2-year-old Beagle who loves long walks and cuddles. Bella is fully vaccinated, spayed, and ready to find her forever home. She is great with children and other dogs. Visit our website to learn more about Bella and submit your adoption application today!',
            notificationType: 'pet_available',
            sentAt: new Date('2024-12-28T15:45:00').getTime(),
            status: 'sent',
        },
        {
            recipientEmail: 'help@cityngo.org',
            subject: 'New Rescue Report: Abandoned Puppies Found',
            message: 'A new rescue report has been submitted for three abandoned puppies found in an industrial area. The reporter indicates the puppies appear to be approximately 6-8 weeks old and are in need of immediate care. Urgency level: Critical. Location details and contact information are included in the full report.',
            notificationType: 'rescue_report_created',
            sentAt: new Date('2024-12-27T07:20:00').getTime(),
            status: 'sent',
        },
        {
            userId: 4,
            recipientEmail: 'mike.davis@email.com',
            subject: 'Rescue Report Resolved: Cat Successfully Rescued',
            message: 'We are happy to inform you that the rescue report you submitted for the cat stuck in the tree has been successfully resolved. Our rescue team was able to safely retrieve the cat, and it has been taken to our shelter for a health check. The cat appears to be in good condition. Thank you for reporting and helping us save this animal.',
            notificationType: 'rescue_report_status_update',
            sentAt: new Date('2024-12-26T18:00:00').getTime(),
            status: 'sent',
        },
        {
            userId: 1,
            recipientEmail: 'care@animalrescue.org',
            subject: 'Adoption Application Submitted: Rocky the German Shepherd',
            message: 'A new adoption application has been submitted for Rocky, the 5-year-old German Shepherd. The applicant has completed all required fields and provided references. Please review the application in your dashboard and schedule a home visit if the initial screening is approved.',
            notificationType: 'adoption_application_submitted',
            sentAt: null,
            status: 'pending',
        },
        {
            userId: 5,
            recipientEmail: 'emma.wilson@email.com',
            subject: 'New Pet Alert: Milo the Tabby Cat',
            message: 'Based on your adoption preferences, we wanted to let you know about Milo, a charming 1-year-old tabby cat who just became available for adoption. Milo is neutered, vaccinated, and has a playful, affectionate personality. He would be perfect for a family looking for an indoor cat. Check out his profile and photos on our website!',
            notificationType: 'pet_available',
            sentAt: null,
            status: 'pending',
        },
        {
            recipientEmail: 'volunteer@rescueteam.org',
            subject: 'Welcome to PawRescue Volunteer Portal',
            message: 'Welcome to the PawRescue volunteer community! Your account has been successfully created. As a volunteer, you now have access to our rescue coordination tools, can view active rescue reports, and communicate with other team members. Thank you for dedicating your time to help animals in need. Together, we can make a difference.',
            notificationType: 'welcome',
            sentAt: null,
            status: 'pending',
        },
        {
            recipientEmail: 'contact@shelteralliance.org',
            subject: 'Urgent: Multiple Animals in Need of Emergency Rescue',
            message: 'An urgent rescue report has been submitted regarding multiple animals found in poor conditions at an abandoned property. Initial assessment indicates 5-7 dogs and several cats requiring immediate medical attention and shelter placement. This is a critical situation requiring coordinated response from multiple organizations.',
            notificationType: 'rescue_report_created',
            sentAt: new Date('2024-12-29T06:00:00').getTime(),
            status: 'failed',
        },
        {
            userId: 3,
            recipientEmail: 'sarah.johnson@email.com',
            subject: 'Password Reset Confirmation',
            message: 'This email confirms that your password reset request has been processed. If you completed this action, no further steps are needed. If you did not request this change, please contact our support team immediately to secure your account. Your account security is our top priority.',
            notificationType: 'password_reset',
            sentAt: new Date('2024-12-28T20:15:00').getTime(),
            status: 'failed',
        },
    ];

    await db.insert(emailNotificationsNew).values(sampleNotifications);
    
    console.log('✅ Email notifications seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});