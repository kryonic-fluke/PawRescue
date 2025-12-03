import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// Initialize Gemini
// Ensure you added GEMINI_API_KEY to your .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" }); // Flash is faster/cheaper for chat

router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, selectedPets, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. Construct the Context (The "Brain" for this specific chat)
    const petContext = selectedPets && selectedPets.length > 0
      ? `
      The user is comparing the following pets. USE THIS DATA to answer questions.
      ${selectedPets.map((p: any) => `
        - Name: ${p.name}
        - Type: ${p.type} (${p.breed})
        - Age: ${p.age}
        - Temperament: ${p.temperament || 'Unknown'}
        - Energy Level: ${p.energy || 'Unknown'}
        - Good with Kids: ${p.goodWithKids || 'Unknown'}
        - Description: ${p.description || 'No specific description provided'}
      `).join('\n')}
      `
      : "The user has not selected any specific pets to compare yet.";

    const systemPrompt = `
      You are an expert Pet Adoption Advisor named "PawPal".
      Your goal is to help users choose the right pet for their lifestyle based ONLY on the provided data.
      
      CONTEXT:
      ${petContext}

      RULES:
      1. Be friendly, encouraging, and empathetic.
      2. If comparing pets, highlight distinct differences (e.g., "Bruno is higher energy compared to Milo").
      3. If the data is missing (like vaccination status), say you don't know rather than guessing.
      4. Keep answers concise (under 3 sentences) unless the user asks for a detailed comparison.
    `;

    // 2. Format History for Gemini API (Convert 'user'/'ai' to 'user'/'model')
    // We limit history to last 10 messages to save tokens/speed
    const chatHistory = (history || []).slice(-10).map((msg: any) => ({
      role: msg.sender === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // 3. Start Chat Session
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }] 
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am ready to advise on these pets." }]
        },
        ...chatHistory
      ],
    });

    // 4. Send Message
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ response: text });

  } catch (error: any) {
    console.error('❌ AI Chat Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate response', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

export default router;