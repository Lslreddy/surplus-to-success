
import React from 'react';
import { FoodDonation, formatTimeAgo, timeUntilExpiry, getFreshnessBadgeColor, getStatusBadgeColor } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';

interface DonationCardProps {
  donation: FoodDonation;
  variant?: 'default' | 'compact';
  onClaimDonation?: (donationId: string) => void;
  onVolunteerForDelivery?: (donationId: string) => void;
}

const DonationCard: React.FC<DonationCardProps> = ({
  donation,
  variant = 'default',
  onClaimDonation,
  onVolunteerForDelivery
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();

  const handleClaimDonation = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to claim donations');
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'ngo') {
      toast.error('Only NGOs and registered receivers can claim donations');
      return;
    }
    
    if (onClaimDonation) {
      onClaimDonation(donation.id);
    }
  };

  const handleVolunteerForDelivery = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to volunteer for delivery');
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'volunteer') {
      toast.error('Only registered volunteers can pick up donations');
      return;
    }
    
    if (onVolunteerForDelivery) {
      onVolunteerForDelivery(donation.id);
    }
  };

  return (
    <Card className="donation-card overflow-hidden">
      {variant === 'default' && (
        <div className="aspect-video relative overflow-hidden">
          <img
            src={donation.imageUrl || 'https://images.unsplash.com/photo-1580906853111-c9846e433c05?auto=format&fit=crop&w=800&q=80'}
            alt={donation.name}
            className="object-cover w-full h-full"
          />
          <div className={`absolute top-2 right-2 text-xs font-semibold text-white px-2 py-1 rounded-full ${getFreshnessBadgeColor(donation.freshness)}`}>
            {donation.freshness.charAt(0).toUpperCase() + donation.freshness.slice(1)}
          </div>
        </div>
      )}
      
      <CardContent className={variant === 'default' ? 'pt-6' : 'pt-4'}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg leading-tight">{donation.name}</h3>
            <p className="text-sm text-muted-foreground">{donation.donorName}</p>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(donation.status)}`}>
            {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
          </span>
        </div>
        
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-x-2 text-sm">
            <div className="text-muted-foreground">Quantity</div>
            <div>{donation.quantity}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-2 text-sm">
            <div className="text-muted-foreground">Category</div>
            <div>{donation.category}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-2 text-sm">
            <div className="text-muted-foreground">Location</div>
            <div className="truncate">{donation.location.address}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-2 text-sm">
            <div className="text-muted-foreground">Expires in</div>
            <div className="font-medium text-amber-600">{timeUntilExpiry(donation.expiryTime)}</div>
          </div>
        </div>
        
        {donation.description && variant === 'default' && (
          <p className="mt-4 text-sm line-clamp-2">{donation.description}</p>
        )}
      </CardContent>
      
      {variant === 'default' && (
        <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-between">
          <div className="text-xs text-muted-foreground">
            Posted {formatTimeAgo(donation.createdAt)}
          </div>
          <div className="flex space-x-2">
            {donation.status === 'available' && user?.role === 'ngo' && (
              <Button size="sm" onClick={handleClaimDonation}>
                Claim
              </Button>
            )}
            {donation.status === 'claimed' && user?.role === 'volunteer' && !donation.volunteerId && (
              <Button size="sm" variant="outline" onClick={handleVolunteerForDelivery}>
                Deliver
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default DonationCard;
