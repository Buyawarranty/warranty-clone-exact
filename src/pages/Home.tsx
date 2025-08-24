import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import VehicleQuoteFlow from "@/components/VehicleQuoteFlow";
import FeaturesSection from "@/components/FeaturesSection";
import ProductsSection from "@/components/ProductsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <VehicleQuoteFlow />
        <FeaturesSection />
        <ProductsSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;