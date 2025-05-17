
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useUser } from '@/context/UserContext';
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
import DonationCard from '@/components/donations/DonationCard';
import { mockDonations, FoodDonation, foodCategories, freshnessLevels } from '@/lib/mockData';
import { Search } from 'lucide-react';

const RequestPage = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [availableDonations, setAvailableDonations] = useState<FoodDonation[]>([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFreshness, setSelectedFreshness] = useState<string>('');
  
  useEffect(() => {
    // Filter donations that are available
    const filteredDonations = mockDonations
      .filter(donation => donation.status === 'available')
      .filter(donation => {
        // Apply search filter if there's a query
        if (searchQuery && !donation.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !donation.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Apply category filter if selected
        if (selectedCategory && donation.category !== selectedCategory) {
          return false;
        }
        
        // Apply freshness filter if selected
        if (selectedFreshness && donation.freshness !== selectedFreshness) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    setAvailableDonations(filteredDonations);
  }, [searchQuery, selectedCategory, selectedFreshness]);

  const handleClaimDonation = (donationId: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to claim donations');
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'ngo') {
      toast.error('Only NGOs and registered receivers can claim donations');
      return;
    }
    
    toast.success('Donation claimed successfully!');
    // In a real app, this would update the database and trigger notifications
    
    // Update the local state to reflect the change
    setAvailableDonations(availableDonations.filter(donation => donation.id !== donationId));
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
                <SelectItem value="all-categories">All Categories</SelectItem>
                {foodCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedFreshness} onValueChange={setSelectedFreshness}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by freshness" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-freshness">All Freshness Levels</SelectItem>
                <SelectItem value="hot">Hot (Just cooked)</SelectItem>
                <SelectItem value="warm">Warm (Few hours old)</SelectItem>
                <SelectItem value="cold">Cold (Refrigerated/Packaged)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Results section */}
        <div>
          {availableDonations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableDonations.map(donation => (
                <DonationCard 
                  key={donation.id}
                  donation={donation}
                  onClaimDonation={handleClaimDonation}
                />
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
              user?.role === 'ngo' ? (
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
