import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm"
      >
        <div className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow">
          <Heart className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-5xl font-serif font-bold text-foreground mb-2">404</h1>
        <p className="text-muted-foreground mb-8">
          This page doesn't exist, but love still does.
        </p>
        <Button asChild className="gradient-primary rounded-xl h-12 px-8 font-semibold shadow-glow">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tangle
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
