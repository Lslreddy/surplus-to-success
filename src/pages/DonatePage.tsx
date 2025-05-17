import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { foodCategories, freshnessLevels } from '@/lib/mockData';
import { useForm, Controller } from 'react-hook-form';

interface DonationFormData {
  name: string;
  category: string;
  quantity: string;
  timeCooked?: string;
  expiryTime: string;
  freshness: string;
  description?: string;
  location: string;
  photo?: FileList;
}

const DonatePage = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<DonationFormData>();
  const selectedCategory = watch('category');

  const onSubmit = async (data: DonationFormData) => {
    // For demo purposes, we'll simulate a form submission
    setIsSubmitting(true);
    
    try {
      // In a real app, we'd make an API call to store the donation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Donation successfully posted!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to post donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Donation Details</CardTitle>
              <CardDescription>
                Tell us about the food you want to donate
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Food Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g., Vegetable Curry, Fresh Bread, etc."
                      {...register('name', { required: 'Food name is required' })}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Controller
                        name="category"
                        control={control}
                        defaultValue=""
                        rules={{ required: 'Category is required' }}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {foodCategories.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.category && (
                        <p className="text-sm text-destructive">{errors.category.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input 
                        id="quantity" 
                        placeholder="e.g., 5 kg, serves 10, 20 loaves"
                        {...register('quantity', { required: 'Quantity is required' })}
                      />
                      {errors.quantity && (
                        <p className="text-sm text-destructive">{errors.quantity.message}</p>
                      )}
                    </div>
                  </div>
                  
                  {selectedCategory === 'Prepared Meals' && (
                    <div className="space-y-2">
                      <Label htmlFor="timeCooked">Time Cooked</Label>
                      <Input 
                        id="timeCooked" 
                        type="datetime-local"
                        {...register('timeCooked')}
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="expiryTime">Expiry Time</Label>
                      <Input 
                        id="expiryTime" 
                        type="datetime-local"
                        {...register('expiryTime', { required: 'Expiry time is required' })}
                      />
                      {errors.expiryTime && (
                        <p className="text-sm text-destructive">{errors.expiryTime.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="freshness">Freshness</Label>
                      <Controller
                        name="freshness"
                        control={control}
                        defaultValue=""
                        rules={{ required: 'Freshness is required' }}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select freshness" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hot">Hot (Just cooked)</SelectItem>
                              <SelectItem value="warm">Warm (Few hours old)</SelectItem>
                              <SelectItem value="cold">Cold (Refrigerated/Packaged)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.freshness && (
                        <p className="text-sm text-destructive">{errors.freshness.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe the food, ingredients, allergens, etc."
                      rows={3}
                      {...register('description')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Pickup Location</Label>
                    <Input 
                      id="location" 
                      placeholder="Address for pickup"
                      {...register('location', { required: 'Pickup location is required' })}
                    />
                    {errors.location && (
                      <p className="text-sm text-destructive">{errors.location.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="photo">Upload Photo (Optional)</Label>
                    <Input 
                      id="photo" 
                      type="file" 
                      accept="image/*"
                      {...register('photo')}
                      onChange={handlePhotoChange}
                    />
                    
                    {photoPreview && (
                      <div className="mt-2">
                        <img 
                          src={photoPreview} 
                          alt="Food preview" 
                          className="w-full max-w-md h-auto rounded-md"
                        />
                      </div>
                    )}
                  </div>
                  
                </div>
              </CardContent>
              <CardFooter className="flex gap-4">
                <Button 
                  variant="outline"
                  type="button"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Donation'}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Donation Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs text-primary font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Safety First</p>
                    <p className="text-sm text-muted-foreground">
                      Ensure food is handled safely and is free from contamination.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs text-primary font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Be Accurate</p>
                    <p className="text-sm text-muted-foreground">
                      Provide accurate information about quantity, expiry time, and ingredients.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs text-primary font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Packaging</p>
                    <p className="text-sm text-muted-foreground">
                      Use clean, sealed containers suitable for the type of food you're donating.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs text-primary font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Be Available</p>
                    <p className="text-sm text-muted-foreground">
                      Make yourself available for pickup during the specified time window.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default DonatePage;
