import { db } from '../db/index.js';
import { adoptions, animals, organizations } from '../db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Generates a text receipt for an adoption application
 * @param adoptionId The ID of the adoption record
 * @returns A formatted text receipt
 */
export async function generateAdoptionReceipt(adoptionId: string): Promise<string> {
  try {
    // Get adoption details with pet and organization info
    const result = await db.query.adoptions.findFirst({
      where: eq(adoptions.id, adoptionId),
      with: {
        pet: {
          with: {
            organization: true
          }
        }
      }
    });

    if (!result) {
      throw new Error('Adoption record not found');
    }

    const { 
      id, 
      submitted_at, 
      applicant_name, 
      applicant_email, 
      applicant_phone, 
      address, 
      city, 
      message, 
      status,
      pet,
      org_notified
    } = result;

    if (!pet) {
      throw new Error('Pet not found for this adoption');
    }

    const org = pet.organization;
    const orgContact = org ? `${org.name}\n${org.address || ''}\n${org.city || ''}, ${org.district || ''} ${org.pincode || ''}\nPhone: ${org.primary_phone || 'Not provided'}\nEmail: ${org.email || 'Not provided'}` : 'Not available';

    // Format the receipt
    const receipt = `
      Paws & Hearts Adoption Receipt
      =============================
      
      Application ID: ${id}
      Submitted: ${submitted_at}
      
      Applicant Information:
      ---------------------
      Name: ${applicant_name}
      Email: ${applicant_email}
      Phone: ${applicant_phone}
      Address: ${address}, ${city}
      
      Pet Information:
      ---------------
      Name: ${pet.name || 'Not provided'}
      Species: ${pet.species || 'Not provided'}
      Breed: ${pet.breed || 'Mixed'}
      Age: ${pet.age_months ? `${Math.floor(pet.age_months / 12)} years ${pet.age_months % 12} months` : 'Not specified'}
      
      Shelter/Rescue:
      --------------
      ${orgContact}
      
      Application Status: ${status}
      
      Your Message:
      ------------
      ${message || 'No message provided'}
      
      Next Steps:
      ----------
      1. The shelter/rescue will review your application
      2. You will be contacted for next steps if your application is shortlisted
      3. A home check may be required
      4. Final approval is at the discretion of the shelter/rescue
      
      Notes:
      ------
      - This is not a guarantee of adoption
      - The shelter may contact you for more information
      - ${org_notified ? 'The shelter has been notified of your application' : 'The shelter has not been notified yet'}
      - Keep this receipt for your records
      
      Thank you for choosing to adopt, not shop! 🐾
    `;

    return receipt;
  } catch (error) {
    console.error('Error generating receipt:', error);
    // Return a basic receipt if there's an error
    return `
      Paws & Hearts Adoption Receipt
      =============================
      
      Application ID: ${adoptionId}
      Submitted: ${new Date().toISOString()}
      
      There was an error generating your receipt.
      Please contact support with your application ID.
    `;
  }
}
