import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Ghost, Home, Trophy } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-pink-soft/20 to-pink-secondary/30 flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center bg-card/80 backdrop-blur-sm border-pink-secondary/30">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Ghost className="w-32 h-32 text-primary" />
          </div>
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-soft to-pink-secondary/50 rounded-full flex items-center justify-center">
              <Ghost className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-pink-hot bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-6">
          Oops! Looks like this page bounced out of the cup. 
          The page you're looking for doesn't exist.
        </p>
        <Button 
          asChild
          className="bg-gradient-to-r from-primary to-pink-hot hover:from-pink-hot hover:to-primary text-white"
        >
          <a href="/#/" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Return to Tournament
          </a>
        </Button>
      </Card>
    </div>
  );
};

export default NotFound;
