
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background z-50 border-b border-border/40 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex items-center space-x-2">
              <span className="bg-primary text-primary-foreground rounded-lg p-2 text-lg font-bold">PS</span>
              <span className="text-xl font-semibold text-foreground">PlateShare</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated && (
              <Link to="/dashboard" className="text-foreground/80 hover:text-primary transition-colors">
                Dashboard
              </Link>
            )}
            <Link to="/donate" className="text-foreground/80 hover:text-primary transition-colors">
              Donate Food
            </Link>
            <Link to="/request" className="text-foreground/80 hover:text-primary transition-colors">
              Request Food
            </Link>
            <Link to="/volunteer" className="text-foreground/80 hover:text-primary transition-colors">
              Volunteer
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User size={16} />
                    {profile?.full_name || user?.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Log In
                </Button>
                <Button variant="default" onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-foreground hover:text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3">
            {isAuthenticated && (
              <Link 
                to="/dashboard" 
                className="block py-2 text-foreground/80 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <Link 
              to="/donate" 
              className="block py-2 text-foreground/80 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Donate Food
            </Link>
            <Link 
              to="/request" 
              className="block py-2 text-foreground/80 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Request Food
            </Link>
            <Link 
              to="/volunteer" 
              className="block py-2 text-foreground/80 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Volunteer
            </Link>
            
            <div className="pt-2 border-t border-border/60">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/profile" 
                    className="block py-2 text-foreground/80 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }} 
                    className="block w-full text-left py-2 text-destructive hover:text-destructive/80"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                  >
                    Log In
                  </Button>
                  <Button 
                    onClick={() => {
                      navigate('/register');
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
