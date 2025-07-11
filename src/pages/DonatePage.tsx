
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import DonationForm from '@/components/donations/DonationForm';
import DonationGuidelines from '@/components/donations/DonationGuidelines';

const DonatePage = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not a donor
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (profile && profile.user_role !== 'donor') {
      toast.error('Only donors can access this page');
      navigate('/dashboard');
    }
  }, [isAuthenticated, profile, navigate]);

  const handleDonationSuccess = () => {
    navigate('/dashboard');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Donate Food</h1>
            <p className="text-muted-foreground mt-2">
              Share your surplus food with people in need. Fill out the form below to list your donation.
            </p>
          </div>
          
          <DonationForm 
            userId={user.id}
            onSuccess={handleDonationSuccess}
            onCancel={handleCancel}
          />
          
          <DonationGuidelines />
        </div>
      </div>
    </MainLayout>
  );
};

export default DonatePage;
