
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
import { useForm, Controller } from 'react-hook-form';

interface DonationFormData {
  title: string;
  food_category_id: string;
  quantity: string;
  unit: string;
  expiry_time: string;
  freshness: 'hot' | 'warm' | 'cold';
  description?: string;
  pickup_address: string;
  pickup_instructions?: string;
  photo?: FileList;
}

const DonatePage = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [foodCategories, setFoodCategories] = useState<any[]>([]);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<DonationFormData>();

  // Fetch food categories
  React.useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('food_categories')
        .select('*')
        .order('name');
      
      if (data) {
        setFoodCategories(data);
      }
    };
    
    fetchCategories();
  }, []);

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

  const onSubmit = async (data: DonationFormData) => {
    if (!user) {
      toast.error('You must be logged in to donate');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload photo if provided
      let photo_url = null;
      if (data.photo && data.photo[0]) {
        const file = data.photo[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('donation-photos')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('donation-photos')
            .getPublicUrl(fileName);
          photo_url = urlData.publicUrl;
        }
      }

      // Create donation
      const { error } = await supabase
        .from('donations')
        .insert([
          {
            donor_id: user.id,
            title: data.title,
            description: data.description,
            food_category_id: data.food_category_id,
            quantity: parseInt(data.quantity),
            unit: data.unit,
            freshness: data.freshness,
            expiry_time: data.expiry_time,
            pickup_address: data.pickup_address,
            pickup_instructions: data.pickup_instructions,
            photo_url,
            status: 'available'
          }
        ]);
      
      if (error) {
        throw error;
      }
      
      toast.success('Donation successfully posted!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error posting donation:', error);
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

  if (!isAuthenticated) {
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
                    <Label htmlFor="title">Food Name</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g., Vegetable Curry, Fresh Bread, etc."
                      {...register('title', { required: 'Food name is required' })}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="food_category_id">Category</Label>
                      <Controller
                        name="food_category_id"
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
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.food_category_id && (
                        <p className="text-sm text-destructive">{errors.food_category_id.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input 
                        id="quantity" 
                        type="number"
                        placeholder="e.g., 5"
                        {...register('quantity', { required: 'Quantity is required' })}
                      />
                      {errors.quantity && (
                        <p className="text-sm text-destructive">{errors.quantity.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input 
                        id="unit" 
                        placeholder="e.g., kg, portions, loaves"
                        defaultValue="portions"
                        {...register('unit', { required: 'Unit is required' })}
                      />
                      {errors.unit && (
                        <p className="text-sm text-destructive">{errors.unit.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="freshness">Freshness</Label>
                      <Controller
                        name="freshness"
                        control={control}
                        defaultValue="cold"
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
                    <Label htmlFor="expiry_time">Expiry Time</Label>
                    <Input 
                      id="expiry_time" 
                      type="datetime-local"
                      {...register('expiry_time', { required: 'Expiry time is required' })}
                    />
                    {errors.expiry_time && (
                      <p className="text-sm text-destructive">{errors.expiry_time.message}</p>
                    )}
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
                    <Label htmlFor="pickup_address">Pickup Address</Label>
                    <Input 
                      id="pickup_address" 
                      placeholder="Address for pickup"
                      {...register('pickup_address', { required: 'Pickup address is required' })}
                    />
                    {errors.pickup_address && (
                      <p className="text-sm text-destructive">{errors.pickup_address.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pickup_instructions">Pickup Instructions (Optional)</Label>
                    <Textarea 
                      id="pickup_instructions" 
                      placeholder="Any special instructions for pickup"
                      rows={2}
                      {...register('pickup_instructions')}
                    />
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
