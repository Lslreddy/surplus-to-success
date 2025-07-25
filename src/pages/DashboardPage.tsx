
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import DonationCard from '@/components/donations/DonationCard';
import { donationPredictions, topDonors, topVolunteers } from '@/lib/mockData';
import { ArrowRight } from 'lucide-react';

interface ClaimedDonation {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  status: string;
  created_at: string;
  food_categories: {
    name: string;
  };
  profiles?: {
    full_name: string;
  } | null;
}

const DashboardPage = () => {
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [claimedDonations, setClaimedDonations] = useState<ClaimedDonation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch claimed donations for NGOs
    const fetchClaimedDonations = async () => {
      if (profile?.user_role !== 'ngo') {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('donation_claims')
          .select(`
            donations (
              id,
              title,
              description,
              quantity,
              unit,
              status,
              created_at,
              food_categories (
                name
              ),
              profiles (
                full_name
              )
            )
          `)
          .eq('claimer_id', user?.id);

        if (error) {
          console.error('Error fetching claimed donations:', error);
          return;
        }

        const donations = data
          ?.map(claim => claim.donations)
          .filter(donation => donation !== null) || [];

        setClaimedDonations(donations);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaimedDonations();
  }, [user, profile, isAuthenticated, navigate]);

  const recentDonations = []; // This would be fetched from the database in a real app

  const handleClaimDonation = (donationId: string) => {
    // This would be implemented to claim a donation in a real app
  };

  const handleVolunteerForDelivery = (donationId: string) => {
    // This would be implemented to volunteer for delivery in a real app
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name}! {profile?.user_role === 'donor' ? 'Share your surplus food.' : profile?.user_role === 'ngo' ? 'Find available donations.' : 'Help deliver food to those in need.'}
            </p>
          </div>
          {profile?.user_role === 'donor' && (
            <Button onClick={() => navigate('/donate')}>
              Donate Food
            </Button>
          )}
          {profile?.user_role === 'ngo' && (
            <Button onClick={() => navigate('/request')}>
              Browse Donations
            </Button>
          )}
          {profile?.user_role === 'volunteer' && (
            <Button onClick={() => navigate('/volunteer')}>
              Find Deliveries
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="md:col-span-2 space-y-6">
            {/* Role-specific content */}
            {profile?.user_role === 'donor' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>AI Donation Insights</CardTitle>
                    <CardDescription>Optimize your donations with AI-powered predictions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Best Times to Donate</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {donationPredictions.bestTimes.map((time, i) => (
                            <div key={i} className="bg-muted p-3 rounded-lg">
                              <div className="text-sm font-medium">{time.day}</div>
                              <div className="text-xl font-bold">{time.time}</div>
                              <div className="text-xs text-muted-foreground">{Math.round(time.confidence * 100)}% match rate</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Most Needed Categories</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {donationPredictions.mostNeededCategories.map((category, i) => (
                            <div key={i} className="bg-muted p-3 rounded-lg">
                              <div className="text-sm font-medium">{category.category}</div>
                              <div className="relative h-2 bg-muted-foreground/20 rounded-full mt-2">
                                <div 
                                  className="absolute top-0 left-0 h-full bg-primary rounded-full" 
                                  style={{ width: `${category.demand * 100}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-right mt-1 text-muted-foreground">
                                {Math.round(category.demand * 100)}% demand
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Your Donations</CardTitle>
                    <CardDescription>Track the status of your food donations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">You haven't made any donations yet.</p>
                      <Button onClick={() => navigate('/donate')}>
                        Make your first donation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {profile?.user_role === 'ngo' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Available Donations</CardTitle>
                    <CardDescription>Fresh food donations waiting to be claimed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {recentDonations.map(donation => (
                        <DonationCard 
                          key={donation.id}
                          donation={donation}
                          onClaimDonation={handleClaimDonation}
                        />
                      ))}
                    </div>
                    
                    <div className="mt-4 text-center">
                      <Button variant="outline" onClick={() => navigate('/request')}>
                        View all available donations
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
              <Card>
                  <CardHeader>
                    <CardTitle>Your Claimed Donations</CardTitle>
                    <CardDescription>Track donations you've claimed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading...</p>
                      </div>
                    ) : claimedDonations.length > 0 ? (
                      <div className="space-y-4">
                        {claimedDonations.slice(0, 3).map(donation => (
                          <div key={donation.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">{donation.title}</h4>
                              <span className="text-sm text-muted-foreground capitalize">{donation.status}</span>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>Category: {donation.food_categories.name}</p>
                              <p>Quantity: {donation.quantity} {donation.unit}</p>
                              <p>From: {donation.profiles?.full_name || 'Anonymous Donor'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">You haven't claimed any donations yet.</p>
                        <Button onClick={() => navigate('/request')}>
                          Browse available donations
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {profile?.user_role === 'volunteer' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Opportunities</CardTitle>
                    <CardDescription>Donations that need delivery volunteers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No delivery opportunities available at the moment.</p>
                      <Button variant="outline" onClick={() => navigate('/volunteer')}>
                        View all delivery opportunities
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Your Deliveries</CardTitle>
                    <CardDescription>Track your volunteer deliveries</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">You haven't signed up for any deliveries yet.</p>
                      <Button onClick={() => navigate('/volunteer')}>
                        Find delivery opportunities
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          
          {/* Right column - Common for all roles */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Stats</CardTitle>
                <CardDescription>Community impact overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-primary">3.2K</div>
                      <div className="text-sm text-muted-foreground">Meals Shared</div>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-primary">8.6T</div>
                      <div className="text-sm text-muted-foreground">Food Saved</div>
                    </div>
                  </div>
                  
                  <div className="bg-primary/10 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Your Impact</div>
                        <div className="text-xl font-bold">12 meals shared</div>
                      </div>
                      <div className="text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>Top contributors in our community</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <Tabs defaultValue="donors">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="donors">Top Donors</TabsTrigger>
                    <TabsTrigger value="volunteers">Top Volunteers</TabsTrigger>
                  </TabsList>
                  <TabsContent value="donors" className="pt-4">
                    <div className="space-y-1">
                      {topDonors.map((donor, index) => (
                        <div key={donor.id} className="flex items-center justify-between px-6 py-2 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{donor.name}</div>
                              <div className="text-xs text-muted-foreground">{donor.impact}</div>
                            </div>
                          </div>
                          <div className="text-sm font-semibold">{donor.donationCount}</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="volunteers" className="pt-4">
                    <div className="space-y-1">
                      {topVolunteers.map((volunteer, index) => (
                        <div key={volunteer.id} className="flex items-center justify-between px-6 py-2 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="bg-secondary/10 text-secondary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{volunteer.name}</div>
                              <div className="text-xs text-muted-foreground">{volunteer.distance}</div>
                            </div>
                          </div>
                          <div className="text-sm font-semibold">{volunteer.deliveryCount}</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start px-6" onClick={() => navigate('/donate')}>
                    <div className="flex items-center justify-between w-full">
                      <span>Donate Food</span>
                      <ArrowRight size={16} />
                    </div>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start px-6" onClick={() => navigate('/request')}>
                    <div className="flex items-center justify-between w-full">
                      <span>Request Food</span>
                      <ArrowRight size={16} />
                    </div>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start px-6" onClick={() => navigate('/volunteer')}>
                    <div className="flex items-center justify-between w-full">
                      <span>Volunteer</span>
                      <ArrowRight size={16} />
                    </div>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start px-6" onClick={() => navigate('/profile')}>
                    <div className="flex items-center justify-between w-full">
                      <span>Your Profile</span>
                      <ArrowRight size={16} />
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
