
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 hero-gradient">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <div className="inline-block">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                  Join the food sharing revolution
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Turning Food Waste into <span className="text-primary">Community Plates</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                PlateShare connects surplus food from restaurants, grocery stores, and homes with NGOs, shelters, and people in need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate('/donate')} className="gap-2">
                  Donate Now <ArrowRight size={16} />
                </Button>
                <Button size="lg" variant="secondary" onClick={() => navigate('/request')} className="gap-2">
                  Request Food <ArrowRight size={16} />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Join 500+ donors and 200+ volunteer drivers in making a difference.
              </p>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="animate-float">
                  <img
                    src="https://images.unsplash.com/photo-1488900128323-21503983a07e?auto=format&fit=crop&w=800&q=80"
                    alt="Food sharing community"
                    className="rounded-2xl shadow-xl"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg max-w-xs">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
                        <path d="M7 7h.01"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Reduce Food Waste</p>
                      <p className="text-sm text-muted-foreground">Save 2.7kg CO₂ per donation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How PlateShare Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple process to connect surplus food with people who need it most.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-6 text-center shadow-sm border">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-semibold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">List Surplus Food</h3>
              <p className="text-muted-foreground">
                Restaurants, grocery stores, and individuals can post details about their surplus food.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 text-center shadow-sm border">
              <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-semibold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Match with Recipients</h3>
              <p className="text-muted-foreground">
                NGOs and individuals in need can browse available donations and request items.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 text-center shadow-sm border">
              <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-semibold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Volunteer Delivery</h3>
              <p className="text-muted-foreground">
                Volunteers can sign up to transport food from donors to recipients safely.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button onClick={() => navigate('/volunteer')} variant="outline" size="lg" className="gap-2">
              Become a Volunteer <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary">3.2K</p>
              <p className="text-muted-foreground mt-2">Meals Shared</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary">500+</p>
              <p className="text-muted-foreground mt-2">Active Donors</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary">200+</p>
              <p className="text-muted-foreground mt-2">Volunteer Drivers</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary">8.6T</p>
              <p className="text-muted-foreground mt-2">Food Waste Saved</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80')] bg-cover opacity-10"></div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
              <p className="text-lg mb-8">
                Join our community of donors, volunteers, and recipients to help reduce food waste and feed those in need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="secondary" onClick={() => navigate('/register')}>
                  Sign Up Now
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white hover:bg-white/10" onClick={() => navigate('/donate')}>
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default LandingPage;
