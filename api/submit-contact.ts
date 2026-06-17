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
    notificationEmail,
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
  if (contactId && highlevelPipelineId && highlevelPipelineStageId) {
    await fetch(`${HL_BASE}/opportunities/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        pipelineId: highlevelPipelineId,
        pipelineStageId: highlevelPipelineStageId,
        locationId: highlevelLocationId,
        contactId,
        name: `${name} — Web Inquiry`,
        status: 'open',
      }),
    }).catch(() => {});
  }

  // 5. Send auto-reply email to inquirer (best-effort)
  if (contactId && email) {
    await sendAutoReply({ headers, contactId, locationId: highlevelLocationId, name, email, companyName }).catch(() => {});
  }

  // 6. Send new-inquiry notification to the notification email (best-effort)
  if (notificationEmail && name && email) {
    await sendNotification({ headers, locationId: highlevelLocationId, notificationEmail, name, email, phone, message, companyName }).catch(() => {});
  }

  return res.status(200).json({ success: true });
}

async function sendAutoReply({
  headers, contactId, locationId, name, email, companyName,
}: {
  headers: Record<string, string>;
  contactId: string;
  locationId: string;
  name: string;
  email: string;
  companyName: string;
}) {
  // Find or create conversation for this contact
  const searchRes = await fetch(
    `${HL_BASE}/conversations/search?contactId=${contactId}&locationId=${locationId}`,
    { headers }
  );
  const searchData = await searchRes.json();
  let conversationId = searchData?.conversations?.[0]?.id;

  if (!conversationId) {
    const createRes = await fetch(`${HL_BASE}/conversations/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ contactId, locationId }),
    });
    const createData = await createRes.json();
    conversationId = createData?.conversation?.id;
  }

  if (!conversationId) return;

  const firstName = (name || '').trim().split(/\s+/)[0] || 'there';
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <p style="font-size: 16px;">Dear ${firstName},</p>
      <p style="font-size: 16px; line-height: 1.7;">
        Thank you for reaching out to ${companyName}. We have received your inquiry and one of our senior consultants
        will be in touch with you shortly to discuss your interest in Cedar Creek Lake properties.
      </p>
      <p style="font-size: 16px; line-height: 1.7;">
        In the meantime, feel free to browse our current listings at
        <a href="https://cedarluxproperties.com" style="color: #0c1c2c;">cedarluxproperties.com</a>.
      </p>
      <p style="font-size: 16px; margin-top: 32px;">Warm regards,<br/><strong>${companyName}</strong></p>
    </div>
  `;

  await fetch(`${HL_BASE}/conversations/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: 'Email',
      conversationId,
      contactId,
      subject: `We received your inquiry — ${companyName}`,
      html,
    }),
  });
}

async function sendNotification({
  headers, locationId, notificationEmail, name, email, phone, message, companyName,
}: {
  headers: Record<string, string>;
  locationId: string;
  notificationEmail: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  companyName: string;
}) {
  // Find or create the internal notification contact (the recipient — Brad)
  const notifContactRes = await fetch(`${HL_BASE}/contacts/upsert`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ locationId, email: notificationEmail }),
  });
  const notifContactData = await notifContactRes.json();
  const notifContactId = notifContactData?.contact?.id;
  if (!notifContactId) return;

  const searchRes = await fetch(
    `${HL_BASE}/conversations/search?contactId=${notifContactId}&locationId=${locationId}`,
    { headers }
  );
  const searchData = await searchRes.json();
  let conversationId = searchData?.conversations?.[0]?.id;

  if (!conversationId) {
    const createRes = await fetch(`${HL_BASE}/conversations/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ contactId: notifContactId, locationId }),
    });
    const createData = await createRes.json();
    conversationId = createData?.conversation?.id;
  }

  if (!conversationId) return;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #0c1c2c;">New Web Inquiry — ${companyName}</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px 0; font-weight: bold; width: 120px;">Name</td><td style="padding: 8px 0;">${name}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Email</td><td style="padding: 8px 0;">${email}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Phone</td><td style="padding: 8px 0;">${phone || '—'}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Message</td><td style="padding: 8px 0;">${message || '—'}</td></tr>
      </table>
      <p style="margin-top: 24px; color: #666; font-size: 13px;">
        This lead has been added to your CRM at <a href="https://app.gohighlevel.com">app.gohighlevel.com</a>.
      </p>
    </div>
  `;

  await fetch(`${HL_BASE}/conversations/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: 'Email',
      conversationId,
      contactId: notifContactId,
      subject: `New inquiry from ${name} — ${companyName}`,
      html,
    }),
  });
}
