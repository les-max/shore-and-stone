import type { VercelRequest, VercelResponse } from '@vercel/node';

const HL_BASE = 'https://services.leadconnectorhq.com';
const HL_VERSION = '2021-07-28';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name, email, phone, message, companyName, consent, consentText,
    highlevelToken, highlevelLocationId,
    highlevelPipelineId, highlevelPipelineStageId,
  } = req.body;

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

  // 1. Create (or upsert) the contact
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
      customFields: message
        ? [{ key: 'web_inquiry_message', field_value: message }]
        : [],
    }),
  });

  if (!contactRes.ok) {
    const errorBody = await contactRes.text();
    return res.status(contactRes.status).json({ error: 'HighLevel contact creation failed', detail: errorBody });
  }

  const contactData = await contactRes.json();
  const contactId = contactData?.contact?.id;

  // 2. Attach the message as a note
  if (message && contactId) {
    await fetch(`${HL_BASE}/contacts/${contactId}/notes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ body: message }),
    }).catch(() => {});
  }

  // 3. Record TCPA consent as a timestamped note
  if (consent && contactId) {
    const stamp = new Date().toISOString();
    const consentNote = `Consent captured ${stamp} via website contact form: "${consentText || 'Agreed to be contacted by phone, text message, and email.'}"`;
    await fetch(`${HL_BASE}/contacts/${contactId}/notes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ body: consentNote }),
    }).catch(() => {});
  }

  // 4. Create opportunity in pipeline (best-effort — does not block form success)
  if (contactId && highlevelPipelineId) {
    let stageId = highlevelPipelineStageId;
    // If no stage ID stored, look up "New Inquiry" stage by name
    if (!stageId) {
      const pipelinesRes = await fetch(
        `${HL_BASE}/opportunities/pipelines?locationId=${highlevelLocationId}`,
        { headers }
      ).catch(() => null);
      if (pipelinesRes?.ok) {
        const pipelinesData = await pipelinesRes.json().catch(() => null);
        const pipeline = pipelinesData?.pipelines?.find((p: any) => p.id === highlevelPipelineId);
        stageId = pipeline?.stages?.find((s: any) => s.name === 'New Inquiry')?.id;
      }
    }
    if (stageId) {
      await fetch(`${HL_BASE}/opportunities/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          pipelineId: highlevelPipelineId,
          pipelineStageId: stageId,
          locationId: highlevelLocationId,
          contactId,
          name: `${name} — Web Inquiry`,
          status: 'open',
        }),
      }).catch(() => {});
    }
  }

  return res.status(200).json({ success: true });
}
