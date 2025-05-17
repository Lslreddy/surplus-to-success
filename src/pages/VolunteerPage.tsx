
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import DonationCard from '@/components/donations/DonationCard';
import { mockDonations, FoodDonation } from '@/lib/mockData';
import { ArrowRight, MapPin } from 'lucide-react';

const VolunteerPage = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  
  const [claimedDonations, setClaimedDonations] = useState<FoodDonation[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<FoodDonation[]>([]);
  const [completedDeliveries, setCompletedDeliveries] = useState<FoodDonation[]>([]);
  
  useEffect(() => {
    // Filter donations for volunteering
    const claimed = mockDonations.filter(d => d.status === 'claimed' && !d.volunteerId);
    const active = mockDonations.filter(d => d.status === 'in-transit' && (d.volunteerId === user?.id || d.volunteerId === 'volunteer1'));
    const completed = mockDonations.filter(d => d.status === 'delivered' && (d.volunteerId === user?.id || d.volunteerId === 'volunteer1'));
    
    setClaimedDonations(claimed);
    setActiveDeliveries(active);
    setCompletedDeliveries(completed);
  }, [user]);

  const handleVolunteerForDelivery = (donationId: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to volunteer for delivery');
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'volunteer') {
      toast.error('Only registered volunteers can pick up donations');
      return;
    }
    
    toast.success('You have volunteered for this delivery!');
    // In a real app, this would update the database and trigger notifications
    
    // Update the local state to reflect the change
    setClaimedDonations(claimedDonations.filter(donation => donation.id !== donationId));
  };

  const handleCompleteDelivery = (donationId: string) => {
    toast.success('Delivery marked as completed!');
    // In a real app, this would update the database and trigger notifications
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Volunteer</h1>
          <p className="text-muted-foreground mt-2">
            Help deliver food from donors to those in need.
          </p>
        </div>
        
        {!isAuthenticated || user?.role !== 'volunteer' ? (
          <Card className="mb-8 border-dashed">
            <CardHeader>
              <CardTitle>Become a Volunteer</CardTitle>
              <CardDescription>
                Join our community and help deliver food to those in need
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="font-medium text-lg mb-2">Make a Difference</div>
                    <p className="text-muted-foreground text-sm">
                      Help reduce food waste and feed people in your community.
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="font-medium text-lg mb-2">Flexible Schedule</div>
                    <p className="text-muted-foreground text-sm">
                      Choose deliveries that fit your availability.
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="font-medium text-lg mb-2">Easy to Start</div>
                    <p className="text-muted-foreground text-sm">
                      Sign up, verify your details, and start helping today.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {!isAuthenticated ? (
                <Button onClick={() => navigate('/register')}>
                  Register as Volunteer
                </Button>
              ) : (
                <Button onClick={() => navigate('/profile')}>
                  Update Profile to Volunteer
                </Button>
              )}
            </CardFooter>
          </Card>
        ) : (
          <>
            <Tabs defaultValue="available" className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="available">Available Deliveries</TabsTrigger>
                <TabsTrigger value="active">Your Active Deliveries</TabsTrigger>
                <TabsTrigger value="history">Delivery History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="available" className="pt-6">
                {claimedDonations.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {claimedDonations.map(donation => (
                        <DonationCard 
                          key={donation.id} 
                          donation={donation}
                          onVolunteerForDelivery={handleVolunteerForDelivery}
                        />
                      ))}
                    </div>
                    <div className="mt-8 bg-muted rounded-lg p-6">
                      <div className="max-w-2xl mx-auto text-center">
                        <h3 className="text-lg font-medium mb-2">Delivery Instructions</h3>
                        <p className="text-muted-foreground mb-4">
                          When you volunteer for a delivery, you'll receive contact information for the donor and recipient.
                          Make sure to coordinate pickup and delivery times with both parties.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-muted/40 rounded-lg">
                    <h3 className="text-xl font-medium mb-2">No deliveries available right now</h3>
                    <p className="text-muted-foreground mb-6">
                      Check back later for new delivery opportunities.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="active" className="pt-6">
                {activeDeliveries.length > 0 ? (
                  <div className="space-y-6">
                    {activeDeliveries.map(delivery => (
                      <Card key={delivery.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{delivery.name}</CardTitle>
                              <CardDescription>
                                Pickup from: {delivery.donorName}
                              </CardDescription>
                            </div>
                            <div className={`px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800`}>
                              In Transit
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div className="text-muted-foreground">Pickup:</div>
                                  <div className="col-span-2 flex items-center gap-1">
                                    <MapPin size={14} className="text-primary" />
                                    {delivery.location.address}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div className="text-muted-foreground">Delivery:</div>
                                  <div className="col-span-2 flex items-center gap-1">
                                    <MapPin size={14} className="text-accent" />
                                    123 Recipient St, Anytown, USA
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div className="text-muted-foreground">Distance:</div>
                                  <div className="col-span-2">2.3 miles</div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div className="text-muted-foreground">Quantity:</div>
                                  <div className="col-span-2">{delivery.quantity}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="border-l pl-6 hidden md:block">
                              <div className="text-sm font-medium mb-2">Delivery Notes:</div>
                              <p className="text-sm text-muted-foreground">
                                Please ensure food is kept at proper temperature during transit.
                                Recipient will be available for delivery between 2-5 PM.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t bg-muted/20 flex justify-between">
                          <div className="text-xs text-muted-foreground">
                            Expected delivery by 5:00 PM today
                          </div>
                          <div className="space-x-2">
                            <Button size="sm" variant="outline">
                              View Map
                            </Button>
                            <Button size="sm" onClick={() => handleCompleteDelivery(delivery.id)}>
                              Mark Delivered
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-muted/40 rounded-lg">
                    <h3 className="text-xl font-medium mb-2">No active deliveries</h3>
                    <p className="text-muted-foreground mb-6">
                      You don't have any deliveries in progress.
                    </p>
                    <Button variant="outline" onClick={() => document.querySelector('button[value="available"]')?.click()}>
                      Browse available deliveries
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="pt-6">
                {completedDeliveries.length > 0 ? (
                  <div>
                    <div className="space-y-4">
                      {completedDeliveries.map(delivery => (
                        <Card key={delivery.id}>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <div>
                                <CardTitle>{delivery.name}</CardTitle>
                                <CardDescription>
                                  From {delivery.donorName} to {delivery.claimedBy?.name}
                                </CardDescription>
                              </div>
                              <div className={`px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800`}>
                                Completed
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-4">
                            <div className="text-sm text-muted-foreground">
                              Delivered on {new Date(delivery.updatedAt).toLocaleDateString()}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="mt-8 bg-primary/10 rounded-lg p-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium mb-2">Your Impact</h3>
                        <p className="text-3xl font-bold text-primary mb-2">
                          {completedDeliveries.length} Deliveries
                        </p>
                        <p className="text-muted-foreground">
                          You've helped deliver approximately {completedDeliveries.length * 10}kg of food and prevented {completedDeliveries.length * 8}kg of CO₂ emissions.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-muted/40 rounded-lg">
                    <h3 className="text-xl font-medium mb-2">No delivery history yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Once you complete deliveries, they'll appear here.
                    </p>
                    <Button variant="outline" onClick={() => document.querySelector('button[value="available"]')?.click()}>
                      Start your first delivery
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="justify-start h-auto py-4 px-4">
                    <div>
                      <div className="font-medium mb-1 text-left">Food Safety Guidelines</div>
                      <p className="text-xs text-muted-foreground text-left">
                        Learn how to safely transport different types of food.
                      </p>
                    </div>
                    <ArrowRight size={16} className="ml-auto" />
                  </Button>
                  
                  <Button variant="outline" className="justify-start h-auto py-4 px-4">
                    <div>
                      <div className="font-medium mb-1 text-left">Delivery Best Practices</div>
                      <p className="text-xs text-muted-foreground text-left">
                        Tips for smooth and efficient deliveries.
                      </p>
                    </div>
                    <ArrowRight size={16} className="ml-auto" />
                  </Button>
                  
                  <Button variant="outline" className="justify-start h-auto py-4 px-4">
                    <div>
                      <div className="font-medium mb-1 text-left">Volunteer Community</div>
                      <p className="text-xs text-muted-foreground text-left">
                        Connect with other volunteers and share experiences.
                      </p>
                    </div>
                    <ArrowRight size={16} className="ml-auto" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default VolunteerPage;
