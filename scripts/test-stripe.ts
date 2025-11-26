// scripts/test-stripe.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

async function testStripe() {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 5000, // 50.00 INR (minimum allowed for INR)
      currency: 'inr',
      payment_method_types: ['card'],
    });

    console.log('Payment intent created:', {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
  }
}

testStripe();