
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FoodCategory {
  id: string;
  name: string;
  description: string;
}

interface Donation {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  freshness: 'hot' | 'warm' | 'cold';
  expiry_time: string;
  pickup_address: string;
  pickup_instructions: string;
  photo_url: string | null;
  status: string;
  created_at: string;
  food_categories: {
    name: string;
  };
  profiles: {
    full_name: string;
    city: string;
  };
}

const RequestPage = () => {
  const { profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFreshness, setSelectedFreshness] = useState<string>('');

  useEffect(() => {
    fetchCategories();
    fetchDonations();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('food_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          food_categories (name),
          profiles (full_name, city)
        `)
        .eq('status', 'available')
        .gt('expiry_time', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Failed to load available donations');
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter(donation => {
    // Apply search filter
    if (searchQuery && !donation.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !donation.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Apply category filter
    if (selectedCategory && donation.food_categories.name !== selectedCategory) {
      return false;
    }
    
    // Apply freshness filter
    if (selectedFreshness && donation.freshness !== selectedFreshness) {
      return false;
    }
    
    return true;
  });

  const handleClaimDonation = async (donationId: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to claim donations');
      navigate('/login');
      return;
    }
    
    if (profile?.user_role !== 'ngo') {
      toast.error('Only NGOs and registered receivers can claim donations');
      return;
    }

    try {
      // Check if already claimed
      const { data: existingClaim } = await supabase
        .from('donation_claims')
        .select('id')
        .eq('donation_id', donationId)
        .eq('claimer_id', profile.id)
        .single();

      if (existingClaim) {
        toast.error('You have already claimed this donation');
        return;
      }

      // Create claim
      const { error } = await supabase
        .from('donation_claims')
        .insert({
          donation_id: donationId,
          claimer_id: profile.id,
          status: 'pending'
        });

      if (error) throw error;

      // Update donation status
      await supabase
        .from('donations')
        .update({ status: 'claimed' })
        .eq('id', donationId);

      toast.success('Donation claimed successfully!');
      fetchDonations(); // Refresh the list
    } catch (error) {
      console.error('Error claiming donation:', error);
      toast.error('Failed to claim donation. Please try again.');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const formatExpiryTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Expires soon';
    if (diffInHours < 24) return `Expires in ${diffInHours}h`;
    return `Expires in ${Math.floor(diffInHours / 24)}d`;
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Available Food</h1>
          <p className="text-muted-foreground mt-2">
            Browse and request available food donations in your area.
          </p>
        </div>
        
        {/* Filters section */}
        <div className="bg-card border rounded-lg p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search donations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedFreshness} onValueChange={setSelectedFreshness}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by freshness" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Freshness Levels</SelectItem>
                <SelectItem value="hot">Hot (Just cooked)</SelectItem>
                <SelectItem value="warm">Warm (Few hours old)</SelectItem>
                <SelectItem value="cold">Cold (Refrigerated/Packaged)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Results section */}
        <div>
          {loading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Loading available donations...</p>
            </div>
          ) : filteredDonations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDonations.map(donation => (
                <Card key={donation.id} className="overflow-hidden">
                  {donation.photo_url && (
                    <div className="aspect-video bg-muted">
                      <img 
                        src={donation.photo_url} 
                        alt={donation.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{donation.title}</CardTitle>
                      <Badge variant="secondary" className="ml-2">
                        {donation.food_categories.name}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        {donation.profiles.full_name}
                      </div>
                      {donation.profiles.city && (
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {donation.profiles.city}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {donation.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {donation.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Quantity:</span>
                        <span className="font-medium">{donation.quantity} {donation.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Freshness:</span>
                        <Badge variant="outline" className="capitalize">
                          {donation.freshness}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Pickup:</span>
                        <span className="font-medium truncate ml-2">{donation.pickup_address}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTimeAgo(donation.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatExpiryTime(donation.expiry_time)}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={() => handleClaimDonation(donation.id)}
                      disabled={!isAuthenticated || profile?.user_role !== 'ngo'}
                    >
                      {!isAuthenticated ? 'Login to Claim' : 
                       profile?.user_role !== 'ngo' ? 'NGOs Only' : 'Claim Donation'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/40 rounded-lg">
              <h3 className="text-xl font-medium mb-2">No donations found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedCategory || selectedFreshness 
                  ? 'Try adjusting your filters to see more results.'
                  : 'There are currently no available donations. Check back later!'}
              </p>
              
              {(searchQuery || selectedCategory || selectedFreshness) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    setSelectedFreshness('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Need help section */}
        <div className="mt-12 bg-primary/10 rounded-lg p-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3">Need Help with Food?</h2>
            <p className="text-lg mb-6">
              If you or your organization needs food assistance, register as a receiver to claim available donations.
            </p>
            {isAuthenticated ? (
              profile?.user_role === 'ngo' ? (
                <p className="text-sm text-muted-foreground">
                  You're registered as a food receiver. You can claim donations above.
                </p>
              ) : (
                <Button onClick={() => navigate('/profile')}>
                  Update Profile to Receiver
                </Button>
              )
            ) : (
              <Button onClick={() => navigate('/register')}>
                Register as Receiver
              </Button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RequestPage;
