import React from 'react';
import { Property } from '../types';
import { Bed, Bath, Move } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onViewDetails?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onViewDetails }) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl ease-strong-out transition-[transform,box-shadow] duration-300 hover:-translate-y-2">
      <div className="relative h-72 overflow-hidden">
        <img 
          src={property.image} 
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            property.status === 'Available' ? 'bg-green-100 text-green-800' :
            property.status === 'Sold' ? 'bg-red-100 text-red-800' :
            'bg-amber-100 text-amber-800'
          }`}>
            {property.status}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-2xl font-semibold mb-3">{property.title}</h3>
        <p className="text-luxury-gold text-2xl font-bold mb-4">{formatter.format(property.price)}</p>
        
        <div className="flex justify-between items-center py-4 border-t border-neutral-100 mb-4">
          <div className="flex items-center gap-1.5 text-neutral-600">
            <Bed size={18} />
            <span className="text-sm font-medium">{property.beds} Beds</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-600">
            <Bath size={18} />
            <span className="text-sm font-medium">{property.baths} Baths</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-600">
            <Move size={18} />
            <span className="text-sm font-medium">{property.sqft.toLocaleString()} SqFt</span>
          </div>
        </div>
        
        <button 
          onClick={() => onViewDetails?.(property)}
          className="w-full py-3 bg-lake text-white rounded-lg font-semibold hover:bg-neutral-800 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]"
        >
          View Details
        </button>
      </div>
    </div>
  );
};