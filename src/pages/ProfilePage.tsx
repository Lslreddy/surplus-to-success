
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockDonations } from '@/lib/mockData';
import DonationCard from '@/components/donations/DonationCard';

const ProfilePage = () => {
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form states
  const [name, setName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(profile?.phone_number || '');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');

  // Filter donations based on user role
  const userDonations = mockDonations.filter(d => {
    if (profile?.user_role === 'donor') {
      return d.donorId === user?.id || d.donorId === 'donor1';
    } else if (profile?.user_role === 'ngo') {
      return d.claimedBy?.id === user?.id || d.claimedBy?.id === 'ngo1';
    } else if (profile?.user_role === 'volunteer') {
      return d.volunteerId === user?.id || d.volunteerId === 'volunteer1';
    }
    return false;
  });

  const handleSaveProfile = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, we would update the user profile in the backend
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setIsSaving(false);
    }, 1000);
  };
  
  const handlePasswordReset = () => {
    // Simulate sending a password reset email
    toast.success('Password reset link sent to your email!');
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account information and view your activity.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column - Profile info */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Your personal details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Your phone number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Your address"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">About</Label>
                      <Textarea 
                        id="bio" 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself or your organization"
                        rows={4}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">User Type</Label>
                      <Select defaultValue={profile?.user_role || ''} disabled>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="donor">Food Donor</SelectItem>
                          <SelectItem value="ngo">Food Receiver (NGO)</SelectItem>
                          <SelectItem value="volunteer">Volunteer</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        To change your user type, please contact support.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{profile?.full_name}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">User Type</p>
                        <p className="font-medium capitalize">{profile?.user_role}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Member Since</p>
                        <p className="font-medium">May 2023</p>
                      </div>
                      
                      <div className="bg-primary/10 rounded-lg p-4">
                        <div className="text-sm font-medium">Your Impact</div>
                        {profile?.user_role === 'donor' && (
                          <p className="text-2xl font-bold text-primary">12 donations</p>
                        )}
                        {profile?.user_role === 'ngo' && (
                          <p className="text-2xl font-bold text-primary">28 meals received</p>
                        )}
                        {profile?.user_role === 'volunteer' && (
                          <p className="text-2xl font-bold text-primary">8 deliveries</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex-col space-y-2">
                {isEditing ? (
                  <div className="flex w-full gap-2">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="w-full" 
                      onClick={handleSaveProfile} 
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handlePasswordReset}
                >
                  Change Password
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  Notification Preferences
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  Privacy Settings
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={() => {
                    signOut();
                    navigate('/');
                  }}
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Activity */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Activity</CardTitle>
                <CardDescription>
                  {profile?.user_role === 'donor' ? 'Food you\'ve donated' : 
                   profile?.user_role === 'ngo' ? 'Food you\'ve received' : 
                   'Deliveries you\'ve made'}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <Tabs defaultValue="active">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="all">All Activity</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="active" className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userDonations
                        .filter(d => ['available', 'claimed', 'in-transit'].includes(d.status))
                        .map(donation => (
                          <DonationCard 
                            key={donation.id}
                            donation={donation}
                            variant="compact"
                          />
                        ))}
                      
                      {userDonations.filter(d => ['available', 'claimed', 'in-transit'].includes(d.status)).length === 0 && (
                        <div className="col-span-2 text-center py-8">
                          <p className="text-muted-foreground">No active items found.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="completed" className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userDonations
                        .filter(d => d.status === 'delivered')
                        .map(donation => (
                          <DonationCard 
                            key={donation.id}
                            donation={donation}
                            variant="compact"
                          />
                        ))}
                      
                      {userDonations.filter(d => d.status === 'delivered').length === 0 && (
                        <div className="col-span-2 text-center py-8">
                          <p className="text-muted-foreground">No completed items found.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="all" className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userDonations.map(donation => (
                        <DonationCard 
                          key={donation.id}
                          donation={donation}
                          variant="compact"
                        />
                      ))}
                      
                      {userDonations.length === 0 && (
                        <div className="col-span-2 text-center py-8">
                          <p className="text-muted-foreground">No activity found.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <div className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      if (profile?.user_role === 'donor') {
                        navigate('/donate');
                      } else if (profile?.user_role === 'ngo') {
                        navigate('/request');
                      } else {
                        navigate('/volunteer');
                      }
                    }}
                  >
                    {profile?.user_role === 'donor' ? 'Donate More Food' : 
                     profile?.user_role === 'ngo' ? 'Browse Available Food' : 
                     'Find More Deliveries'}
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>
                    Badges and milestones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full p-2 bg-primary/10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
                        <path d="M7 7h.01"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">First Timer</div>
                      <div className="text-sm text-muted-foreground">
                        {profile?.user_role === 'donor' ? 'Made your first donation' : 
                        profile?.user_role === 'ngo' ? 'Received your first donation' : 
                        'Completed your first delivery'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full p-2 bg-accent/10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Hunger Hero</div>
                      <div className="text-sm text-muted-foreground">
                        {profile?.user_role === 'donor' ? 'Made 5+ donations' : 
                        profile?.user_role === 'ngo' ? 'Received 10+ donations' : 
                        'Completed 5+ deliveries'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 opacity-50">
                    <div className="rounded-full p-2 bg-secondary/10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                        <line x1="4" x2="4" y1="22" y2="15"></line>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Community Champion</div>
                      <div className="text-sm text-muted-foreground">
                        {profile?.user_role === 'donor' ? '50+ meals donated' : 
                        profile?.user_role === 'ngo' ? 'Fed 100+ people' : 
                        'Delivered to 10+ locations'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Your Stats</CardTitle>
                  <CardDescription>
                    Activity metrics and impact
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile?.user_role === 'donor' && (
                    <>
                      <div>
                        <div className="flex justify-between mb-1">
                          <p className="text-sm font-medium">Total Donations</p>
                          <p className="text-sm font-medium">12</p>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: '60%' }}></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Progress to next achievement: 60%</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Food Saved</p>
                          <p className="text-lg font-bold">23 kg</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">CO₂ Reduced</p>
                          <p className="text-lg font-bold">18.4 kg</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Most Donated Food</p>
                        <div className="flex justify-between text-sm">
                          <p className="text-muted-foreground">Prepared Meals</p>
                          <p>8 donations</p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {profile?.user_role === 'ngo' && (
                    <>
                      <div>
                        <div className="flex justify-between mb-1">
                          <p className="text-sm font-medium">Total Claims</p>
                          <p className="text-sm font-medium">28</p>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: '70%' }}></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Progress to next achievement: 70%</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Meals Served</p>
                          <p className="text-lg font-bold">112</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">People Fed</p>
                          <p className="text-lg font-bold">48</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Most Received Food</p>
                        <div className="flex justify-between text-sm">
                          <p className="text-muted-foreground">Bread & Pastries</p>
                          <p>12 times</p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {profile?.user_role === 'volunteer' && (
                    <>
                      <div>
                        <div className="flex justify-between mb-1">
                          <p className="text-sm font-medium">Total Deliveries</p>
                          <p className="text-sm font-medium">8</p>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: '40%' }}></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Progress to next achievement: 40%</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Distance</p>
                          <p className="text-lg font-bold">43 km</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Time Saved</p>
                          <p className="text-lg font-bold">12 hrs</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Most Active Day</p>
                        <div className="flex justify-between text-sm">
                          <p className="text-muted-foreground">Saturday</p>
                          <p>5 deliveries</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
