
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="text-center max-w-md px-4">
        <div className="mb-6 text-6xl font-bold text-primary">404</div>
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate("/")}>
            Go to Home
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
        <div className="mt-12">
          <p className="text-sm text-muted-foreground">
            Looking for something specific? Try browsing our main sections:
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <Button variant="link" onClick={() => navigate("/donate")}>
              Donate Food
            </Button>
            <Button variant="link" onClick={() => navigate("/request")}>
              Request Food
            </Button>
            <Button variant="link" onClick={() => navigate("/volunteer")}>
              Volunteer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
