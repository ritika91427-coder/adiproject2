'use strict';

import OpenAI from 'openai';

const openai = new OpenAI();

const SYSTEM_PROMPT = `You are a helpful, friendly, and professional AI assistant for Wangduk Health and Research, a hospital located in Bistupur, Jamshedpur, Jharkhand, India.

Your role is to assist patients and visitors with:
- Appointment booking guidance
- Information about hospital services and departments
- Doctor and staff information
- Hospital timings and location
- Fees and insurance queries
- Emergency assistance

Hospital details:
- Name: Wangduk Health and Research
- Location: Bistupur, Jamshedpur, Jharkhand, India
- Phone: 9263403905 (24/7 Emergency)
- Founded: 1889
- Director: Prof. Laslong Wangduk (Cardiology & Orthopedics specialist, Yoshida Award recipient, trained at AIIMS Surat)
- Staff: 145+ active healthcare professionals
- Facilities: MRI, CT Scan, Diagnostics Lab, Emergency (24x7), Pharmacy (24x7), Blood Bank, Physiotherapy
- Departments: Cardiology, Orthopedics, Radiology, Pathology, General Medicine, Pediatrics, Gynaecology, Emergency Care
- OPD Hours: Mon–Sat, 9:00 AM – 7:00 PM
- Emergency: 24x7
- Lab: 7:00 AM – 8:00 PM
- Consultation fees: General OPD ₹200–₹400, Specialist ₹400–₹800

Rules:
1. For emergencies (chest pain, difficulty breathing, severe bleeding, unconsciousness, stroke, heart attack), immediately urge them to call 9263403905 or visit the Emergency Department.
2. Never provide a medical diagnosis. Give general educational information and always recommend consulting a doctor.
3. Keep every reply SHORT — 1 to 3 sentences max. Be direct and conversational, not exhaustive.
4. Never use bullet lists or headers. Answer the specific question only.
5. If you cannot find specific information, say so in one sentence and give the phone number 9263403905.
6. Do not repeat the same fallback message. Ask a specific follow-up question to better understand the user's need.`;

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { message, history = [] } = body;

  if (!message || typeof message !== 'string') {
    return new Response(JSON.stringify({ error: 'Message is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (message.length > 500) {
    return new Response(JSON.stringify({ error: 'Message is too long (max 500 characters)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const safeHistory = Array.isArray(history)
    ? history
        .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }))
        .slice(-10)
    : [];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...safeHistory,
        { role: 'user', content: message },
      ],
      max_tokens: 120,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content
      || "I'm sorry, I couldn't process that. Please call us at 9263403905.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[AI] Chat error:', err.message);
    return new Response(
      JSON.stringify({ error: 'AI service unavailable. Please call us at 9263403905.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const config = {
  path: '/api/chat',
};
