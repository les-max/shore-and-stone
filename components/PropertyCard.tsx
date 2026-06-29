import React from 'react';
import { Property } from '../types';
import { Bed, Bath, Move, LandPlot, Waves } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onViewDetails?: (property: Property) => void;
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const Stat: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-1.5 text-neutral-600">
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onViewDetails }) => {
  const type = property.propertyType || 'Home';
  const hasPrice = type !== 'Floor Plan' && property.price > 0;

  // Per-category stat rows. Floor plans and homes share bed/bath/sqft; lots show land details.
  const stats: React.ReactNode[] = [];
  if (type === 'Lot') {
    if (property.acres && property.acres > 0) {
      stats.push(<Stat key="acres" icon={<LandPlot size={18} />} label={`${property.acres} Acres`} />);
    }
    if (property.waterfront) {
      stats.push(<Stat key="waterfront" icon={<Waves size={18} />} label="Waterfront" />);
    }
  } else {
    if (property.beds > 0) stats.push(<Stat key="beds" icon={<Bed size={18} />} label={`${property.beds} Beds`} />);
    if (property.baths > 0) stats.push(<Stat key="baths" icon={<Bath size={18} />} label={`${property.baths} Baths`} />);
    if (property.sqft > 0) stats.push(<Stat key="sqft" icon={<Move size={18} />} label={`${property.sqft.toLocaleString()} SqFt`} />);
  }

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
        {hasPrice && (
          <p className="text-luxury-gold text-2xl font-bold mb-4">{formatter.format(property.price)}</p>
        )}

        {stats.length > 0 && (
          <div className="flex justify-between items-center py-4 border-t border-neutral-100 mb-4">
            {stats}
          </div>
        )}

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
