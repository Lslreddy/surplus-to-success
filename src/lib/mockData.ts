
import { formatDistanceToNow } from 'date-fns';

// Food categories
export const foodCategories = [
  'Prepared Meals', 
  'Vegetables', 
  'Fruits', 
  'Bread & Pastries', 
  'Dairy',
  'Meat & Poultry',
  'Canned Goods',
  'Dry Goods',
  'Beverages'
];

// Food freshness levels
export type FreshnessType = 'hot' | 'warm' | 'cold';
export const freshnessLevels = ['hot', 'warm', 'cold'];

// Mock food donations
export interface FoodDonation {
  id: string;
  name: string;
  donorId: string;
  donorName: string;
  quantity: string;
  timeCooked?: Date;
  expiryTime: Date;
  freshness: FreshnessType;
  description?: string;
  category: string;
  imageUrl?: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    }
  };
  status: 'available' | 'claimed' | 'in-transit' | 'delivered';
  claimedBy?: {
    id: string;
    name: string;
    type: 'ngo' | 'individual';
  };
  volunteerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const mockDonations: FoodDonation[] = [
  {
    id: '1',
    name: 'Vegetable Curry',
    donorId: 'donor1',
    donorName: 'Green Leaf Restaurant',
    quantity: '5 kg (serves 10)',
    timeCooked: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 5), // 5 hours from now
    freshness: 'warm',
    description: 'Nutritious vegetable curry with rice. Contains onions, tomatoes, and various spices.',
    category: 'Prepared Meals',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    location: {
      address: '123 Main St, Anytown, USA',
      coordinates: {
        lat: 40.7128,
        lng: -74.0060
      }
    },
    status: 'available',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3)
  },
  {
    id: '2',
    name: 'Fresh Bread Assortment',
    donorId: 'donor2',
    donorName: 'Daily Bakery',
    quantity: '20 loaves',
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
    freshness: 'cold',
    description: 'Variety of fresh baked bread including white, whole wheat, and multigrain.',
    category: 'Bread & Pastries',
    imageUrl: 'https://images.unsplash.com/photo-1608198093002-ad4e365c0e35?auto=format&fit=crop&w=800&q=80',
    location: {
      address: '456 Baker St, Anytown, USA',
      coordinates: {
        lat: 40.7228,
        lng: -74.0160
      }
    },
    status: 'available',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12)
  },
  {
    id: '3',
    name: 'Fresh Fruit Platter',
    donorId: 'donor3',
    donorName: 'Organic Market',
    quantity: '8 kg (5 platters)',
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 48), // 48 hours from now
    freshness: 'cold',
    description: 'Fresh seasonal fruits including apples, oranges, grapes, and berries.',
    category: 'Fruits',
    imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
    location: {
      address: '789 Market St, Anytown, USA',
      coordinates: {
        lat: 40.7328,
        lng: -74.0260
      }
    },
    status: 'claimed',
    claimedBy: {
      id: 'ngo1',
      name: 'Helping Hands Shelter',
      type: 'ngo'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20) // 20 hours ago
  },
  {
    id: '4',
    name: 'Pasta with Tomato Sauce',
    donorId: 'donor4',
    donorName: 'Italian Delight',
    quantity: '10 kg (serves 20)',
    timeCooked: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 6), // 6 hours from now
    freshness: 'hot',
    description: 'Pasta with rich tomato sauce and herbs. Vegetarian friendly.',
    category: 'Prepared Meals',
    imageUrl: 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?auto=format&fit=crop&w=800&q=80',
    location: {
      address: '101 Pasta Ln, Anytown, USA',
      coordinates: {
        lat: 40.7428,
        lng: -74.0360
      }
    },
    status: 'in-transit',
    claimedBy: {
      id: 'ngo2',
      name: 'Community Food Bank',
      type: 'ngo'
    },
    volunteerId: 'volunteer1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: '5',
    name: 'Vegetable Soup',
    donorId: 'donor1',
    donorName: 'Green Leaf Restaurant',
    quantity: '15 liters',
    timeCooked: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 10), // 10 hours from now
    freshness: 'hot',
    description: 'Nutritious vegetable soup with carrots, potatoes, celery, and herbs.',
    category: 'Prepared Meals',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    location: {
      address: '123 Main St, Anytown, USA',
      coordinates: {
        lat: 40.7128,
        lng: -74.0060
      }
    },
    status: 'delivered',
    claimedBy: {
      id: 'ngo3',
      name: 'Homeless Outreach Center',
      type: 'ngo'
    },
    volunteerId: 'volunteer2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
  },
  {
    id: '6',
    name: 'Fresh Milk',
    donorId: 'donor5',
    donorName: 'Local Dairy Farm',
    quantity: '20 liters',
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 72), // 72 hours from now
    freshness: 'cold',
    description: 'Fresh pasteurized whole milk in 1-liter containers.',
    category: 'Dairy',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    location: {
      address: '400 Farm Rd, Anytown, USA',
      coordinates: {
        lat: 40.7528,
        lng: -74.0460
      }
    },
    status: 'available',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8)
  },
  {
    id: '7',
    name: 'Canned Vegetables Assortment',
    donorId: 'donor6',
    donorName: 'Super Grocery',
    quantity: '50 cans',
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year from now
    freshness: 'cold',
    description: 'Assortment of canned vegetables including corn, peas, green beans, and carrots.',
    category: 'Canned Goods',
    imageUrl: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=800&q=80',
    location: {
      address: '500 Grocery Ave, Anytown, USA',
      coordinates: {
        lat: 40.7628,
        lng: -74.0560
      }
    },
    status: 'available',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 48 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48)
  }
];

// Format relative time from now
export const formatTimeAgo = (date: Date) => {
  return formatDistanceToNow(date, { addSuffix: true });
};

// Function to calculate time until expiry
export const timeUntilExpiry = (expiryTime: Date) => {
  return formatDistanceToNow(expiryTime);
};

// Function to get badge color based on freshness
export const getFreshnessBadgeColor = (freshness: FreshnessType) => {
  switch (freshness) {
    case 'hot':
      return 'freshness-hot';
    case 'warm':
      return 'freshness-warm';
    case 'cold':
      return 'freshness-cold';
    default:
      return 'bg-gray-200';
  }
};

// Function to get status badge color
export const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'claimed':
      return 'bg-blue-100 text-blue-800';
    case 'in-transit':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Donation prediction data
export const donationPredictions = {
  bestTimes: [
    { day: 'Monday', time: '18:00', confidence: 0.87 },
    { day: 'Wednesday', time: '19:30', confidence: 0.82 },
    { day: 'Saturday', time: '14:00', confidence: 0.78 }
  ],
  mostNeededCategories: [
    { category: 'Prepared Meals', demand: 0.92 },
    { category: 'Vegetables', demand: 0.85 },
    { category: 'Bread & Pastries', demand: 0.73 }
  ]
};

// Top donors
export const topDonors = [
  { id: 'donor1', name: 'Green Leaf Restaurant', donationCount: 52, impact: '104kg of food' },
  { id: 'donor2', name: 'Daily Bakery', donationCount: 48, impact: '96kg of food' },
  { id: 'donor3', name: 'Organic Market', donationCount: 36, impact: '72kg of food' },
  { id: 'donor4', name: 'Italian Delight', donationCount: 33, impact: '66kg of food' },
  { id: 'donor5', name: 'Local Dairy Farm', donationCount: 29, impact: '58kg of food' }
];

// Top volunteers
export const topVolunteers = [
  { id: 'volunteer1', name: 'John Smith', deliveryCount: 45, distance: '225km' },
  { id: 'volunteer2', name: 'Maria Garcia', deliveryCount: 41, distance: '205km' },
  { id: 'volunteer3', name: 'David Lee', deliveryCount: 38, distance: '190km' },
  { id: 'volunteer4', name: 'Sarah Johnson', deliveryCount: 32, distance: '160km' },
  { id: 'volunteer5', name: 'Michael Brown', deliveryCount: 28, distance: '140km' }
];
