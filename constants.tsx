import { Property, SiteSettings } from './types';

export const DEFAULT_SETTINGS: SiteSettings = {
  "logoImage": "https://lesbrownimages.carrd.co/assets/images/image03.png?v=285ff39d$0",
  "heroImage": "https://photos.zillowstatic.com/fp/478eb995b712eb79af80c59ea8f527ba-cc_ft_768.webp",
  "heroHeadline": "Crafting Legacies on the Waterfront.",
  "heroSubheadline": "Bespoke architectural masterpieces designed for those who demand the pinnacle of Cedar Creek Lake living.",
  "companyName": "Cedar Lux Properties",
  "lifestyleHeroImage": "https://images.unsplash.com/photo-1526495124232-a02e18491103?auto=format&fit=crop&q=80&w=2070",
  "lifestyleHeroHeadline": "Texas' Premier Waterfront Sanctuary",
  "lifestyleHeroSubheadline": "The perfect balance of adrenaline-fueled adventure and serene lakeside tranquility, just 60 minutes from Dallas.",
  "lifestyleHeadline": "Elevate Your Lakeside Living.",
  "lifestyleSubheadline": "Unrivaled access, proximity to Dallas, and turn-key luxury for the discerning homeowner looking for a legacy retreat.",
  "lifestyleImage": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=2070",
  "lifestyleQuote": "It's more than a home; it's a legacy of summer memories for our children and grandchildren.",
  "lifestyleQuoteAuthor": "The Thompson Family, Dallas TX",
  "activities": [
    {
      "id": "1",
      "icon": "Waves",
      "title": "Water Sports",
      "description": "Experience crystal clear deep water perfect for wakeboarding, surfing, and private sailing excursions.",
      "highlights": [
        "Private Boat Slips",
        "Deep Water Access",
        "Sunset Cruising"
      ]
    },
    {
      "id": "2",
      "icon": "Flag",
      "title": "Championship Golf",
      "description": "The Pinnacle Club and Long Cove offer world-class fairways and greens with breathtaking lake views.",
      "highlights": [
        "Pro-Shop Access",
        "Member Tournaments",
        "Private Lessons"
      ]
    },
    {
      "id": "3",
      "icon": "Anchor",
      "title": "Private Yachting",
      "description": "Custom-engineered docks designed for high-performance craft and elite social entertainment.",
      "highlights": [
        "Double-Decker Docks",
        "Hydro-Lifts",
        "Outdoor Kitchens"
      ]
    }
  ],
  "localSpots": [
    {
      "id": "1",
      "category": "Dining",
      "title": "Vetoni's Italian",
      "description": "Refined Italian cuisine in a white-tablecloth setting, widely considered the lake's premier dining destination.",
      "image": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=2070",
      "isFeatured": true
    },
    {
      "id": "2",
      "category": "Dining",
      "title": "The Pinnacle Club",
      "description": "Exclusive member-only dining with panoramic sunset views and a seasonal, Texas-inspired menu.",
      "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2070",
      "isFeatured": true
    },
    {
      "id": "3",
      "category": "Shopping",
      "title": "Main Street Mabank",
      "description": "High-end boutiques, antique galleries, and artisan shops curated for luxury lake house decor.",
      "image": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2070",
      "isFeatured": false
    }
  ],
  "neighborhoods": [
    "Long Cove",
    "Enchanted Isle",
    "Pinnacle Club",
    "Star Harbor",
    "Beacon Hill"
  ],
  "phone": "972-764-8687",
  "email": "info@cedarluxproperties.com",
  "address": "Mabank, TX 75147",
  "externalScripts": "",
  "webhookUrl": ""
};

export const INITIAL_PROPERTIES: Property[] = [
  {
    "title": "217 Autumn Wood Trail",
    "price": 1600000,
    "beds": 5,
    "baths": 4,
    "sqft": 3647,
    "description": "Welcome to elevated lake living on Cedar Creek Lake. This newly built modern farmhouse sits on an 8-foot-deep canal just moments from open water, offering effortless boating access and excellent short-term rental potential.\nA dramatic pivot door opens to a soaring 24-foot ceiling, a wall of windows, and sliding glass doors that blur the line between indoors and out. The open-concept living space is anchored by a refined fireplace and filled with natural light and lake breezes.\nThe main-level primary suite features a spa-inspired bath and private access to a covered terrace with water views. The chef’s kitchen pairs beauty and performance with quartz countertops, JennAir appliances, a gas range, farmhouse sink, built-in microwave, and a butler’s pantry with wine refrigerator—perfect for seamless entertaining.\nWith five bedrooms, three full baths, and a powder room, the home comfortably accommodates 20+ guests—ideal as a primary residence, luxury retreat, or high-performing vacation rental.\nOutdoors, professionally landscaped grounds lead to a private boat dock with boat and jet ski slips plus an elevated deck for panoramic sunset views. An oversized two-car garage, mudroom, laundry room with sink, and included LG front-load washer and dryer add everyday convenience.\nJust minutes from dining, grocery, fuel, and entertainment, this property delivers the best of lake life—watersports, sunset cruises, and peaceful mornings on the patio—all wrapped in timeless farmhouse style and modern luxury.",
    "image": "https://photos.zillowstatic.com/fp/478eb995b712eb79af80c59ea8f527ba-uncropped_scaled_within_1536_1152.webp",
    "gallery": [],
    "status": "Available",
    "neighborhood": "Long Cove",
    "features": [],
    "address": "217 Autumn Wood Trail, Mabank, TX 75147",
    "isFeatured": false,
    "id": "l7obcxluo"
  }
];