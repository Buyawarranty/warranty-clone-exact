import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Menu, X, Shield, Phone, Mail } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              CoverMe Warranty
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-foreground hover:text-primary transition-colors">Home</a>
            <a href="#quotes" className="text-foreground hover:text-primary transition-colors">Get Quote</a>
            <a href="#products" className="text-foreground hover:text-primary transition-colors">Products</a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">Contact</a>
          </nav>

          {/* Contact Info & CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>0800 123 4567</span>
            </div>
            <Button variant="default" className="shadow-button">
              Get Quote
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <Card className="md:hidden mt-2 p-4 shadow-card">
            <nav className="flex flex-col space-y-4">
              <a href="#" className="text-foreground hover:text-primary transition-colors">Home</a>
              <a href="#quotes" className="text-foreground hover:text-primary transition-colors">Get Quote</a>
              <a href="#products" className="text-foreground hover:text-primary transition-colors">Products</a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors">Contact</a>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground pt-2 border-t">
                <Phone className="h-4 w-4" />
                <span>0800 123 4567</span>
              </div>
              <Button variant="default" className="w-full shadow-button">
                Get Quote
              </Button>
            </nav>
          </Card>
        )}
      </div>
    </header>
  );
};

export default Header;