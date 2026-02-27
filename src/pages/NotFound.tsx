import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import caeLogoTruth from "@/assets/cae-logo-truth.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <img src={caeLogoTruth} alt="CAE Logo" className="w-[120px] mb-8" />
      <h1 className="font-display text-7xl text-primary mb-2">404</h1>
      <p className="font-display text-xl text-foreground mb-2">Truth not found here.</p>
      <p className="font-body text-sm text-muted-foreground mb-8 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link to="/">
          <Button variant="outline" className="font-body font-bold">
            Go Home
          </Button>
        </Link>
        <Link to="/auth">
          <Button className="font-body font-bold">Start Analyzing</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
