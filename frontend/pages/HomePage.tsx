import React from 'react';
import { HeroCarousel } from '../src/components/HeroCarousel';
import { StatsOverlay } from '../src/components/StatsOverlay';
import { VisionMissionValues } from '../src/components/VisionMissionValues';
import { PresidentProfile } from '../src/components/PresidentProfile';
import { EventsUpdates } from '../src/components/EventsUpdates';
import { ResultsAchievements } from '../src/components/ResultsAchievements';

export const HomePage: React.FC = () => {
  return (
    <>
      <HeroCarousel />
      <StatsOverlay />
      <VisionMissionValues />
      <PresidentProfile
        name="T Harsha Vardhana Prasad"
        role="President, A.P. Taekwondo Association"
        affiliation1="Vice President, Taekwondo Federation of India"
        image="img/Shekhar.jpg"
        email="support@aptaekwondo.org"
        phone="+918341810905"
        facebook="https://www.facebook.com/yourpresidentprofile"
        // twitter="https://twitter.com/..."
        // linkedin="https://linkedin.com/in/..."
      />
      <EventsUpdates />
      <ResultsAchievements />
    </>
  );
};