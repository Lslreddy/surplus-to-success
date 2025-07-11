
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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

interface DonationFormProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const DonationForm: React.FC<DonationFormProps> = ({ userId, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [foodCategories, setFoodCategories] = useState<any[]>([]);

  const { register, handleSubmit, control, formState: { errors } } = useForm<DonationFormData>();

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

  const onSubmit = async (data: DonationFormData) => {
    setIsSubmitting(true);
    
    try {
      // Upload photo if provided
      let photo_url = null;
      if (data.photo && data.photo[0]) {
        const file = data.photo[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        
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
            donor_id: userId,
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
      onSuccess();
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

  return (
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
            onClick={onCancel}
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
  );
};

export default DonationForm;
