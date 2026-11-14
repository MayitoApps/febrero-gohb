import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import RitualSection from "@/components/RitualSection";
import HotelSelector from "@/components/HotelSelector";
import FaqAndFooter from "@/components/FaqAndFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-tinta-archivo text-papel-algodon">
      <Navbar variant="home" />
      <main className="flex-1">
        <HeroSection />
        <RitualSection />
        <HotelSelector />
      </main>
      <FaqAndFooter />
    </div>
  );
}

