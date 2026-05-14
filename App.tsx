import React, { useState, useEffect } from 'react';
import { Property, SiteSettings } from './types';
import { INITIAL_PROPERTIES, DEFAULT_SETTINGS } from './constants';
import { supabase, adminSupabase } from './services/supabaseClient';
import { PropertyCard } from './components/PropertyCard';
import { PropertyAdmin } from './components/PropertyAdmin';
import { PropertyDetailsModal } from './components/PropertyDetailsModal';
import { ContactForm } from './components/ContactForm';
import {
  Menu, X, LayoutDashboard,
  ArrowRight, Quote, Search, ChevronLeft,
  Waves, Flag, Users, ShoppingBag, Utensils, Anchor, MapPin,
  Sun, Coffee, Star, Instagram, Facebook, Phone, Mail, ExternalLink
} from 'lucide-react';

const App: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const [view, setView] = useState<'home' | 'admin' | 'listings' | 'lifestyle' | 'about' | 'contact'>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loginError, setLoginError] = useState(false);

  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [lifestyleFilter, setLifestyleFilter] = useState<string>('All');

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [{ data: propsData }, { data: settingsData }] = await Promise.all([
          supabase.from('properties').select('*').order('created_at', { ascending: false }),
          supabase.from('settings').select('data').eq('id', 1).maybeSingle()
        ]);
        if (propsData && propsData.length > 0) setProperties(propsData as Property[]);
        if (settingsData?.data) setSettings({ ...DEFAULT_SETTINGS, ...settingsData.data });
      } catch (e) {
        console.error('Failed to load data from Supabase:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  // Update social/OG meta tags when settings change
  useEffect(() => {
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
      el.content = content;
    };
    const setNameMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.content = content;
    };
    if (settings.socialImage) {
      setMeta('og:image', settings.socialImage);
      setNameMeta('twitter:image', settings.socialImage);
    }
    setMeta('og:title', `${settings.companyName} | Cedar Creek Lake Custom Homes`);
  }, [settings.socialImage, settings.companyName]);

  // Inject External Scripts (Analytics, etc.)
  useEffect(() => {
    const existing = document.querySelectorAll('[data-injected-script="true"]');
    existing.forEach(el => el.remove());

    if (settings.externalScripts && settings.externalScripts.trim()) {
      try {
        const range = document.createRange();
        range.selectNode(document.head);
        const fragment = range.createContextualFragment(settings.externalScripts);
        
        Array.from(fragment.children).forEach(child => {
          if (child instanceof HTMLElement) {
            child.setAttribute('data-injected-script', 'true');
            document.head.appendChild(child);
          }
        });
      } catch (e) {
        console.error("Failed to inject external scripts:", e);
      }
    }
  }, [settings.externalScripts]);

  const addProperty = async (newProperty: Property) => {
    const { error } = await adminSupabase.from('properties').insert(newProperty);
    if (!error) setProperties((prev: Property[]) => [newProperty, ...prev]);
  };

  const updateProperty = async (updated: Property) => {
    const { created_at, ...data } = updated;
    const { error } = await adminSupabase.from('properties').upsert(data, { onConflict: 'id' });
    if (!error) setProperties((prev: Property[]) => prev.map((p: Property) => p.id === updated.id ? updated : p));
  };

  const deleteProperty = async (id: string) => {
    const { error } = await adminSupabase.from('properties').delete().eq('id', id);
    if (!error) setProperties((prev: Property[]) => prev.filter((p: Property) => p.id !== id));
  };

  const updateSettings = async (newSettings: SiteSettings) => {
    const { error } = await adminSupabase.from('settings').upsert({ id: 1, data: newSettings });
    if (!error) setSettings(newSettings);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'cedarcreek') {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const filteredProperties = properties.filter(p => {
    const statusMatch = filterStatus === 'All' || p.status === filterStatus;
    return statusMatch;
  });

  const statusesList = ['All', 'Available', 'Under Construction', 'Sold'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-luxury-gold font-serif italic text-xl tracking-wide">Preparing your luxury experience...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <nav className="fixed w-full z-50 glass shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('home')}>
            <img
              src={settings.logoImage}
              alt={settings.companyName}
              className="h-20 w-auto object-contain"
            />
          </div>

          <div className="hidden md:flex items-center gap-10">
            <button onClick={() => setView('home')} className={`text-xs font-bold tracking-[0.2em] uppercase transition-colors ${view === 'home' ? 'text-luxury-gold' : 'text-neutral-600 hover:text-lake'}`}>Home</button>
            <button onClick={() => setView('about')} className={`text-xs font-bold tracking-[0.2em] uppercase transition-colors ${view === 'about' ? 'text-luxury-gold' : 'text-neutral-600 hover:text-lake'}`}>About</button>
            <button onClick={() => setView('listings')} className={`text-xs font-bold tracking-[0.2em] uppercase transition-colors ${view === 'listings' ? 'text-luxury-gold' : 'text-neutral-600 hover:text-lake'}`}>Collection</button>
            <button onClick={() => setView('lifestyle')} className={`text-xs font-bold tracking-[0.2em] uppercase transition-colors ${view === 'lifestyle' ? 'text-luxury-gold' : 'text-neutral-600 hover:text-lake'}`}>Lifestyle</button>
            <button onClick={() => setView('contact')} className={`text-xs font-bold tracking-[0.2em] uppercase transition-colors ${view === 'contact' ? 'text-luxury-gold' : 'text-neutral-600 hover:text-lake'}`}>Contact</button>
            <button 
              onClick={() => setView('admin')} 
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-[0.1em] transition-[background-color,color,border-color,transform] duration-150 ease-out active:scale-[0.97] ${view === 'admin' ? 'bg-lake text-white' : 'border border-lake text-lake hover:bg-lake hover:text-white'}`}
            >
              <LayoutDashboard size={14} /> Backend
            </button>
          </div>

          <button className="md:hidden text-lake" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col p-12 pt-32 gap-8 md:hidden mobile-menu-enter">
          <button onClick={() => { setView('home'); setIsMenuOpen(false); }} className="text-3xl font-bold serif text-left">Home</button>
          <button onClick={() => { setView('about'); setIsMenuOpen(false); }} className="text-3xl font-bold serif text-left">About Us</button>
          <button onClick={() => { setView('listings'); setIsMenuOpen(false); }} className="text-3xl font-bold serif text-left">The Collection</button>
          <button onClick={() => { setView('lifestyle'); setIsMenuOpen(false); }} className="text-3xl font-bold serif text-left">Lifestyle</button>
          <button onClick={() => { setView('contact'); setIsMenuOpen(false); }} className="text-3xl font-bold serif text-left">Contact</button>
          <button onClick={() => { setView('admin'); setIsMenuOpen(false); }} className="text-3xl font-bold serif text-left text-luxury-gold">CMS Login</button>
          <div className="mt-auto flex gap-6 text-neutral-400">
            <Instagram size={24} /> <Facebook size={24} />
          </div>
        </div>
      )}

      {view === 'home' && (
        <main className="flex-1 page-enter">
          <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden">
            <div className="absolute inset-0">
              <img src={settings.heroImage} className="w-full h-full object-cover brightness-[0.65]" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-lake/60 via-transparent to-black/30"></div>
            </div>
            <div className="relative max-w-7xl mx-auto px-6 pt-24 text-white">
              <div className="hero-item hero-item-1 inline-block px-4 py-2 border border-white/30 bg-white/10 backdrop-blur-md rounded-full mb-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Exclusively Cedar Creek Lake</span>
              </div>
              <h1 className="hero-item hero-item-2 text-6xl md:text-[5.5rem] font-medium leading-[1.05] mb-8 max-w-4xl">
                {settings.heroHeadline}
              </h1>
              <p className="hero-item hero-item-3 text-xl md:text-2xl text-neutral-200 max-w-2xl mb-12 font-light">
                {settings.heroSubheadline}
              </p>
              <button onClick={() => setView('listings')} className="hero-item hero-item-4 px-12 py-5 bg-luxury-gold text-white font-bold rounded-full hover:bg-white hover:text-lake transition-[background-color,color,transform,box-shadow] duration-150 ease-out active:scale-[0.97] shadow-2xl text-lg flex items-center gap-3">
                Explore The Collection <ArrowRight size={20} />
              </button>
            </div>
          </section>

          <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex justify-between items-end mb-16">
                <div>
                  <h2 className="text-5xl md:text-6xl font-bold italic serif">Featured Homes</h2>
                  <p className="text-neutral-500 mt-4 max-w-xl">A selection of our most prestigious properties currently overlooking Cedar Creek Lake.</p>
                </div>
                <button onClick={() => setView('listings')} className="group/btn text-luxury-gold font-bold flex items-center gap-2 transition-colors pb-2 border-b-2 border-luxury-gold active:scale-[0.97] transition-transform duration-150 ease-out">
                  View Full Collection <ArrowRight size={18} className="transition-transform duration-200 ease-out group-hover/btn:translate-x-1" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {properties.slice(0, 3).map(property => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    onViewDetails={setSelectedProperty}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="py-32 bg-lake text-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1">
                <h2 className="text-5xl font-medium serif italic mb-8">{settings.lifestyleHeadline}</h2>
                <p className="text-neutral-400 text-xl font-light mb-12 leading-relaxed">{settings.lifestyleSubheadline}</p>
                <button onClick={() => setView('lifestyle')} className="px-10 py-4 border-2 border-luxury-gold text-luxury-gold font-bold rounded-full hover:bg-luxury-gold hover:text-white transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] uppercase tracking-widest text-xs">
                  Discover Lake Life
                </button>
              </div>
              <div className="flex-1 relative">
                 <img src={settings.lifestyleImage} className="rounded-3xl shadow-2xl h-[500px] w-full object-cover" alt="Lake Life" />
                 <div className="absolute -bottom-8 -left-8 bg-luxury-gold p-8 rounded-2xl max-w-xs shadow-xl hidden lg:block">
                    <Quote className="text-white/20 mb-4" size={32} />
                    <p className="text-lg font-bold italic serif mb-4 leading-tight">"{settings.lifestyleQuote}"</p>
                    <p className="text-xs uppercase tracking-widest font-black">— {settings.lifestyleQuoteAuthor}</p>
                 </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {view === 'about' && (
        <main className="flex-1 page-enter">
           <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img src="https://media.vrbo.com/lodging/70000000/69560000/69553700/69553620/9b3ca718.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill" className="w-full h-full object-cover brightness-[0.5]" alt="About Cedar Lux Properties" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
            </div>
            <div className="relative z-10 text-center text-white px-6">
               <h1 className="text-5xl md:text-7xl font-medium serif italic mb-6">Our Story</h1>
               <p className="text-xl font-light tracking-wide uppercase">Building Legacies on Cedar Creek Lake</p>
            </div>
          </section>

          <div className="max-w-4xl mx-auto px-6 py-24">
             <div className="mb-16 text-center">
                <h2 className="text-4xl font-bold serif italic mb-6 text-lake">About Cedar Lux Properties</h2>
                <p className="text-xl text-neutral-500 leading-relaxed">
                  Gary Payne founded Cedar Lux Properties in 2015, but he's been building on Cedar Creek Lake since 2011. In that time he's built everything from $250,000 homes to multi-million dollar custom builds — and every one of those projects shaped how Cedar Lux approaches the work today.
                </p>
             </div>

             <div className="space-y-16">
                <div>
                   <h3 className="text-2xl font-bold serif mb-4">What a Decade on the Lake Teaches You</h3>
                   <p className="text-neutral-500 leading-relaxed">
                     Gary evaluates lake communities differently than most. While marketing materials tend to focus on amenities and aesthetics, experienced lake builders pay closer attention to things that don't always show up on a site plan: water depth, boat access, elevation, and how people actually live day to day. Those are the details that separate a home that works from one that quietly becomes a problem later.
                   </p>
                   <blockquote className="mt-8 border-l-4 border-luxury-gold pl-6 py-2">
                      <p className="text-xl font-serif italic text-lake">"Here at Cedar Creek Lake, a lot of lake homes are primary residences. Custom building your home comes with a lot of decisions. But during the custom build process here, we have a good time. Building your dream home should be exciting."</p>
                      <footer className="text-sm font-bold uppercase tracking-widest text-neutral-400 mt-2">— Gary Payne, Founder</footer>
                   </blockquote>
                </div>

                <div className="bg-neutral-50 p-8 md:p-12 rounded-[2.5rem] border border-neutral-100">
                   <h3 className="text-2xl font-bold serif mb-4">A Family Business, Built on Detail</h3>
                   <p className="text-neutral-500 leading-relaxed">
                     Chelsea Payne is half-owner of Cedar Lux and leads the design side of the business, bringing more than 13 years of experience to every finish, fixture, and floor plan. The partnership is straightforward: Gary gets the home to sheetrock — Chelsea takes it from there. The result is a home where the craftsmanship shows in every room: foam encapsulation, hardwood floors, steel stair banisters, illuminated stair treads, slot diffusers in the ceilings, and full smart-home automation throughout.
                   </p>
                   <blockquote className="my-8 border-l-4 border-luxury-gold pl-6 py-2">
                      <p className="text-xl font-serif italic text-lake">"Something I love about Cedar Lux is how meticulous their homes are. They're extremely clean and extremely detailed."</p>
                      <footer className="text-sm font-bold uppercase tracking-widest text-neutral-400 mt-2">— Donna Smith, Duggan Realty Advisors</footer>
                   </blockquote>
                   <p className="text-neutral-500 leading-relaxed">
                     Gary describes every Cedar Lux home simply: built to the nines. Walk through one and you'll understand exactly what he means.
                   </p>
                </div>

                <div>
                   <h3 className="text-2xl font-bold serif mb-8">In the Press</h3>
                   <a
                     href="https://candysdirt.com/2025/12/19/why-one-experienced-lake-builder-chose-emerald-bay-at-cedar-creek-lake/"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="group block border border-neutral-200 rounded-[2rem] p-8 hover:border-luxury-gold hover:shadow-lg transition-all duration-200"
                   >
                     <div className="flex items-start gap-6">
                       <div className="flex-shrink-0 w-16 h-16 bg-lake rounded-2xl flex items-center justify-center">
                         <span className="text-luxury-gold font-black text-xs uppercase tracking-widest text-center leading-tight px-2">Candy's Dirt</span>
                       </div>
                       <div className="flex-1">
                         <p className="text-xs font-bold uppercase tracking-widest text-luxury-gold mb-2">CandysDirt.com — December 2025</p>
                         <h4 className="text-lg font-bold serif text-lake mb-2 group-hover:text-luxury-gold transition-colors">Why One Experienced Lake Builder Chose Emerald Bay at Cedar Creek Lake</h4>
                         <p className="text-neutral-500 text-sm leading-relaxed">A deep dive into how Gary Payne evaluates lake communities, what sets Cedar Lux apart as a builder, and why Emerald Bay earned a spot as one of the lake's preferred builders.</p>
                         <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mt-4 group-hover:text-luxury-gold transition-colors">Read the article &rarr;</p>
                       </div>
                     </div>
                   </a>
                </div>

                <div className="text-center pt-8">
                   <button onClick={() => setView('contact')} className="px-12 py-5 bg-lake text-white font-black rounded-full uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-neutral-800 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]">Start Your Project With Us</button>
                </div>
             </div>
          </div>
        </main>
      )}

      {view === 'lifestyle' && (
        <main className="flex-1 page-enter">

          {/* Hero — image anchored, text at bottom-left */}
          <section className="relative h-screen min-h-[700px] flex items-end overflow-hidden">
            <div className="absolute inset-0">
              <img src={settings.lifestyleHeroImage} className="w-full h-full object-cover object-center" alt="Lifestyle" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 w-full">
              <span className="text-xs font-bold uppercase tracking-[0.5em] text-luxury-gold mb-5 block">Cedar Creek Lake</span>
              <h1 className="text-6xl md:text-8xl font-medium serif italic text-white mb-6 max-w-4xl leading-[1.05]">{settings.lifestyleHeroHeadline}</h1>
              <p className="text-lg md:text-xl text-neutral-300 font-light max-w-2xl leading-relaxed">{settings.lifestyleHeroSubheadline}</p>
            </div>
          </section>

          {/* Key highlights strip */}
          <section className="bg-lake py-10">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { value: '60', unit: 'min', label: 'From Dallas' },
                  { value: 'Deep', unit: '', label: 'Water Lake' },
                  { value: 'Gated', unit: '', label: 'Master-Planned' },
                  { value: '18', unit: 'hole', label: 'Golf Access' },
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="text-luxury-gold font-black mb-1">
                      <span className="text-3xl">{stat.value}</span>
                      {stat.unit && <span className="text-base ml-1 font-bold">{stat.unit}</span>}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Editorial: The Lake Life */}
          <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.4em] text-luxury-gold mb-6 block">The Location</span>
                  <h2 className="text-5xl font-bold serif italic mb-8 leading-tight text-lake">More Than a Weekend.<br />A Way of Life.</h2>
                  <p className="text-neutral-500 text-lg leading-relaxed mb-6">
                    Cedar Creek Lake sits just 60 minutes southeast of Dallas — close enough for a Friday afternoon escape, far enough to feel like a world away. With deep, clean water and a growing community of full-time residents, it has become the destination of choice for families who want more than a vacation home.
                  </p>
                  <p className="text-neutral-500 text-lg leading-relaxed mb-10">
                    Emerald Bay at Cedar Creek Lake brings together the best of both: gated privacy, deep-water access, championship golf, and infrastructure built for year-round living.
                  </p>
                  <button onClick={() => setView('contact')} className="px-10 py-4 border-2 border-lake text-lake font-bold rounded-full hover:bg-lake hover:text-white transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] uppercase tracking-widest text-xs">
                    Start the Conversation
                  </button>
                </div>
                <div className="relative">
                  <img
                    src={settings.lifestyleImage}
                    className="rounded-[2.5rem] w-full h-[560px] object-cover shadow-2xl"
                    alt="Lake Life"
                  />
                  <div className="absolute -bottom-8 -left-8 bg-luxury-gold text-white p-8 rounded-2xl hidden lg:block max-w-[260px] shadow-xl">
                    <p className="text-lg font-bold serif italic leading-snug mb-3">"{settings.lifestyleQuote}"</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/70">— {settings.lifestyleQuoteAuthor}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Life Around the Lake — filterable amenity cards */}
          <section className="py-32 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <span className="text-xs font-bold uppercase tracking-[0.4em] text-luxury-gold mb-4 block">The Area</span>
                <h2 className="text-5xl font-bold serif italic mb-4">Life Around the Lake</h2>
                <p className="text-neutral-500 max-w-2xl mx-auto text-lg">From waterfront dining to championship golf, everything you need is within minutes of your front door.</p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center mb-12">
                {['All', 'Dining', 'Golf', 'Marina', 'Shopping', 'Church', 'Attraction'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setLifestyleFilter(cat)}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${lifestyleFilter === cat ? 'bg-lake text-white' : 'bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(lifestyleFilter === 'All' ? settings.localSpots : settings.localSpots.filter(s => s.category === lifestyleFilter)).map(spot => (
                  <div key={spot.id} className="bg-white rounded-3xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="relative h-52 overflow-hidden">
                      <img src={spot.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out" alt={spot.title} />
                      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-lake text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        {spot.category === 'Dining' && <Utensils size={10} />}
                        {spot.category === 'Shopping' && <ShoppingBag size={10} />}
                        {spot.category === 'Golf' && <Flag size={10} />}
                        {spot.category === 'Marina' && <Anchor size={10} />}
                        {spot.category === 'Church' && <MapPin size={10} />}
                        {spot.category === 'Attraction' && <Star size={10} />}
                        {spot.category}
                      </span>
                    </div>
                    <div className="p-7">
                      <h3 className="text-xl font-bold serif italic text-lake mb-2">{spot.title}</h3>
                      <p className="text-neutral-500 text-sm leading-relaxed">{spot.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </main>
      )}

      {view === 'listings' && (
        <main className="flex-1 pt-40 pb-32 page-enter">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
               <div>
                  <h1 className="text-6xl font-medium serif italic mb-6">The Collection</h1>
                  <p className="text-neutral-500 max-w-2xl text-lg">Browse our currently available residences and upcoming projects on Cedar Creek Lake.</p>
               </div>
               <div className="flex flex-wrap gap-4">
                  <div className="relative">
                    <select 
                      className="appearance-none bg-white border border-neutral-200 px-8 py-3 rounded-full font-bold text-sm outline-none cursor-pointer pr-12"
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                    >
                      {statusesList.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronLeft className="-rotate-90 absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={16} />
                  </div>
               </div>
            </div>
            
            {(() => {
              const featured = properties.find(p => p.isFeatured);
              if (!featured) return null;
              return (
                <div className="mb-16 rounded-[2.5rem] overflow-hidden border border-neutral-200 shadow-lg flex flex-col md:flex-row">
                  <div className="md:w-1/2 h-72 md:h-auto relative">
                    <img src={featured.image} className="w-full h-full object-cover" alt={featured.title} />
                    <div className="absolute top-6 left-6">
                      <span className="flex items-center gap-2 bg-luxury-gold text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow">
                        <Star size={12} fill="white" /> Featured Home
                      </span>
                    </div>
                  </div>
                  <div className="md:w-1/2 bg-white p-10 md:p-14 flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-luxury-gold mb-3">{featured.neighborhood}</p>
                    <h2 className="text-3xl md:text-4xl font-bold serif italic text-lake mb-2">{featured.title}</h2>
                    {featured.address && <p className="text-neutral-400 text-sm font-medium mb-6">{featured.address}</p>}
                    <div className="flex gap-6 mb-8 text-sm font-bold text-neutral-600">
                      <span>{featured.beds} Beds</span>
                      <span className="text-neutral-200">|</span>
                      <span>{featured.baths} Baths</span>
                      <span className="text-neutral-200">|</span>
                      <span>{featured.sqft.toLocaleString()} SqFt</span>
                    </div>
                    <p className="text-2xl font-black text-lake mb-8">${featured.price.toLocaleString()}</p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setSelectedProperty(featured)}
                        className="px-10 py-4 bg-lake text-white font-bold rounded-full hover:bg-neutral-800 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] uppercase tracking-widest text-xs"
                      >
                        View Details
                      </button>
                      {featured.listingUrl && (
                        <a
                          href={featured.listingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-10 py-4 bg-luxury-gold text-white font-bold rounded-full hover:bg-amber-600 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] uppercase tracking-widest text-xs flex items-center gap-2"
                        >
                          See the Listing <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredProperties.length > 0 ? (
                filteredProperties.map(property => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    onViewDetails={setSelectedProperty}
                  />
                ))
              ) : (
                <div className="col-span-full py-40 text-center">
                   <Search size={48} className="mx-auto text-neutral-200 mb-6" />
                   <h3 className="text-2xl font-bold serif italic">No properties found</h3>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {view === 'contact' && (
        <main className="flex-1 pt-40 pb-32 bg-neutral-50 page-enter">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
               <div>
                  <h1 className="text-6xl font-medium serif italic mb-8">Let's Build Your Legacy.</h1>
                  <p className="text-neutral-500 text-xl leading-relaxed mb-12 max-w-lg">
                    Every masterpiece starts with a conversation. We invite you to share your vision with us, and together we will create something truly extraordinary on the shores of Cedar Creek Lake.
                  </p>
                  
                  <div className="space-y-8">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-luxury-gold shadow-sm border border-neutral-100">
                         <Phone size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Direct Line</p>
                        <p className="text-xl font-bold text-lake">{settings.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-luxury-gold shadow-sm border border-neutral-100">
                         <Mail size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Inquiries</p>
                        <p className="text-xl font-bold text-lake">{settings.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-luxury-gold shadow-sm border border-neutral-100">
                         <MapPin size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Main Office</p>
                        <p className="text-xl font-bold text-lake">{settings.address}</p>
                      </div>
                    </div>
                  </div>
               </div>

               <ContactForm
                webhookUrl={settings.webhookUrl}
                companyName={settings.companyName}
                highlevelToken={settings.highlevelToken}
                highlevelLocationId={settings.highlevelLocationId}
                highlevelMessageFieldKey={settings.highlevelMessageFieldKey}
               />
            </div>
          </div>
        </main>
      )}

      {view === 'admin' && (
        <main className="flex-1 pt-40 pb-24 px-6 bg-neutral-100 flex items-center justify-center page-enter">
          {!isAuthenticated ? (
            <div className="w-full max-w-md bg-white p-12 rounded-[2.5rem] shadow-2xl border border-neutral-200">
              <div className="text-center mb-8">
                 <h2 className="text-3xl font-bold serif italic mb-2">CMS Access</h2>
                 <p className="text-neutral-400 text-sm">Authorized Personnel Only</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-6">
                <input 
                  type="password" 
                  placeholder="Password (cedarcreek)"
                  className={`w-full p-4 border rounded-xl outline-none text-center text-xl transition-all ${loginError ? 'border-red-500' : 'border-neutral-200'}`}
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="w-full py-4 bg-lake text-white font-black rounded-xl hover:bg-neutral-800 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] uppercase tracking-widest text-xs">Unlock Backend</button>
              </form>
            </div>
          ) : (
            <PropertyAdmin
              properties={properties}
              onAdd={addProperty}
              onUpdate={updateProperty}
              onDelete={deleteProperty}
              settings={settings}
              onUpdateSettings={updateSettings}
              onLogout={() => { setIsAuthenticated(false); setPasswordInput(''); }}
            />
          )}
        </main>
      )}

      {selectedProperty && (
        <PropertyDetailsModal 
          property={selectedProperty} 
          onClose={() => setSelectedProperty(null)} 
          onInquire={() => {
            setSelectedProperty(null);
            setView('contact');
          }}
        />
      )}

      <footer className="bg-white border-t border-neutral-100 py-16">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
               <div className="mb-4">
                 <img
                   src={settings.logoImage}
                   alt={settings.companyName}
                   className="h-16 w-auto object-contain"
                 />
               </div>
               <p className="text-neutral-400 text-xs font-medium max-w-xs uppercase tracking-wider">Unrivaled lakefront masterpieces for the discerning Texan.</p>
            </div>
            <div className="flex gap-8 text-neutral-400">
               <button onClick={() => setView('home')} className="hover:text-lake transition-colors text-xs font-bold uppercase tracking-widest">Home</button>
               <button onClick={() => setView('about')} className="hover:text-lake transition-colors text-xs font-bold uppercase tracking-widest">About</button>
               <button onClick={() => setView('listings')} className="hover:text-lake transition-colors text-xs font-bold uppercase tracking-widest">Collection</button>
               <button onClick={() => setView('lifestyle')} className="hover:text-lake transition-colors text-xs font-bold uppercase tracking-widest">Lifestyle</button>
               <button onClick={() => setView('contact')} className="hover:text-lake transition-colors text-xs font-bold uppercase tracking-widest">Contact</button>
            </div>
            <div className="text-center md:text-right">
               <p className="text-neutral-400 text-[10px] uppercase font-bold tracking-widest mb-2">Contact</p>
               <p className="font-bold text-lake">{settings.phone}</p>
            </div>
         </div>
      </footer>
      
    </div>
  );
};

export default App;