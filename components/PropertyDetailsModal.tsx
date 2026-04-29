import React, { useState } from 'react';
import { Property } from '../types';
import { X, Bed, Bath, Move, ChevronLeft, ChevronRight, MessageSquare, ExternalLink } from 'lucide-react';

interface PropertyDetailsModalProps {
  property: Property;
  onClose: () => void;
  onInquire?: () => void;
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({ property, onClose, onInquire }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = [property.image, ...(property.gallery || [])].filter(Boolean) as string[];

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm animate-modal-backdrop">
      <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-modal-content">
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]">
          <X size={24} />
        </button>
        <div className="w-full md:w-3/5 bg-neutral-900 flex flex-col overflow-hidden">
          <div className="relative flex-1 overflow-hidden">
            <img src={images[activeImageIndex]} className="w-full h-full object-cover" alt={property.title} />
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 rounded-full text-white hover:bg-black/50 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 rounded-full text-white hover:bg-black/50 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]">
                  <ChevronRight size={24} />
                </button>
                <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {activeImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide bg-neutral-900/80">
              {images.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${idx === activeImageIndex ? 'border-luxury-gold opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
                >
                  <img src={url} className="w-full h-full object-cover" alt={`Photo ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-4xl font-bold serif">{property.title}</h2>
          </div>
          <p className="text-3xl font-bold text-luxury-gold mb-8">{formatter.format(property.price)}</p>
          
          <div className="grid grid-cols-3 gap-6 py-8 border-y border-neutral-100 mb-8">
            <div className="text-center">
              <Bed size={24} className="mx-auto mb-2 text-neutral-400"/> 
              <span className="font-bold">{property.beds}</span>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">Beds</p>
            </div>
            <div className="text-center">
              <Bath size={24} className="mx-auto mb-2 text-neutral-400"/> 
              <span className="font-bold">{property.baths}</span>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">Baths</p>
            </div>
            <div className="text-center">
              <Move size={24} className="mx-auto mb-2 text-neutral-400"/> 
              <span className="font-bold">{property.sqft.toLocaleString()}</span>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">SqFt</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Description</h4>
              <p className="text-neutral-500 leading-relaxed text-lg font-light">{property.description}</p>
            </div>
            
            {property.listingUrl && (
              <a
                href={property.listingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-5 bg-luxury-gold text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg hover:bg-amber-600 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex items-center justify-center gap-3 mt-8"
              >
                See the Listing <ExternalLink size={16} />
              </a>
            )}
            <button
              onClick={onInquire}
              className="w-full py-5 bg-lake text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg hover:bg-neutral-800 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex items-center justify-center gap-3 mt-4"
            >
              Inquire About This Property <MessageSquare size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};