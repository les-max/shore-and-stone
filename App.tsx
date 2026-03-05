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
  Sun, Coffee, Star, Instagram, Facebook, Phone, Mail
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

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [{ data: propsData }, { data: settingsData }] = await Promise.all([
          supabase.from('properties').select('*').order('created_at', { ascending: false }),
          supabase.from('settings').select('data').eq('id', 1).single()
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
    const { error } = await adminSupabase.from('properties').update(data).eq('id', updated.id);
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
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-[0.1em] transition-all ${view === 'admin' ? 'bg-lake text-white' : 'border border-lake text-lake hover:bg-lake hover:text-white'}`}
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
        <div className="fixed inset-0 z-[60] bg-white flex flex-col p-12 pt-32 gap-8 md:hidden">
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
        <main className="flex-1">
          <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden">
            <div className="absolute inset-0">
              <img src={settings.heroImage} className="w-full h-full object-cover brightness-[0.65]" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-lake/60 via-transparent to-black/30"></div>
            </div>
            <div className="relative max-w-7xl mx-auto px-6 pt-24 text-white">
              <div className="inline-block px-4 py-2 border border-white/30 bg-white/10 backdrop-blur-md rounded-full mb-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Exclusively Cedar Creek Lake</span>
              </div>
              <h1 className="text-6xl md:text-[5.5rem] font-medium leading-[1.05] mb-8 max-w-4xl">
                {settings.heroHeadline}
              </h1>
              <p className="text-xl md:text-2xl text-neutral-200 max-w-2xl mb-12 font-light">
                {settings.heroSubheadline}
              </p>
              <button onClick={() => setView('listings')} className="px-12 py-5 bg-luxury-gold text-white font-bold rounded-full hover:bg-white hover:text-lake transition-all shadow-2xl text-lg flex items-center gap-3">
                Explore The Collection <ArrowRight size={20} />
              </button>
            </div>
          </section>

          <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex justify-between items-end mb-16">
                <div>
                  <h2 className="text-5xl md:text-6xl font-bold italic serif">Featured Estates</h2>
                  <p className="text-neutral-500 mt-4 max-w-xl">A selection of our most prestigious properties currently overlooking Cedar Creek Lake.</p>
                </div>
                <button onClick={() => setView('listings')} className="text-luxury-gold font-bold flex items-center gap-2 hover:gap-4 transition-all pb-2 border-b-2 border-luxury-gold">
                  View Full Collection <ArrowRight size={18} />
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
                <button onClick={() => setView('lifestyle')} className="px-10 py-4 border-2 border-luxury-gold text-luxury-gold font-bold rounded-full hover:bg-luxury-gold hover:text-white transition-all uppercase tracking-widest text-xs">
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
        <main className="flex-1">
           <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img src="https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover brightness-[0.5]" alt="About Cedar Lux" />
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
                  At Cedar Lux Properties, our passion is creating exceptional lakefront and lake-inspired homes that blend thoughtful design with everyday livability. Founded in 2015 by real-estate developer Gary Payne, Cedar Lux has built its reputation on quality, attention to detail, and a deep understanding of what makes lake living truly rewarding.
                </p>
             </div>

             <div className="space-y-16">
                <div>
                   <h3 className="text-2xl font-bold serif mb-4">A Builder With Lake Expertise</h3>
                   <p className="text-neutral-500 leading-relaxed">
                     Gary has been building on Cedar Creek Lake since 2011, giving him first-hand insight into the features and infrastructure that matter most — not just on paper, but in real life. His experience evaluating communities led him to partner with Emerald Bay at Cedar Creek Lake, a master-planned, gated lake community designed for full-time living and long-term enjoyment.
                   </p>
                </div>

                <div className="bg-neutral-50 p-8 md:p-12 rounded-[2.5rem] border border-neutral-100">
                   <h3 className="text-2xl font-bold serif mb-4">Homes Designed for Real Life</h3>
                   <p className="text-neutral-500 leading-relaxed">
                     Our first spec home at Emerald Bay brings the Cedar Lux vision to life: a spacious, luxury residence that showcases how a thoughtfully crafted home feels and functions on the lake.
                   </p>
                   <blockquote className="my-8 border-l-4 border-luxury-gold pl-6 py-2">
                      <p className="text-xl font-serif italic text-lake">"Built to the nines."</p>
                      <footer className="text-sm font-bold uppercase tracking-widest text-neutral-400 mt-2">— Gary Payne</footer>
                   </blockquote>
                </div>
                
                <div className="text-center pt-8">
                   <button onClick={() => setView('contact')} className="px-12 py-5 bg-lake text-white font-black rounded-full uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-neutral-800 transition-all">Start Your Project With Us</button>
                </div>
             </div>
          </div>
        </main>
      )}

      {view === 'lifestyle' && (
        <main className="flex-1">
          <section className="relative h-[80vh] flex items-center justify-center text-center overflow-hidden">
            <div className="absolute inset-0">
              <img src={settings.lifestyleHeroImage} className="w-full h-full object-cover brightness-[0.4]" alt="Lifestyle" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-neutral-50/10"></div>
            </div>
            <div className="relative z-10 text-white max-w-4xl px-6">
              <span className="text-xs font-bold uppercase tracking-[0.5em] text-luxury-gold mb-6 block">The Experience</span>
              <h1 className="text-5xl md:text-8xl font-medium serif italic mb-8">{settings.lifestyleHeroHeadline}</h1>
              <p className="text-xl md:text-2xl text-neutral-300 font-light leading-relaxed">{settings.lifestyleHeroSubheadline}</p>
            </div>
          </section>
          
          <section className="py-32 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row items-center gap-16">
                <div className="flex-1">
                  <h2 className="text-4xl md:text-5xl font-bold serif italic mb-6">The Best of Both Worlds</h2>
                  <p className="text-neutral-500 text-lg leading-relaxed mb-8">
                    Located just 60 minutes from the Dallas metroplex, Cedar Creek Lake is the premier sanctuary for the city's most discerning families.
                  </p>
                </div>
                <div className="flex-1 w-full h-[400px] bg-neutral-100 rounded-[3rem] overflow-hidden border border-neutral-100">
                   <img src="https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=2070" className="w-full h-full object-cover opacity-80" alt="Dallas Lake Life" />
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {view === 'listings' && (
        <main className="flex-1 pt-40 pb-32">
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
        <main className="flex-1 pt-40 pb-32 bg-neutral-50">
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
               />
            </div>
          </div>
        </main>
      )}

      {view === 'admin' && (
        <main className="flex-1 pt-40 pb-24 px-6 bg-neutral-100 flex items-center justify-center">
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
                <button type="submit" className="w-full py-4 bg-lake text-white font-black rounded-xl hover:bg-neutral-800 transition-all uppercase tracking-widest text-xs">Unlock Backend</button>
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
               <img 
                 src={settings.logoImage} 
                 alt={settings.companyName} 
                 className="h-16 w-auto mb-4 mx-auto md:mx-0 object-contain"
               />
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