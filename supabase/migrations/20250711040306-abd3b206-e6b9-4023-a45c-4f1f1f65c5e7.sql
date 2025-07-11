
-- Create user profiles table to store additional user information
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  user_role TEXT NOT NULL CHECK (user_role IN ('donor', 'ngo', 'volunteer', 'admin')),
  profile_photo TEXT,
  city TEXT,
  state TEXT,
  gps_coordinates POINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create donor-specific information table
CREATE TABLE public.donor_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT,
  business_type TEXT CHECK (business_type IN ('restaurant', 'store', 'individual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create NGO-specific information table
CREATE TABLE public.ngo_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  organization_name TEXT NOT NULL,
  ngo_registration_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create volunteer-specific information table
CREATE TABLE public.volunteer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  availability_schedule JSONB,
  transport_mode TEXT CHECK (transport_mode IN ('bike', 'car', 'foot', 'public_transport')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create food categories table
CREATE TABLE public.food_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default food categories
INSERT INTO public.food_categories (name, description) VALUES
('Fruits & Vegetables', 'Fresh produce, fruits and vegetables'),
('Dairy Products', 'Milk, cheese, yogurt and other dairy items'),
('Bakery Items', 'Bread, pastries, cakes and baked goods'),
('Prepared Meals', 'Cooked meals and ready-to-eat food'),
('Beverages', 'Drinks, juices and beverages'),
('Grains & Cereals', 'Rice, wheat, cereals and grain products'),
('Meat & Poultry', 'Fresh and cooked meat products'),
('Seafood', 'Fish and other seafood items'),
('Snacks', 'Packaged snacks and light food items'),
('Frozen Foods', 'Frozen meals and food items');

-- Create donations table
CREATE TABLE public.donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  food_category_id UUID REFERENCES public.food_categories(id) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL DEFAULT 'portions',
  freshness TEXT NOT NULL CHECK (freshness IN ('hot', 'warm', 'cold')),
  expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_instructions TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'completed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create claims table to track donation claims
CREATE TABLE public.donation_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE NOT NULL,
  claimer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  volunteer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  pickup_time TIMESTAMP WITH TIME ZONE,
  delivery_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(donation_id, claimer_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for donor profiles
CREATE POLICY "Users can view their own donor profile" ON public.donor_profiles
  FOR SELECT USING (auth.uid() = (SELECT id FROM public.profiles WHERE id = user_id));

CREATE POLICY "Users can manage their own donor profile" ON public.donor_profiles
  FOR ALL USING (auth.uid() = (SELECT id FROM public.profiles WHERE id = user_id));

-- Create RLS policies for NGO profiles
CREATE POLICY "Users can view their own ngo profile" ON public.ngo_profiles
  FOR SELECT USING (auth.uid() = (SELECT id FROM public.profiles WHERE id = user_id));

CREATE POLICY "Users can manage their own ngo profile" ON public.ngo_profiles
  FOR ALL USING (auth.uid() = (SELECT id FROM public.profiles WHERE id = user_id));

-- Create RLS policies for volunteer profiles
CREATE POLICY "Users can view their own volunteer profile" ON public.volunteer_profiles
  FOR SELECT USING (auth.uid() = (SELECT id FROM public.profiles WHERE id = user_id));

CREATE POLICY "Users can manage their own volunteer profile" ON public.volunteer_profiles
  FOR ALL USING (auth.uid() = (SELECT id FROM public.profiles WHERE id = user_id));

-- Create RLS policies for donations
CREATE POLICY "Anyone can view available donations" ON public.donations
  FOR SELECT USING (status = 'available' OR donor_id = auth.uid());

CREATE POLICY "Donors can manage their own donations" ON public.donations
  FOR ALL USING (donor_id = auth.uid());

-- Create RLS policies for donation claims
CREATE POLICY "Users can view their own claims" ON public.donation_claims
  FOR SELECT USING (claimer_id = auth.uid() OR volunteer_id = auth.uid() OR 
    (SELECT donor_id FROM public.donations WHERE id = donation_id) = auth.uid());

CREATE POLICY "NGOs can create claims" ON public.donation_claims
  FOR INSERT WITH CHECK (claimer_id = auth.uid());

CREATE POLICY "Users can update their own claims" ON public.donation_claims
  FOR UPDATE USING (claimer_id = auth.uid() OR volunteer_id = auth.uid() OR 
    (SELECT donor_id FROM public.donations WHERE id = donation_id) = auth.uid());

-- Create RLS policies for food categories (public read access)
CREATE POLICY "Anyone can view food categories" ON public.food_categories
  FOR SELECT TO authenticated, anon USING (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'user_role', 'donor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update donations status when expired
CREATE OR REPLACE FUNCTION public.update_expired_donations()
RETURNS void AS $$
BEGIN
  UPDATE public.donations 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'available' 
  AND expiry_time < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
