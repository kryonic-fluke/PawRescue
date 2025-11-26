// src/app/contact/page.tsx
'use client';

import { EmailForm } from '@/components/EmailForm';

export default function ContactPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <p className="mb-6 text-gray-600">
        Have questions or feedback? Send us a message and we'll get back to you as soon as possible.
      </p>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <EmailForm />
      </div>
    </div>
  );
}