import { db } from '@/db';
import { adoptionGuidesNew } from '@/db/schema';

async function main() {
    const sampleGuides = [
        {
            title: 'Complete Pet Adoption Process',
            category: 'adoption_process',
            content: 'Adopting a pet is a rewarding journey that requires careful planning and commitment. The process begins with thorough research about different breeds and their compatibility with your lifestyle. Consider factors like living space, activity level, and time availability. Visit local animal shelters to meet potential pets and discuss your requirements with shelter staff. They can provide valuable insights about each animal\'s personality and needs. Once you find a suitable match, submit a detailed adoption application including personal information, living situation, and pet care experience. Most shelters conduct home visits to ensure a safe environment for the pet. This typically includes checking for secure fencing, hazardous materials, and adequate space. After approval, complete the necessary paperwork including adoption agreements and medical records. The shelter will provide guidance on transitioning your new pet to their forever home, including tips for the first few days and weeks.',
            steps: JSON.stringify([
                { title: 'Research and Preparation', description: 'Research different breeds, assess your lifestyle compatibility, and understand the responsibilities of pet ownership' },
                { title: 'Visit Shelter', description: 'Visit local animal shelters, meet available pets, and discuss your requirements with shelter staff' },
                { title: 'Submit Application', description: 'Fill out detailed adoption application form with personal information, living situation, and pet care experience' },
                { title: 'Home Visit', description: 'Allow shelter representatives to conduct home inspection to ensure safe environment for the pet' },
                { title: 'Finalize Adoption', description: 'Complete adoption paperwork, pay adoption fees, receive medical records, and bring your new pet home' }
            ]),
            requirements: JSON.stringify(['Valid government-issued ID proof', 'Current address proof (utility bill or rental agreement)', 'Income verification or employment letter', 'Home ownership documents or landlord permission letter for renters']),
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            title: 'Dog Adoption Guidelines',
            category: 'species_specific',
            content: 'Adopting a dog requires understanding the specific needs of canine companions. Dogs are social animals that need regular exercise, training, and companionship. Before adopting, consider the dog\'s size, energy level, and temperament to ensure compatibility with your household. Large breeds require more space and exercise, while smaller breeds may be better suited for apartment living. Puppies need extensive training and socialization, while adult dogs may already be house-trained. Research the breed\'s common health issues and grooming requirements. Dogs need daily walks, mental stimulation through play and training, and a consistent routine. Prepare your home by securing a safe outdoor area, purchasing essential supplies like food bowls, leash, collar, bed, and toys. Budget for ongoing expenses including quality dog food, regular veterinary care, vaccinations, grooming, and emergency medical costs. Consider pet insurance to manage unexpected health expenses.',
            steps: JSON.stringify([
                { title: 'Assess Dog Compatibility', description: 'Evaluate breed characteristics, size, energy level, and temperament against your lifestyle and living situation' },
                { title: 'Meet Potential Dogs', description: 'Spend time with different dogs at the shelter, observe their behavior, and ask about their history and personality' },
                { title: 'Prepare Your Home', description: 'Dog-proof your space, set up feeding area, create sleeping space, and secure outdoor boundaries' },
                { title: 'Complete Adoption Process', description: 'Submit application, undergo home inspection, complete required paperwork and training orientation' },
                { title: 'Transition Period', description: 'Gradually introduce dog to new home, establish routine, begin training, and schedule first veterinary checkup' }
            ]),
            requirements: JSON.stringify(['Proof of residence with adequate space for the dog', 'Secure outdoor area or commitment to regular walks', 'Financial capability for ongoing dog care expenses', 'Family agreement on pet ownership responsibilities', 'Veterinarian contact information']),
            createdAt: new Date('2024-02-01').toISOString(),
        },
        {
            title: 'Cat Adoption Guidelines',
            category: 'species_specific',
            content: 'Cats make wonderful companions and are generally more independent than dogs, but they still require proper care and attention. Before adopting a cat, understand that they typically live 12-20 years and require long-term commitment. Cats need indoor safety, regular veterinary care, proper nutrition, and mental stimulation. Consider whether you want a kitten or adult cat - kittens are energetic and require extensive socialization and training, while adult cats often have established personalities. Indoor cats are safer from traffic, diseases, and predators, but need environmental enrichment. Prepare your home by creating vertical spaces with cat trees, providing scratching posts to protect furniture, and securing windows and balconies. Set up a quiet litter box area away from food and water bowls. Cats are obligate carnivores requiring high-quality protein-rich food. Budget for regular expenses including food, litter, toys, scratching posts, and annual veterinary checkups including vaccinations and flea prevention.',
            steps: JSON.stringify([
                { title: 'Choose Cat Type', description: 'Decide between kitten or adult cat, consider breed characteristics, activity level, and grooming needs' },
                { title: 'Visit Shelter Cats', description: 'Interact with different cats, observe their temperament, ask about their background and health status' },
                { title: 'Cat-Proof Home', description: 'Remove toxic plants, secure dangerous items, set up litter box area, create climbing spaces, and designate feeding area' },
                { title: 'Gather Supplies', description: 'Purchase litter box, quality food, water bowls, scratching posts, toys, carrier, and grooming tools' },
                { title: 'Bring Cat Home', description: 'Create safe room for initial adjustment, gradually introduce to full home, establish feeding routine, and schedule vet visit' }
            ]),
            requirements: JSON.stringify(['Safe indoor living environment', 'Commitment to keeping cat indoors or providing secure outdoor enclosure', 'Financial resources for food, litter, and veterinary care', 'Understanding of cat behavior and communication', 'Agreement from all household members']),
            createdAt: new Date('2024-02-20').toISOString(),
        },
        {
            title: 'Legal Requirements for Pet Adoption in India',
            category: 'legal',
            content: 'Pet adoption in India is governed by various laws and regulations designed to protect animal welfare. The Prevention of Cruelty to Animals Act, 1960 is the primary legislation governing animal welfare in India. According to Indian law, all pets must be registered with local municipal authorities. Dogs require registration and annual renewal of licenses. Vaccination against rabies is mandatory for all dogs and cats as per the Animal Birth Control (Dogs) Rules, 2001. Sterilization is encouraged and often mandatory for adopted pets. Microchipping is increasingly required in major cities for pet identification and tracking. Import of certain exotic pets requires special permits from wildlife authorities. The Wildlife Protection Act, 1972 prohibits keeping endangered species as pets. Pet owners must maintain vaccination records and produce them when required by authorities. In case of pet-related incidents, owners are legally liable. Insurance coverage for third-party liability is recommended. Understanding these legal requirements ensures compliance and protects both you and your pet.',
            steps: JSON.stringify([
                { title: 'Registration', description: 'Register your adopted pet with local municipal corporation within 30 days of adoption' },
                { title: 'Vaccination Documentation', description: 'Obtain and maintain updated vaccination records, especially rabies vaccination certificate' },
                { title: 'Sterilization Certificate', description: 'Get sterilization done if required and obtain certificate from registered veterinarian' },
                { title: 'Microchipping', description: 'Get pet microchipped with unique identification number and register in national database' },
                { title: 'License Renewal', description: 'Renew pet license annually and keep documentation updated with current address' }
            ]),
            requirements: JSON.stringify(['Valid identity proof of pet owner', 'Proof of residence', 'Adoption certificate from recognized shelter or NGO', 'Vaccination records from licensed veterinarian', 'Sterilization certificate if applicable', 'Payment of applicable registration and license fees']),
            createdAt: new Date('2024-03-10').toISOString(),
        },
        {
            title: 'Post-Adoption Care Essentials',
            category: 'post_adoption',
            content: 'The first 30 days after adoption are crucial for your pet\'s adjustment to their new home. Create a consistent daily routine for feeding, exercise, and rest. This helps pets feel secure and reduces anxiety. Schedule a comprehensive veterinary checkup within the first week to establish baseline health and discuss preventive care. Begin training immediately using positive reinforcement methods - reward good behavior with treats and praise. Socialize your pet gradually by introducing them to new people, animals, and environments in controlled settings. Monitor eating habits, bathroom routines, and behavior for any signs of stress or health issues. Provide mental stimulation through interactive toys, puzzle feeders, and regular playtime. Establish boundaries and house rules consistently from day one. Be patient during the adjustment period as pets may show stress behaviors like hiding, excessive vocalization, or changes in appetite. Create a safe space where your pet can retreat when overwhelmed. Gradually increase exercise and social activities as your pet becomes more comfortable.',
            steps: JSON.stringify([
                { title: 'First Week Adjustment', description: 'Maintain calm environment, establish feeding schedule, introduce to designated spaces, limit visitors and stimulation' },
                { title: 'Initial Veterinary Care', description: 'Complete health checkup, update vaccinations, discuss parasite prevention, establish relationship with vet' },
                { title: 'Basic Training', description: 'Begin house training or litter training, teach basic commands, establish boundaries using positive reinforcement' },
                { title: 'Socialization Period', description: 'Gradually expose to new experiences, people, and animals in controlled positive situations' },
                { title: 'Long-term Integration', description: 'Develop exercise routine, continue training, monitor health and behavior, build strong bond through quality time' }
            ]),
            requirements: JSON.stringify(['Quality pet food appropriate for age and species', 'Essential supplies: bowls, bedding, toys, grooming tools', 'Veterinary care budget for initial checkup and vaccinations', 'Time commitment for training and bonding', 'Patience and understanding during adjustment period', 'Emergency vet clinic contact information']),
            createdAt: new Date('2024-04-05').toISOString(),
        },
        {
            title: 'Pet Adoption Fees and Costs',
            category: 'financial',
            content: 'Understanding the financial commitment of pet adoption helps ensure you can provide proper care throughout your pet\'s life. Adoption fees typically range from ₹500 to ₹5,000 depending on the organization, animal species, and age. These fees usually cover initial vaccinations, sterilization, deworming, and microchipping. Initial setup costs include supplies like food and water bowls, bedding, collar and leash, toys, and grooming tools - typically ₹3,000 to ₹8,000. Monthly expenses for food range from ₹1,500 to ₹5,000 depending on pet size and food quality. Annual veterinary costs including routine checkups, vaccinations, and preventive medications average ₹8,000 to ₹15,000. Factor in additional expenses like grooming, training classes, pet insurance, and emergency medical care. Emergency veterinary treatment can cost ₹10,000 to ₹50,000 or more. Pet insurance premiums range from ₹300 to ₹1,500 monthly. Budget for replacement supplies, boarding during travel, and treats. Over a pet\'s lifetime, expect to invest ₹3 to ₹8 lakhs depending on species and size.',
            steps: JSON.stringify([
                { title: 'Calculate Initial Costs', description: 'Add adoption fee, initial supplies, first veterinary visit, and setup expenses' },
                { title: 'Plan Monthly Budget', description: 'Calculate ongoing costs for food, treats, preventive medications, and regular supplies' },
                { title: 'Annual Expense Planning', description: 'Budget for yearly veterinary checkups, vaccinations, license renewal, and equipment replacement' },
                { title: 'Emergency Fund', description: 'Set aside savings for unexpected medical emergencies or urgent care needs' },
                { title: 'Consider Insurance', description: 'Research pet insurance options and decide if coverage makes financial sense for your situation' }
            ]),
            requirements: JSON.stringify(['Stable income to cover monthly pet expenses', 'Emergency fund of at least ₹25,000 for unexpected veterinary costs', 'Long-term financial planning for pet\'s entire lifespan', 'Understanding of hidden costs like boarding and grooming', 'Willingness to prioritize pet\'s needs in household budget']),
            createdAt: new Date('2024-05-01').toISOString(),
        },
        {
            title: 'Preparing Your Home for a New Pet',
            category: 'preparation',
            content: 'Creating a safe, welcoming environment is essential before bringing your new pet home. Start by pet-proofing each room - remove or secure toxic plants, chemicals, medications, and small objects that could be swallowed. Cover electrical cords and outlets to prevent chewing injuries. Secure trash cans with locking lids and remove access to dangerous areas like balconies or open staircases. For dogs, install secure fencing in outdoor areas and check for escape routes. For cats, ensure windows have secure screens and eliminate high-risk jumping areas. Designate specific spaces for feeding, sleeping, and bathroom needs. Set up a comfortable bed or crate in a quiet area away from household traffic. Create an eating station with food and water bowls placed away from litter boxes for cats. Gather essential supplies before arrival: appropriate food recommended by the shelter, collar with ID tag, leash, toys for mental stimulation, grooming tools, and first aid kit. Prepare family members by assigning responsibilities and establishing household rules about pet interactions.',
            steps: JSON.stringify([
                { title: 'Safety Assessment', description: 'Inspect home for hazards, secure dangerous items, cover exposed cords, remove toxic plants' },
                { title: 'Space Organization', description: 'Designate feeding area, sleeping space, and bathroom location with proper placement and access' },
                { title: 'Supply Shopping', description: 'Purchase all essential items: food, bowls, bedding, toys, grooming supplies, and safety equipment' },
                { title: 'Family Preparation', description: 'Educate household members about pet care, assign responsibilities, establish interaction rules' },
                { title: 'Final Setup', description: 'Arrange furniture for pet safety, set up all stations, create comfortable spaces, and prepare arrival day plan' }
            ]),
            requirements: JSON.stringify(['Safe, pet-appropriate living space', 'All toxic substances secured or removed', 'Complete set of basic pet supplies', 'Family agreement on pet care responsibilities', 'Secure outdoor area for dogs or protected windows for cats', 'Quiet space for initial adjustment period']),
            createdAt: new Date('2024-05-25').toISOString(),
        },
        {
            title: 'Understanding Pet Behavior and Training',
            category: 'training',
            content: 'Understanding animal behavior is fundamental to successful pet ownership and building a strong bond with your companion. Dogs and cats communicate through body language, vocalizations, and behaviors that reflect their emotional state. Learn to read signs of stress, fear, happiness, and contentment. Positive reinforcement training is the most effective and humane method - reward desired behaviors immediately with treats, praise, or play. Never use punishment or physical corrections as these damage trust and can cause behavioral problems. Start with basic obedience: teaching name recognition, simple commands like sit, stay, and come. Use consistency in commands and rewards. Training sessions should be short (5-10 minutes) but frequent throughout the day. Socialization is critical, especially during the first few months. Expose pets gradually to various people, animals, environments, and experiences in positive contexts. Address common behavioral issues like excessive barking, destructive chewing, or litter box problems by identifying underlying causes like anxiety, boredom, or medical issues. Seek professional help from certified trainers or animal behaviorists for persistent problems.',
            steps: JSON.stringify([
                { title: 'Learn Communication', description: 'Study species-specific body language, vocalizations, and behavioral cues to understand your pet\'s emotions' },
                { title: 'Basic Training', description: 'Start with name recognition and simple commands using positive reinforcement and consistency' },
                { title: 'Socialization Program', description: 'Gradually introduce positive experiences with people, animals, and environments appropriate for age' },
                { title: 'Problem Prevention', description: 'Identify and address potential behavioral issues early through proper exercise, mental stimulation, and routine' },
                { title: 'Ongoing Education', description: 'Continue training throughout pet\'s life, maintain learned behaviors, and introduce new skills for mental engagement' }
            ]),
            requirements: JSON.stringify(['Time commitment for daily training sessions', 'High-value treats for motivation and rewards', 'Patience and consistency in training approach', 'Understanding of animal behavior principles', 'Access to professional trainer if needed', 'Commitment to positive reinforcement methods only']),
            createdAt: new Date('2024-06-15').toISOString(),
        },
        {
            title: 'Health and Vaccination Schedule',
            category: 'health',
            content: 'Maintaining your pet\'s health through preventive care is crucial for their wellbeing and longevity. Establish a relationship with a trusted veterinarian within the first week of adoption. Core vaccinations for dogs include rabies (mandatory by law), distemper, parvovirus, and adenovirus. For cats, core vaccines are rabies, feline distemper, calicivirus, and herpesvirus. Puppies and kittens require a series of vaccinations starting at 6-8 weeks, with boosters every 3-4 weeks until 16 weeks old. Adult pets need annual booster shots and comprehensive health examinations. Deworming should be done every 3 months for most pets. Flea and tick prevention is essential year-round using veterinarian-recommended products. Annual heartworm testing for dogs and prevention medication are critical. Dental care including regular brushing and annual professional cleaning prevents serious health issues. Senior pets (over 7 years) benefit from semi-annual checkups to catch age-related problems early. Maintain detailed health records including vaccination dates, medications, and any medical treatments. Watch for warning signs requiring immediate veterinary attention: loss of appetite, lethargy, vomiting, diarrhea, difficulty breathing, or unusual behavior.',
            steps: JSON.stringify([
                { title: 'Initial Health Assessment', description: 'Complete veterinary examination within first week, discuss pet\'s history, establish baseline health status' },
                { title: 'Vaccination Protocol', description: 'Follow recommended vaccination schedule based on age, complete booster series for young animals' },
                { title: 'Parasite Prevention', description: 'Begin regular deworming, start flea/tick prevention, and heartworm protection as recommended' },
                { title: 'Routine Care Schedule', description: 'Establish annual checkup schedule, maintain dental care routine, monitor for health changes' },
                { title: 'Record Maintenance', description: 'Keep organized health records, track vaccination dates, document any medical treatments or concerns' }
            ]),
            requirements: JSON.stringify(['Relationship with licensed veterinarian', 'Budget for routine veterinary care and vaccinations', 'Commitment to scheduled checkups and preventive care', 'Transportation for veterinary visits', 'Ability to recognize and respond to health emergencies', 'Updated contact information for emergency vet clinic']),
            createdAt: new Date('2024-07-08').toISOString(),
        },
        {
            title: 'Senior Pet Adoption Guide',
            category: 'special_needs',
            content: 'Adopting a senior pet (typically 7+ years for dogs, 10+ years for cats) is incredibly rewarding and offers unique advantages. Older pets often come fully trained, have established personalities, and are generally calmer than younger animals. They require less intensive exercise and training, making them ideal for people with limited time or mobility. However, senior pets need special considerations for their health and comfort. They may have pre-existing medical conditions requiring ongoing treatment or medication. Joint problems like arthritis are common and require management through pain medication, supplements, and modified exercise. Dental disease is prevalent in older animals and may need professional treatment. Senior pets benefit from softer bedding to cushion aging joints and easier access to food, water, and litter boxes. They may need more frequent veterinary checkups - semi-annual exams are recommended. Diet adjustments with senior-specific formulas help manage weight and support organ function. Be prepared for higher initial and ongoing medical costs. Despite these considerations, senior pets offer deep companionship and often form strong bonds quickly, grateful for a comfortable home in their golden years.',
            steps: JSON.stringify([
                { title: 'Health Evaluation', description: 'Get comprehensive veterinary assessment of existing conditions, discuss expected care needs and costs' },
                { title: 'Home Modifications', description: 'Adapt living space with ramps, orthopedic bedding, accessible food/water, and slip-resistant surfaces' },
                { title: 'Medical Management', description: 'Establish medication routine, schedule regular checkups, monitor for age-related conditions' },
                { title: 'Comfort Optimization', description: 'Provide gentle exercise, maintain comfortable temperature, offer appropriate diet, ensure easy access to essentials' },
                { title: 'Quality of Life', description: 'Focus on comfort and happiness, adapt care as needs change, cherish time together' }
            ]),
            requirements: JSON.stringify(['Financial resources for potential higher medical costs', 'Patience and understanding of age-related limitations', 'Willingness to provide specialized care and accommodations', 'Time for more frequent veterinary visits', 'Commitment to managing chronic conditions', 'Understanding that time together may be limited but deeply meaningful', 'Accessible home environment suitable for mobility-impaired pets']),
            createdAt: new Date('2024-07-30').toISOString(),
        }
    ];

    await db.insert(adoptionGuidesNew).values(sampleGuides);
    
    console.log('✅ Adoption guides seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});