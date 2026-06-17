import React from 'react';
import { ArrowRight, MapPin, Clock, TreePine, Anchor } from 'lucide-react';

interface CedarCreekLakePageProps {
  phone: string;
  companyName: string;
  heroImage: string;
  onContact: () => void;
  onEmeraldBay: () => void;
}

export const CedarCreekLakePage: React.FC<CedarCreekLakePageProps> = ({ phone, companyName, heroImage, onContact, onEmeraldBay }) => {
  return (
    <main className="flex-1 pt-24 page-enter">

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[520px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            className="w-full h-full object-cover brightness-[0.55]"
            alt="Cedar Creek Lake Texas luxury custom home builder"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-lake/80 via-lake/20 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 md:px-10 pb-20 text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-white/30 bg-white/10 backdrop-blur-md rounded-full mb-6">
            <MapPin size={12} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Henderson County, Texas</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold serif italic leading-tight max-w-3xl mb-6">
            Cedar Creek Lake Custom Home Builder
          </h1>
          <p className="text-xl text-neutral-200 max-w-2xl font-light">
            {companyName} designs and builds bespoke lakefront homes on Cedar Creek Lake — the closest deep-water lake to Dallas.
          </p>
        </div>
      </section>

      {/* Why Cedar Creek Lake */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-luxury-gold mb-4">The Lake</p>
              <h2 className="text-4xl md:text-5xl font-bold serif italic mb-8 leading-tight">
                Texas' Best-Kept Waterfront Secret
              </h2>
              <p className="text-neutral-600 text-lg leading-relaxed mb-6">
                Cedar Creek Lake spans over 37,000 acres — the largest inland lake in Texas — just 60 miles southeast of Dallas. Deep water, protected coves, and a growing base of luxury development have made it the destination of choice for Dallas families building a legacy retreat.
              </p>
              <p className="text-neutral-600 text-lg leading-relaxed mb-10">
                Unlike Lake Travis or Lake LBJ, Cedar Creek is close enough to feel like a weekend trip and far enough to feel like a world away. For Dallas professionals and families, it's the right distance.
              </p>
              <button
                onClick={onContact}
                className="inline-flex items-center gap-3 px-10 py-4 bg-lake text-white rounded-full font-bold uppercase tracking-[0.15em] text-xs hover:bg-neutral-800 transition-colors"
              >
                Talk to Us About Building <ArrowRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: <Clock size={24} />, label: '60 Min from Dallas', desc: 'Highway 175 puts you at the lake in under an hour from the 635 corridor.' },
                { icon: <Anchor size={24} />, label: '37,000 Acres', desc: 'Largest inland lake in Texas — plenty of open water and protected coves.' },
                { icon: <TreePine size={24} />, label: 'East Texas Setting', desc: 'Piney woods, rolling hills, and clear water you won\'t find in Central Texas.' },
                { icon: <MapPin size={24} />, label: 'Multiple Communities', desc: 'Long Cove, Emerald Bay, Pinnacle Club, Star Harbor, and more.' },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="bg-neutral-50 rounded-3xl p-6">
                  <div className="text-luxury-gold mb-3">{icon}</div>
                  <p className="font-bold text-lake text-sm mb-2">{label}</p>
                  <p className="text-neutral-500 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cedar Lux as Builder */}
      <section className="py-28 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-luxury-gold mb-4">{companyName}</p>
            <h2 className="text-4xl md:text-5xl font-bold serif italic mb-6">
              Custom Homes Built for Cedar Creek Lake
            </h2>
            <p className="text-neutral-500 text-lg leading-relaxed">
              We don't build generic lake houses. Every Cedar Lux home is designed for its specific site — the cove, the water orientation, the lot topology — and built to a standard that holds value for generations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Spec & Custom Builds',
                body: 'We build both custom homes from scratch and curated spec homes for buyers who want a move-in ready property without compromise.',
              },
              {
                title: 'Waterfront Expertise',
                body: 'Dock design, water access, cove orientation — our team understands the unique requirements of lakefront construction at Cedar Creek.',
              },
              {
                title: 'Full-Service Process',
                body: 'From site selection and architecture through the final finish-out, we manage the entire build. One point of contact, start to finish.',
              },
            ].map(({ title, body }) => (
              <div key={title} className="bg-white rounded-3xl p-10">
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                <p className="text-neutral-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Communities — link to Emerald Bay */}
      <section className="py-28 bg-lake text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-luxury-gold mb-4">Where We Build</p>
            <h2 className="text-4xl font-bold serif italic">Cedar Creek Lake Communities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <button
              onClick={onEmeraldBay}
              className="text-left border border-white/10 rounded-3xl p-10 hover:border-luxury-gold transition-colors group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-luxury-gold" />
                <p className="text-luxury-gold text-[10px] font-black uppercase tracking-widest">Primary Focus</p>
              </div>
              <h3 className="text-2xl font-bold serif italic mb-3">Emerald Bay</h3>
              <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                Our flagship community — deep-water access, protected coves, and home to our most architecturally significant builds. Featured in CandysDirt and the regional press.
              </p>
              <span className="inline-flex items-center gap-2 text-luxury-gold text-xs font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
                Learn More <ArrowRight size={14} />
              </span>
            </button>
            <div className="border border-white/10 rounded-3xl p-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-white/40" />
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest">Additional Areas</p>
              </div>
              <h3 className="text-2xl font-bold serif italic mb-3">The Lake at Large</h3>
              <p className="text-neutral-300 text-sm leading-relaxed mb-4">
                We work across Cedar Creek Lake wherever the right lot meets the right client — Long Cove, Pinnacle Club, Star Harbor, Beacon Hill, and Enchanted Isle.
              </p>
              <p className="text-neutral-400 text-xs">Have a specific community or lot in mind? We'd love to hear about it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold serif italic mb-6">
            Let's Build Your Cedar Creek Home
          </h2>
          <p className="text-neutral-500 text-lg mb-10 leading-relaxed">
            Whether you have a lot, a neighborhood in mind, or just a vision — we'll tell you honestly what's possible and what it takes to make it happen on Cedar Creek Lake.
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
