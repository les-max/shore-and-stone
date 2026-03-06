import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

interface ContactFormProps {
  webhookUrl: string;
  companyName: string;
  prefillMessage?: string;
  highlevelToken?: string;
  highlevelLocationId?: string;
  highlevelMessageFieldKey?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ webhookUrl, companyName, prefillMessage, highlevelToken, highlevelLocationId, highlevelMessageFieldKey }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: prefillMessage || ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const useHighLevel = highlevelToken && highlevelLocationId;
    if (!useHighLevel && !webhookUrl) {
      setStatus('error');
      setErrorMessage('Form submission is currently unavailable. Please contact us via phone.');
      return;
    }

    setStatus('submitting');
    try {
      if (useHighLevel) {
        // Split name into first/last for HighLevel contact fields
        const nameParts = formData.name.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Resolve the field key to a UUID by looking up the location's custom fields
        let customFields: { id: string; field_value: string }[] = [];
        if (formData.message && highlevelMessageFieldKey) {
          try {
            const fieldsRes = await fetch(`https://services.leadconnectorhq.com/locations/${highlevelLocationId}/customFields`, {
              headers: {
                'Authorization': `Bearer ${highlevelToken}`,
                'Version': '2021-07-28',
              },
            });
            if (fieldsRes.ok) {
              const fieldsData = await fieldsRes.json();
              const fields = fieldsData.customFields || fieldsData.data || [];
              const match = fields.find((f: { id: string; fieldKey?: string; key?: string }) =>
                f.fieldKey === highlevelMessageFieldKey || f.key === highlevelMessageFieldKey
              );
              if (match?.id) {
                customFields = [{ id: match.id, field_value: formData.message }];
              }
            }
          } catch {
            // If lookup fails, proceed without the custom field
          }
        }

        // Create contact in HighLevel
        const contactRes = await fetch('https://services.leadconnectorhq.com/contacts/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${highlevelToken}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28',
          },
          body: JSON.stringify({
            locationId: highlevelLocationId,
            firstName,
            lastName,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            source: companyName,
            tags: ['web_inquiry'],
            ...(customFields.length > 0 && { customFields }),
          }),
        });

        if (!contactRes.ok) throw new Error('HighLevel contact creation failed');
      } else {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            source: 'Website Contact Form',
            submittedAt: new Date().toISOString(),
            company: companyName
          }),
        });
        if (!response.ok) throw new Error('Failed to send message');
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again or call us directly.');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-neutral-100 text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} />
        </div>
        <h3 className="text-3xl font-bold serif italic">Message Received</h3>
        <p className="text-neutral-500 max-w-sm mx-auto">Thank you for reaching out to {companyName}. One of our senior consultants will be in touch with you shortly.</p>
        <button 
          onClick={() => setStatus('idle')}
          className="px-8 py-3 bg-lake text-white rounded-full font-bold uppercase tracking-widest text-xs"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-neutral-100">
      <h3 className="text-3xl font-bold serif italic mb-2">Inquire Privately</h3>
      <p className="text-neutral-400 mb-8 font-medium">Please fill out the form below and we will contact you to discuss your project.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Full Name</label>
            <input 
              required
              type="text" 
              className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:border-luxury-gold transition-colors"
              placeholder="John Doe"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Email Address</label>
            <input 
              required
              type="email" 
              className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:border-luxury-gold transition-colors"
              placeholder="john@example.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">Telephone</label>
          <input 
            required
            type="tel" 
            className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:border-luxury-gold transition-colors"
            placeholder="(214) 555-0199"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-2">How can we help you?</label>
          <textarea 
            required
            className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:border-luxury-gold transition-colors h-40 resize-none"
            placeholder="I'm interested in building a custom home..."
            value={formData.message}
            onChange={e => setFormData({...formData, message: e.target.value})}
          />
        </div>

        {status === 'error' && (
          <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            <AlertCircle size={18} />
            {errorMessage}
          </div>
        )}

        <button 
          disabled={status === 'submitting'}
          type="submit" 
          className="w-full py-5 bg-lake text-white rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {status === 'submitting' ? 'Transmitting Inquest...' : <>Submit Inquiry <Send size={16} /></>}
        </button>
      </form>
    </div>
  );
};