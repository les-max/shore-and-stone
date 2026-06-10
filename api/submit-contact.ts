import type { VercelRequest, VercelResponse } from '@vercel/node';

const HL_BASE = 'https://services.leadconnectorhq.com';
const HL_VERSION = '2021-07-28';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, message, companyName, consent, consentText, highlevelToken, highlevelLocationId } = req.body;

  if (!highlevelToken || !highlevelLocationId) {
    return res.status(400).json({ error: 'Missing HighLevel credentials' });
  }

  const headers = {
    'Authorization': `Bearer ${highlevelToken}`,
    'Content-Type': 'application/json',
    'Version': HL_VERSION,
  };

  const nameParts = (name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const tags = ['web_inquiry'];
  if (consent) tags.push('sms_consent');

  // Create (or upsert) the contact
  const contactRes = await fetch(`${HL_BASE}/contacts/upsert`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      locationId: highlevelLocationId,
      firstName,
      lastName,
      name,
      email,
      phone,
      source: companyName,
      tags,
    }),
  });

  if (!contactRes.ok) {
    const errorBody = await contactRes.text();
    return res.status(contactRes.status).json({ error: 'HighLevel contact creation failed', detail: errorBody });
  }

  const contactData = await contactRes.json();
  const contactId = contactData?.contact?.id;

  // Attach the message as a note so it's always visible in HighLevel
  if (message && contactId) {
    await fetch(`${HL_BASE}/contacts/${contactId}/notes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ body: message }),
    });
  }

  // Record consent as a timestamped note for compliance (TCPA/A2P paper trail)
  if (consent && contactId) {
    const stamp = new Date().toISOString();
    const consentNote = `Consent captured ${stamp} via website contact form: "${consentText || 'Agreed to be contacted by phone, text message, and email.'}"`;
    await fetch(`${HL_BASE}/contacts/${contactId}/notes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ body: consentNote }),
    });
  }

  return res.status(200).json({ success: true });
}
