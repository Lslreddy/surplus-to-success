
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Package, User } from 'lucide-react';

interface Donation {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  freshness: 'hot' | 'warm' | 'cold';
  expiry_time: string;
  pickup_address: string;
  pickup_instructions?: string;
  photo_url?: string;
  status: string;
  created_at: string;
  food_categories: {
    name: string;
  };
  profiles?: {
    full_name: string;
  } | null;
}

const RequestPage = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  // Redirect if not authenticated or not NGO
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (profile && profile.user_role !== 'ngo') {
      toast.error('Only NGOs can access this page');
      navigate('/dashboard');
    }
  }, [isAuthenticated, profile, navigate]);

  // Fetch available donations
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const { data, error } = await supabase
          .from('donations')
          .select(`
            *,
            food_categories (
              name
            ),
            profiles (
              full_name
            )
          `)
          .eq('status', 'available')
          .gt('expiry_time', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching donations:', error);
          toast.error('Failed to load donations');
          return;
        }

        // Type cast the data to ensure freshness is properly typed
        const typedData = data?.map(donation => ({
          ...donation,
          freshness: donation.freshness as 'hot' | 'warm' | 'cold'
        })) || [];

        setDonations(typedData);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load donations');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && profile?.user_role === 'ngo') {
      fetchDonations();
    }
  }, [isAuthenticated, profile]);

  const handleClaim = async (donationId: string) => {
    if (!user) return;

    setClaiming(donationId);
    
    try {
      // Check if already claimed
      const { data: existingClaim } = await supabase
        .from('donation_claims')
        .select('id')
        .eq('donation_id', donationId)
        .eq('claimer_id', user.id)
        .single();

      if (existingClaim) {
        toast.error('You have already claimed this donation');
        return;
      }

      // Create claim
      const { error: claimError } = await supabase
        .from('donation_claims')
        .insert([
          {
            donation_id: donationId,
            claimer_id: user.id,
            status: 'pending'
          }
        ]);

      if (claimError) {
        console.error('Claim error:', claimError);
        toast.error('Failed to claim donation');
        return;
      }

      // Update donation status
      const { error: updateError } = await supabase
        .from('donations')
        .update({ status: 'claimed', updated_at: new Date().toISOString() })
        .eq('id', donationId);

      if (updateError) {
        console.error('Update error:', updateError);
        toast.error('Failed to update donation status');
        return;
      }

      toast.success('Donation claimed successfully!');
      
      // Remove claimed donation from list
      setDonations(prev => prev.filter(d => d.id !== donationId));
      
    } catch (error) {
      console.error('Error claiming donation:', error);
      toast.error('Failed to claim donation');
    } finally {
      setClaiming(null);
    }
  };

  const getFreshnessColor = (freshness: string) => {
    switch (freshness) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-orange-100 text-orange-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeRemaining = (expiryTime: string) => {
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diffHours = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60));
      return `${diffMinutes} minutes`;
    }
    if (diffHours < 24) {
      return `${diffHours} hours`;
    }
    return `${Math.floor(diffHours / 24)} days`;
  };

  if (!isAuthenticated || !profile) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">Loading available food...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Request Food</h1>
            <p className="text-muted-foreground mt-2">
              Browse and claim available food donations from generous donors in your community.
            </p>
          </div>

          {donations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No donations available</h3>
                <p className="text-muted-foreground">
                  There are currently no food donations available. Check back later!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.map((donation) => (
                <Card key={donation.id} className="overflow-hidden">
                  {donation.photo_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={donation.photo_url}
                        alt={donation.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{donation.title}</CardTitle>
                      <Badge className={getFreshnessColor(donation.freshness)}>
                        {donation.freshness}
                      </Badge>
                    </div>
                    <CardDescription>{donation.food_categories.name}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4" />
                      <span>{donation.quantity} {donation.unit}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" />
                      <span>By {donation.profiles?.full_name || 'Anonymous Donor'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{donation.pickup_address}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <Clock className="h-4 w-4" />
                      <span>Expires in {formatTimeRemaining(donation.expiry_time)}</span>
                    </div>
                    
                    {donation.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {donation.description}
                      </p>
                    )}
                    
                    {donation.pickup_instructions && (
                      <div className="bg-muted p-2 rounded text-sm">
                        <strong>Pickup Instructions:</strong> {donation.pickup_instructions}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={() => handleClaim(donation.id)}
                      disabled={claiming === donation.id}
                    >
                      {claiming === donation.id ? 'Claiming...' : 'Claim Food'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default RequestPage;
