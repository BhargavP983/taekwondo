import React from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { StatsOverlay } from '../components/StatsOverlay';
import { VisionMissionValues } from '../components/VisionMissionValues';
import { PresidentProfile } from '../components/PresidentProfile';
import { EventsUpdates } from '../components/EventsUpdates';
import { ResultsAchievements } from '../components/ResultsAchievements';

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