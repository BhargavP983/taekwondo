import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroCarousel } from './components/HeroCarousel';
import { StatsOverlay } from './components/StatsOverlay';
import { VisionMissionValues } from './components/VisionMissionValues';
import { PresidentProfile } from './components/PresidentProfile';
import { ObjectivesWorldTaekwondo } from './components/ObjectivesWorldTaekwondo';
import { EventsUpdates } from './components/EventsUpdates';
import { ResultsAchievements } from './components/ResultsAchievements';
import { Footer } from './components/Footer';
import { ScrollToTopButton } from './components/ScrollToTopButton';

function App() {
  const [isSticky, setIsSticky] = useState(false);
  // Removed activeSection logic as new header structure does not directly use it for active links
  // but smooth scrolling will still work.

  useEffect(() => {
    const handleScroll = () => {
      // Sticky header logic
      if (window.scrollY > 25) { // Adjusted based on original HTML's scroll threshold
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header isSticky={isSticky} />
      <main className="flex-grow pt-[100px] lg:pt-[130px]"> {/* Adjusted padding for fixed header */}
        <HeroCarousel />
        <StatsOverlay />
        <VisionMissionValues />
        <PresidentProfile />
        <ObjectivesWorldTaekwondo />
        <EventsUpdates />
        <ResultsAchievements />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}

export default App;