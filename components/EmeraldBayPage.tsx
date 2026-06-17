import React from 'react';
import { ArrowRight, MapPin, Award, Home, Waves } from 'lucide-react';

interface EmeraldBayPageProps {
  phone: string;
  email: string;
  companyName: string;
  heroImage: string;
  onContact: () => void;
}

export const EmeraldBayPage: React.FC<EmeraldBayPageProps> = ({ phone, companyName, heroImage, onContact }) => {
  return (
    <main className="flex-1 pt-24 page-enter">

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[520px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            className="w-full h-full object-cover brightness-[0.55]"
            alt="Emerald Bay at Cedar Creek Lake luxury custom home"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-lake/80 via-lake/20 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 md:px-10 pb-20 text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-white/30 bg-white/10 backdrop-blur-md rounded-full mb-6">
            <MapPin size={12} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Cedar Creek Lake, Texas</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold serif italic leading-tight max-w-3xl mb-6">
            Emerald Bay Custom Homes
          </h1>
          <p className="text-xl text-neutral-200 max-w-2xl font-light">
            Cedar Creek Lake's most prestigious waterfront community — where Cedar Lux Properties builds its most iconic custom residences.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-luxury-gold mb-4">The Premier Community</p>
            <h2 className="text-4xl md:text-5xl font-bold serif italic mb-8 leading-tight">
              Why Emerald Bay Is Where We Build
            </h2>
            <p className="text-neutral-600 text-lg leading-relaxed mb-6">
              Emerald Bay sits at the most coveted stretch of Cedar Creek Lake — deep-water access, protected coves, and a community that holds its value unlike anywhere else in the region. For {companyName}, it's where our signature builds come to life.
            </p>
            <p className="text-neutral-600 text-lg leading-relaxed mb-10">
              We specialize in custom spec homes and bespoke builds within Emerald Bay, delivering lakefront properties that are architecturally distinctive, built for longevity, and designed to feel like a permanent escape — not a weekend house.
            </p>
            <button
              onClick={onContact}
              className="inline-flex items-center gap-3 px-10 py-4 bg-lake text-white rounded-full font-bold uppercase tracking-[0.15em] text-xs hover:bg-neutral-800 transition-colors"
            >
              Inquire About Emerald Bay <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: <Waves size={24} />, label: 'Deep Water Access', desc: 'Private boat slips and hydro-lift docks on the main body of the lake.' },
              { icon: <Home size={24} />, label: 'Custom Builds', desc: 'Every home designed from the ground up — no two are alike.' },
              { icon: <Award size={24} />, label: 'As Seen In Press', desc: 'Featured in CandysDirt and regional real estate publications.' },
              { icon: <MapPin size={24} />, label: '60 Min from Dallas', desc: 'Highway access to 635/I-20 corridor — close enough, far enough.' },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="bg-neutral-50 rounded-3xl p-6">
                <div className="text-luxury-gold mb-3">{icon}</div>
                <p className="font-bold text-lake text-sm mb-2">{label}</p>
                <p className="text-neutral-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Build */}
      <section className="py-28 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-luxury-gold mb-4">Our Approach</p>
            <h2 className="text-4xl md:text-5xl font-bold serif italic mb-6">
              Built Differently from Day One
            </h2>
            <p className="text-neutral-500 text-lg leading-relaxed">
              Most lake houses are built to a formula. Cedar Lux builds to a standard. Our Emerald Bay homes start with a site analysis — the cove orientation, the sunrise/sunset line, the dock placement — before a single architectural decision is made.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Site & Vision',
                body: 'We start with the lot, the water orientation, and your intended use. A primary residence and a legacy weekend home are designed very differently.',
              },
              {
                step: '02',
                title: 'Architecture & Design',
                body: 'Custom floor plans, waterfront-optimized layouts, and materials selected for the lake environment — cedar, stone, and steel that age with the climate.',
              },
              {
                step: '03',
                title: 'Build & Finish',
                body: 'We manage the full build in-house. No subcontractor chaos. Your home is delivered complete, move-in ready, and built to outlast the original builder by generations.',
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="bg-white rounded-3xl p-10">
                <p className="text-6xl font-black text-neutral-100 mb-4 serif">{step}</p>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-neutral-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Press */}
      <section className="py-20 bg-lake text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-luxury-gold mb-4">As Seen In</p>
          <h2 className="text-3xl md:text-4xl font-bold serif italic mb-12">
            Emerald Bay Is a Story Worth Telling
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            {[
              {
                pub: 'CandysDirt.com',
                headline: "Emerald Bay's First Spec Home Hits the Market: A Q&A with the Team Behind It",
                desc: "An inside look at how Cedar Lux approached the community's first custom spec build and what sets it apart from standard lake construction.",
              },
              {
                pub: 'CandysDirt.com',
                headline: 'Why One Experienced Lake Builder Chose Emerald Bay at Cedar Creek Lake',
                desc: 'The story behind the decision to focus on Emerald Bay — the water depth, the lot quality, and the community vision that made it the right call.',
              },
            ].map(({ pub, headline, desc }) => (
              <div key={headline} className="border border-white/10 rounded-3xl p-8">
                <p className="text-luxury-gold text-[10px] font-black uppercase tracking-widest mb-3">{pub}</p>
                <p className="font-bold serif italic text-lg mb-3 leading-snug">"{headline}"</p>
                <p className="text-neutral-300 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold serif italic mb-6">
            Ready to Build at Emerald Bay?
          </h2>
          <p className="text-neutral-500 text-lg mb-10 leading-relaxed">
            Lots are limited. If you have a specific site in mind — or want to know what's currently available at Emerald Bay — reach out directly. We respond the same day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onContact}
              className="px-12 py-5 bg-lake text-white rounded-full font-bold uppercase tracking-[0.15em] text-xs hover:bg-neutral-800 transition-colors"
            >
              Start a Conversation
            </button>
            <a
              href={`tel:${phone}`}
              className="px-12 py-5 border-2 border-lake text-lake rounded-full font-bold uppercase tracking-[0.15em] text-xs hover:bg-lake hover:text-white transition-colors"
            >
              Call {phone}
            </a>
          </div>
        </div>
      </section>

    </main>
  );
};
