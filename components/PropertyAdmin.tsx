import React, { useState } from 'react';
import { Property, PropertyStatus, SiteSettings, LocalSpot } from '../types';
import { Layout, Settings, Edit2, Trash2, X, Sun, LogOut, Plus, Save, CheckCircle, Zap, Star, MapPin, Upload, Loader2 } from 'lucide-react';
import { adminSupabase } from '../services/supabaseClient';

interface PropertyAdminProps {
  properties: Property[];
  onAdd: (property: Property) => void;
  onUpdate: (property: Property) => void;
  onDelete: (id: string) => void;
  settings: SiteSettings;
  onUpdateSettings: (settings: SiteSettings) => void;
  onLogout: () => void;
}

export const PropertyAdmin: React.FC<PropertyAdminProps> = ({ 
  properties, 
  onAdd, 
  onUpdate,
  onDelete, 
  settings, 
  onUpdateSettings,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'settings' | 'lifestyle'>('inventory');
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    price: 0,
    beds: 0,
    baths: 0,
    sqft: 0,
    description: '',
    image: '',
    gallery: [],
    status: 'Available',
    neighborhood: settings.neighborhoods[0] || 'Cedar Creek Lake',
    features: [],
    address: '',
    isFeatured: false,
    listingUrl: ''
  });
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [tempSettings, setTempSettings] = useState<SiteSettings>(settings);

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${folder}/${Date.now()}.${ext}`;
    const { error } = await adminSupabase.storage.from('images').upload(filename, file, { upsert: true });
    if (error) { console.error('Upload error:', error); return null; }
    return adminSupabase.storage.from('images').getPublicUrl(filename).data.publicUrl;
  };

  const handleUpload = async (file: File, folder: string, fieldKey: string, onUrl: (url: string) => void) => {
    setUploadingField(fieldKey);
    const url = await uploadImage(file, folder);
    if (url) onUrl(url);
    setUploadingField(null);
  };
  const [isAddingSpot, setIsAddingSpot] = useState(false);
  const [editingSpot, setEditingSpot] = useState<LocalSpot | null>(null);
  const [spotForm, setSpotForm] = useState<Partial<LocalSpot>>({ title: '', category: 'Dining', description: '', image: '', isFeatured: false });

  const startEditSpot = (spot: LocalSpot) => {
    setEditingSpot(spot);
    setSpotForm({ ...spot });
    setIsAddingSpot(true);
  };

  const handleSpotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSpot) {
      setTempSettings({ ...tempSettings, localSpots: tempSettings.localSpots.map(s => s.id === editingSpot.id ? { ...s, ...spotForm } as LocalSpot : s) });
    } else {
      const newSpot: LocalSpot = { ...spotForm as LocalSpot, id: Math.random().toString(36).substr(2, 9) };
      setTempSettings({ ...tempSettings, localSpots: [...tempSettings.localSpots, newSpot] });
    }
    setIsAddingSpot(false);
    setEditingSpot(null);
    setSpotForm({ title: '', category: 'Dining', description: '', image: '', isFeatured: false });
  };

  const deleteSpot = (id: string) => {
    setTempSettings({ ...tempSettings, localSpots: tempSettings.localSpots.filter(s => s.id !== id) });
  };

  const startEdit = (prop: Property) => {
    setEditingProperty(prop);
    setFormData({ ...prop, gallery: prop.gallery || [] });
    setNewGalleryUrl('');
    setIsAdding(true);
  };

  const handlePropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProperty) {
      onUpdate({ ...formData, id: editingProperty.id } as Property);
    } else {
      const newProperty: Property = {
        ...formData as Property,
        id: Math.random().toString(36).substr(2, 9),
      };
      onAdd(newProperty);
    }
    setIsAdding(false);
    setEditingProperty(null);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    await onUpdateSettings(tempSettings);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100 flex flex-col md:flex-row min-h-[700px] w-full max-w-6xl mx-auto">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-lake p-8 text-white flex flex-col">
        <h2 className="text-xl font-bold italic serif mb-12">CMS Dashboard</h2>
        <nav className="flex-1 space-y-4">
          <button 
            onClick={() => setActiveTab('inventory')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-luxury-gold' : 'hover:bg-white/10'}`}
          >
            <Layout size={18} /> <span className="font-bold text-sm">Inventory</span>
          </button>
          <button 
            onClick={() => setActiveTab('lifestyle')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'lifestyle' ? 'bg-luxury-gold' : 'hover:bg-white/10'}`}
          >
            <Sun size={18} /> <span className="font-bold text-sm">Lifestyle Content</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-luxury-gold' : 'hover:bg-white/10'}`}
          >
            <Settings size={18} /> <span className="font-bold text-sm">General Settings</span>
          </button>
        </nav>
        <button onClick={onLogout} className="mt-8 pt-8 border-t border-white/10 text-white/50 hover:text-white flex items-center gap-2">
          <LogOut size={16} /> Log Out
        </button>
      </div>

      {/* Main Panel */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[800px]">
        {activeTab === 'inventory' && (
           <div className="space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-3xl font-bold serif italic">Property Management</h3>
                 {!isAdding && (
                   <button 
                    onClick={() => { setIsAdding(true); setEditingProperty(null); }}
                    className="bg-lake text-white px-6 py-2 rounded-full font-bold flex items-center gap-2"
                   >
                     <Plus size={18} /> New Listing
                   </button>
                 )}
              </div>

              {isAdding ? (
                 <form onSubmit={handlePropertySubmit} className="bg-neutral-50 p-8 rounded-3xl border border-neutral-200 space-y-6">
                    <div className="flex justify-between items-center mb-4">
                       <h4 className="text-xl font-bold">{editingProperty ? 'Edit Residence' : 'Add Residence'}</h4>
                       <button onClick={() => setIsAdding(false)}><X /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-neutral-400">Title</label>
                          <input className="w-full p-3 border rounded-xl" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-neutral-400">Address</label>
                          <input className="w-full p-3 border rounded-xl" placeholder="123 Lakeview Dr, Mabank, TX" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-neutral-400">Price (USD)</label>
                          <input type="number" className="w-full p-3 border rounded-xl" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} required />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-neutral-400">Listing URL ("See the Listing" button)</label>
                          <input className="w-full p-3 border rounded-xl" placeholder="https://zillow.com/..." value={formData.listingUrl || ''} onChange={e => setFormData({...formData, listingUrl: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-neutral-400">Status</label>
                          <select className="w-full p-3 border rounded-xl" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as PropertyStatus})}>
                             <option value="Available">Available</option>
                             <option value="Under Construction">Under Construction</option>
                             <option value="Sold">Sold</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-neutral-400">Bedrooms</label>
                          <input type="number" step="1" className="w-full p-3 border rounded-xl" value={formData.beds} onChange={e => setFormData({...formData, beds: Number(e.target.value)})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-neutral-400">Bathrooms</label>
                          <input type="number" step="0.5" className="w-full p-3 border rounded-xl" value={formData.baths} onChange={e => setFormData({...formData, baths: Number(e.target.value)})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-neutral-400">SqFt</label>
                          <input type="number" className="w-full p-3 border rounded-xl" value={formData.sqft} onChange={e => setFormData({...formData, sqft: Number(e.target.value)})} />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase text-neutral-400">Description</label>
                       <textarea className="w-full p-3 border rounded-xl h-32" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>

                    {/* Photo Management */}
                    <div className="space-y-3">
                       <label className="text-xs font-bold uppercase text-neutral-400">Photos</label>

                       {/* Key Photo */}
                       <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-luxury-gold flex items-center gap-1.5">
                            <Star size={12} fill="currentColor" /> Key Photo (shown on listing card)
                          </p>
                          <div className="flex gap-3 items-center">
                            {formData.image && (
                              <img src={formData.image} className="w-20 h-14 object-cover rounded-lg flex-shrink-0 border border-neutral-100" alt="Key" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            )}
                            <input
                              className="flex-1 p-3 border rounded-xl text-sm"
                              placeholder="https://... or upload →"
                              value={formData.image || ''}
                              onChange={e => setFormData({...formData, image: e.target.value})}
                              required
                            />
                            <label className="cursor-pointer px-4 py-3 bg-lake text-white rounded-xl flex items-center gap-1.5 text-sm font-bold flex-shrink-0 hover:bg-neutral-800 transition-colors">
                              {uploadingField === 'keyPhoto' ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                              <span>Upload</span>
                              <input type="file" accept="image/*" className="sr-only" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], 'properties', 'keyPhoto', url => setFormData(f => ({...f, image: url}))); e.target.value = ''; }} />
                            </label>
                          </div>
                       </div>

                       {/* Gallery Photos */}
                       <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Gallery Photos (shown in detail view)</p>
                          {(formData.gallery || []).map((url, idx) => (
                            <div key={idx} className="flex gap-3 items-center">
                              <img src={url} className="w-14 h-10 object-cover rounded-lg flex-shrink-0 border border-neutral-100" alt="" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              <span className="flex-1 text-xs text-neutral-500 truncate font-mono">{url}</span>
                              <button
                                type="button"
                                title="Set as key photo"
                                onClick={() => {
                                  const oldKey = formData.image || '';
                                  const newGallery = (formData.gallery || []).filter((_, i) => i !== idx);
                                  if (oldKey) newGallery.splice(idx, 0, oldKey);
                                  setFormData({...formData, image: url, gallery: newGallery});
                                }}
                                className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-luxury-gold border border-luxury-gold rounded-full hover:bg-luxury-gold hover:text-white transition-all flex-shrink-0"
                              >
                                Set Key
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormData({...formData, gallery: (formData.gallery || []).filter((_, i) => i !== idx)})}
                                className="p-1.5 text-neutral-300 hover:text-red-500 transition-colors flex-shrink-0"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                          <div className="flex gap-2 pt-2 border-t border-neutral-100">
                            <input
                              className="flex-1 p-3 border rounded-xl text-sm"
                              placeholder="Add photo URL..."
                              value={newGalleryUrl}
                              onChange={e => setNewGalleryUrl(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (newGalleryUrl.trim()) {
                                    setFormData({...formData, gallery: [...(formData.gallery || []), newGalleryUrl.trim()]});
                                    setNewGalleryUrl('');
                                  }
                                }
                              }}
                            />
                            <label className="cursor-pointer px-4 py-2 bg-neutral-100 text-neutral-600 rounded-xl font-bold text-sm flex items-center gap-1.5 flex-shrink-0 hover:bg-neutral-200 transition-colors">
                              {uploadingField === 'gallery' ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                              <input type="file" accept="image/*" className="sr-only" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], 'properties', 'gallery', url => setFormData(f => ({...f, gallery: [...(f.gallery || []), url]}))); e.target.value = ''; }} />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                if (newGalleryUrl.trim()) {
                                  setFormData({...formData, gallery: [...(formData.gallery || []), newGalleryUrl.trim()]});
                                  setNewGalleryUrl('');
                                }
                              }}
                              className="px-4 py-2 bg-lake text-white rounded-xl font-bold text-sm flex items-center gap-1.5 flex-shrink-0"
                            >
                              <Plus size={16} /> Add
                            </button>
                          </div>
                       </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer select-none bg-neutral-100 p-4 rounded-xl w-fit">
                       <div className={`w-10 h-6 rounded-full transition-colors flex items-center ${formData.isFeatured ? 'bg-luxury-gold' : 'bg-neutral-300'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${formData.isFeatured ? 'translate-x-4' : 'translate-x-0'}`} />
                       </div>
                       <input type="checkbox" className="sr-only" checked={!!formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} />
                       <Star size={16} className={formData.isFeatured ? 'text-luxury-gold' : 'text-neutral-400'} />
                       <span className="text-sm font-bold">Mark as Featured Home</span>
                    </label>
                    <div className="flex justify-end gap-4">
                       <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 font-bold text-neutral-500">Cancel</button>
                       <button type="submit" className="bg-luxury-gold text-white px-8 py-2 rounded-full font-bold">Save Listing</button>
                    </div>
                 </form>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                   {properties.map(p => (
                      <div key={p.id} className="bg-neutral-50 p-6 rounded-2xl flex items-center justify-between border border-neutral-100">
                         <div className="flex items-center gap-6">
                            <img src={p.image} className="w-20 h-16 object-cover rounded-xl" alt="" />
                            <div>
                               <div className="flex items-center gap-2">
                                 <h4 className="font-bold text-lake">{p.title}</h4>
                                 {p.isFeatured && <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-luxury-gold"><Star size={10} fill="currentColor" /> Featured</span>}
                              </div>
                               <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">{p.beds} Beds • {p.baths} Baths • {p.status}</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => startEdit(p)} className="p-3 bg-white rounded-xl text-neutral-400 hover:text-lake transition-colors"><Edit2 size={18}/></button>
                            <button onClick={() => onDelete(p.id)} className="p-3 bg-white rounded-xl text-neutral-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                         </div>
                      </div>
                   ))}
                </div>
              )}
           </div>
        )}

        {activeTab === 'lifestyle' && (
           <div className="space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-3xl font-bold serif italic">Lifestyle Content</h3>
                 <button onClick={saveSettings} disabled={isSaving} className="bg-lake text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 disabled:opacity-50">
                    {saveSuccess ? <><CheckCircle size={18} /> Saved!</> : <><Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}</>}
                 </button>
              </div>
              <div className="grid grid-cols-1 gap-8">
                 <div className="space-y-4 bg-neutral-50 p-8 rounded-3xl border border-neutral-100">
                    <h4 className="font-bold text-neutral-400 uppercase tracking-widest text-xs">Hero Section (Lifestyle Page)</h4>
                    <input 
                      placeholder="Lifestyle Hero Headline" 
                      className="w-full p-4 border rounded-xl" 
                      value={tempSettings.lifestyleHeroHeadline} 
                      onChange={e => setTempSettings({...tempSettings, lifestyleHeroHeadline: e.target.value})} 
                    />
                    <textarea 
                      placeholder="Lifestyle Hero Subheadline" 
                      className="w-full p-4 border rounded-xl h-24" 
                      value={tempSettings.lifestyleHeroSubheadline} 
                      onChange={e => setTempSettings({...tempSettings, lifestyleHeroSubheadline: e.target.value})} 
                    />
                    <div className="flex gap-2">
                      <input
                        placeholder="Hero Image URL"
                        className="flex-1 p-4 border rounded-xl"
                        value={tempSettings.lifestyleHeroImage}
                        onChange={e => setTempSettings({...tempSettings, lifestyleHeroImage: e.target.value})}
                      />
                      <label className="cursor-pointer px-4 py-3 bg-lake text-white rounded-xl flex items-center gap-1.5 text-sm font-bold flex-shrink-0 hover:bg-neutral-800 transition-colors">
                        {uploadingField === 'lifestyleHeroImage' ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                        <input type="file" accept="image/*" className="sr-only" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], 'settings', 'lifestyleHeroImage', url => setTempSettings(s => ({...s, lifestyleHeroImage: url}))); e.target.value = ''; }} />
                      </label>
                    </div>
                 </div>
                 
                 <div className="space-y-4 bg-neutral-50 p-8 rounded-3xl border border-neutral-100">
                    <div className="flex justify-between items-center">
                       <h4 className="font-bold text-neutral-400 uppercase tracking-widest text-xs">Local Amenities</h4>
                       {!isAddingSpot && (
                         <button onClick={() => { setIsAddingSpot(true); setEditingSpot(null); setSpotForm({ title: '', category: 'Dining', description: '', image: '', isFeatured: false }); }} className="bg-lake text-white px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5">
                           <Plus size={14} /> Add Spot
                         </button>
                       )}
                    </div>
                    {isAddingSpot ? (
                      <form onSubmit={handleSpotSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-neutral-200">
                        <div className="flex justify-between items-center">
                          <h5 className="font-bold text-sm">{editingSpot ? 'Edit Spot' : 'Add Spot'}</h5>
                          <button type="button" onClick={() => setIsAddingSpot(false)}><X size={18} /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-neutral-400">Name</label>
                            <input className="w-full p-3 border rounded-xl text-sm" value={spotForm.title || ''} onChange={e => setSpotForm({...spotForm, title: e.target.value})} required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-neutral-400">Category</label>
                            <select className="w-full p-3 border rounded-xl text-sm" value={spotForm.category} onChange={e => setSpotForm({...spotForm, category: e.target.value as LocalSpot['category']})}>
                              <option>Dining</option>
                              <option>Golf</option>
                              <option>Marina</option>
                              <option>Shopping</option>
                              <option>Church</option>
                              <option>Attraction</option>
                            </select>
                          </div>
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-bold uppercase text-neutral-400">Image URL</label>
                            <input className="w-full p-3 border rounded-xl text-sm" value={spotForm.image || ''} onChange={e => setSpotForm({...spotForm, image: e.target.value})} />
                          </div>
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-bold uppercase text-neutral-400">Description</label>
                            <textarea className="w-full p-3 border rounded-xl text-sm h-20" value={spotForm.description || ''} onChange={e => setSpotForm({...spotForm, description: e.target.value})} />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3">
                          <button type="button" onClick={() => setIsAddingSpot(false)} className="px-4 py-2 font-bold text-neutral-500 text-sm">Cancel</button>
                          <button type="submit" className="bg-luxury-gold text-white px-6 py-2 rounded-full font-bold text-sm">Save</button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-2">
                        {tempSettings.localSpots.map(spot => (
                          <div key={spot.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-100">
                            <div className="flex items-center gap-3">
                              <MapPin size={14} className="text-luxury-gold flex-shrink-0" />
                              <div>
                                <p className="font-bold text-sm text-lake">{spot.title}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{spot.category}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => startEditSpot(spot)} className="p-2 bg-neutral-50 rounded-lg text-neutral-400 hover:text-lake"><Edit2 size={14}/></button>
                              <button onClick={() => deleteSpot(spot.id)} className="p-2 bg-neutral-50 rounded-lg text-neutral-400 hover:text-red-500"><Trash2 size={14}/></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>

                 <div className="space-y-4 bg-neutral-50 p-8 rounded-3xl border border-neutral-100">
                    <h4 className="font-bold text-neutral-400 uppercase tracking-widest text-xs">Home Page Teaser</h4>
                    <input 
                      placeholder="Headline" 
                      className="w-full p-4 border rounded-xl" 
                      value={tempSettings.lifestyleHeadline} 
                      onChange={e => setTempSettings({...tempSettings, lifestyleHeadline: e.target.value})} 
                    />
                    <textarea 
                      placeholder="Subheadline" 
                      className="w-full p-4 border rounded-xl" 
                      value={tempSettings.lifestyleSubheadline} 
                      onChange={e => setTempSettings({...tempSettings, lifestyleSubheadline: e.target.value})} 
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <input 
                         placeholder="Quote" 
                         className="p-4 border rounded-xl" 
                         value={tempSettings.lifestyleQuote} 
                         onChange={e => setTempSettings({...tempSettings, lifestyleQuote: e.target.value})} 
                       />
                       <input 
                         placeholder="Quote Author" 
                         className="p-4 border rounded-xl" 
                         value={tempSettings.lifestyleQuoteAuthor} 
                         onChange={e => setTempSettings({...tempSettings, lifestyleQuoteAuthor: e.target.value})} 
                       />
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'settings' && (
           <div className="space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-3xl font-bold serif italic">General Site Settings</h3>
                 <button onClick={saveSettings} disabled={isSaving} className="bg-lake text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 disabled:opacity-50">
                    {saveSuccess ? <><CheckCircle size={18} /> Saved!</> : <><Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}</>}
                 </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-neutral-400">Company Name</label>
                    <input className="w-full p-3 border rounded-xl" value={tempSettings.companyName} onChange={e => setTempSettings({...tempSettings, companyName: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-neutral-400">Contact Phone</label>
                    <input className="w-full p-3 border rounded-xl" value={tempSettings.phone} onChange={e => setTempSettings({...tempSettings, phone: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-neutral-400">Home Hero Headline</label>
                    <input className="w-full p-3 border rounded-xl" value={tempSettings.heroHeadline} onChange={e => setTempSettings({...tempSettings, heroHeadline: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-neutral-400">Home Hero Image</label>
                    <div className="flex gap-2">
                      <input className="flex-1 p-3 border rounded-xl" value={tempSettings.heroImage} onChange={e => setTempSettings({...tempSettings, heroImage: e.target.value})} />
                      <label className="cursor-pointer px-4 py-3 bg-lake text-white rounded-xl flex items-center gap-1.5 text-sm font-bold flex-shrink-0 hover:bg-neutral-800 transition-colors">
                        {uploadingField === 'heroImage' ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                        <input type="file" accept="image/*" className="sr-only" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], 'settings', 'heroImage', url => setTempSettings(s => ({...s, heroImage: url}))); e.target.value = ''; }} />
                      </label>
                    </div>
                 </div>
                 <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase text-neutral-400">Social Media Photo</label>
                    <div className="flex gap-2">
                      <input
                         className="flex-1 p-3 border rounded-xl"
                         placeholder="https://..."
                         value={tempSettings.socialImage || ''}
                         onChange={e => setTempSettings({...tempSettings, socialImage: e.target.value})}
                      />
                      <label className="cursor-pointer px-4 py-3 bg-lake text-white rounded-xl flex items-center gap-1.5 text-sm font-bold flex-shrink-0 hover:bg-neutral-800 transition-colors">
                        {uploadingField === 'socialImage' ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                        <input type="file" accept="image/*" className="sr-only" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], 'settings', 'socialImage', url => setTempSettings(s => ({...s, socialImage: url}))); e.target.value = ''; }} />
                      </label>
                    </div>
                    <p className="text-[10px] text-neutral-400">This image appears when someone shares the website on Facebook, Instagram, or text message. Use a high-quality horizontal photo (1200×630px ideal).</p>
                    {tempSettings.socialImage && (
                      <img src={tempSettings.socialImage} className="mt-2 rounded-xl w-full max-w-sm h-36 object-cover border border-neutral-200" alt="Social preview" />
                    )}
                 </div>
                 <div className="col-span-1 md:col-span-2 space-y-4">
                    <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200">
                        <div className="flex items-center gap-2 mb-4 text-lake font-bold">
                            <Zap size={20} className="text-luxury-gold"/> 
                            <span className="uppercase tracking-widest text-xs">Integrations</span>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-neutral-400">HighLevel Private Integration Token</label>
                                <input
                                    type="password"
                                    className="w-full p-3 border rounded-xl font-mono text-sm"
                                    value={tempSettings.highlevelToken || ''}
                                    onChange={e => setTempSettings({...tempSettings, highlevelToken: e.target.value})}
                                    placeholder="eyJhbGci..."
                                />
                                <p className="text-[10px] text-neutral-400">When set, form submissions will create contacts directly in HighLevel via the API.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-neutral-400">HighLevel Location ID</label>
                                <input
                                    className="w-full p-3 border rounded-xl font-mono text-sm"
                                    value={tempSettings.highlevelLocationId || ''}
                                    onChange={e => setTempSettings({...tempSettings, highlevelLocationId: e.target.value})}
                                    placeholder="ve9EPM428h8vShlRW1KT"
                                />
                                <p className="text-[10px] text-neutral-400">Found in HighLevel under Settings → Business Info → Location ID.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-neutral-400">HighLevel Message Field Key</label>
                                <input
                                    className="w-full p-3 border rounded-xl font-mono text-sm"
                                    value={tempSettings.highlevelMessageFieldKey || ''}
                                    onChange={e => setTempSettings({...tempSettings, highlevelMessageFieldKey: e.target.value})}
                                    placeholder="contact.web_inquiry"
                                />
                                <p className="text-[10px] text-neutral-400">In HighLevel: Settings → Custom Fields → find your text field → use the Field Key shown (e.g. <span className="font-mono">contact.web_inquiry</span>). The form message will be saved to this field on the contact.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-neutral-400">Fallback Webhook URL (Zapier, Make.com, etc.)</label>
                                <input
                                    className="w-full p-3 border rounded-xl font-mono text-sm"
                                    value={tempSettings.webhookUrl}
                                    onChange={e => setTempSettings({...tempSettings, webhookUrl: e.target.value})}
                                    placeholder="https://hooks.zapier.com/v1/event/..."
                                />
                                <p className="text-[10px] text-neutral-400">Used only if HighLevel token is not set.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-neutral-400">Header Scripts (Analytics, Pixel, etc.)</label>
                                <textarea 
                                    className="w-full p-3 border rounded-xl h-32 font-mono text-xs text-neutral-600" 
                                    value={tempSettings.externalScripts} 
                                    onChange={e => setTempSettings({...tempSettings, externalScripts: e.target.value})}
                                    placeholder="<!-- Paste your Google Analytics or Facebook Pixel code here -->"
                                />
                            </div>
                        </div>
                    </div>
                 </div>
                 
              </div>
           </div>
        )}
      </div>
    </div>
  );
};