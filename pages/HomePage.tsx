import React from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { StatsOverlay } from '../components/StatsOverlay';
import { VisionMissionValues } from '../components/VisionMissionValues';
import { PresidentProfile } from '../components/PresidentProfile';
import { ObjectivesWorldTaekwondo } from '../components/ObjectivesWorldTaekwondo';
import { EventsUpdates } from '../components/EventsUpdates';
import { ResultsAchievements } from '../components/ResultsAchievements';

export const HomePage: React.FC = () => {
  return (
    <div>
      <HeroCarousel />
      <StatsOverlay />
      <VisionMissionValues />
      <PresidentProfile />
      <ObjectivesWorldTaekwondo />
      <EventsUpdates />
      <ResultsAchievements />
    </div>
  );
};