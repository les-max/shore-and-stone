
export type PropertyStatus = 'Available' | 'Sold' | 'Under Construction';

export interface Property {
  id: string;
  title: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  image: string;
  gallery: string[];
  status: PropertyStatus;
  neighborhood: string;
  features: string[];
  address?: string;
  isFeatured?: boolean;
  created_at?: string;
}

export interface Activity {
  id: string;
  icon: string; // Name of Lucide icon
  title: string;
  description: string;
  highlights: string[];
}

export interface LocalSpot {
  id: string;
  category: 'Dining' | 'Shopping' | 'Attraction' | 'Golf' | 'Marina' | 'Church';
  title: string;
  description: string;
  image: string;
  isFeatured: boolean;
}

export interface SiteSettings {
  // Brand
  logoImage: string;
  companyName: string;
  // Hero (Home)
  heroImage: string;
  heroHeadline: string;
  heroSubheadline: string;
  // Lifestyle Hero
  lifestyleHeroImage: string;
  lifestyleHeroHeadline: string;
  lifestyleHeroSubheadline: string;
  // Lifestyle Landing Section (Teaser on Home)
  lifestyleHeadline: string;
  lifestyleSubheadline: string;
  lifestyleImage: string;
  lifestyleQuote: string;
  lifestyleQuoteAuthor: string;
  // Lists
  activities: Activity[];
  localSpots: LocalSpot[];
  // Metadata & Contact
  neighborhoods: string[];
  phone: string;
  email: string;
  address: string;
  // Integrations
  externalScripts: string;
  webhookUrl: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}