import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { HomePage } from '../pages/HomePage';
import { AboutTaekwondo } from '../pages/AboutTaekwondo';
import { ExecutiveMembers } from '../pages/ExecutiveMembers';
import { GalleryPage } from '../pages/GalleryPage';
import { ContactPage } from '../pages/Contact'; // Renamed to avoid clash with a potential Contact component
import { EventsUpdates } from '../components/EventsUpdates'; // Adding EventsUpdates component
import { LoginPage } from '../pages/LoginPage'; // Default import of LoginPage
import GenerateCertificate from '../components/CertificateForm';
import PoomsaeEntryForm from '../components/PoomsaeEntryForm';
import CadetEntryForm from '../pages/CadetApplicationForm';

export const MainLayout: React.FC = () => {

  return (
    <>
      <Header isSticky={false} />
      <main className="pt-16"> {/* Adjust padding top to account for fixed header */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutTaekwondo />} />
          <Route path="/executive-members" element={<ExecutiveMembers />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/events" element={<EventsUpdates />} /> {/* Route for EventsUpdates */}
          <Route path="/login" element={<LoginPage />} /> {/* Route for Login */}
          <Route path="/registration/cadet" element={<CadetEntryForm />} />
          <Route path="/registration/poomsae" element={<PoomsaeEntryForm />} />
          <Route path="/generate-certificate" element={<GenerateCertificate />} /> {/* Route for GenerateCertificate */}
          {/* <Route path="/cadet-application" element={<CadetApplicationForm />} /> {/* Route for Cadet Application Form */}
          {/* <Route path="/poomsae-application" element={<PoomsaeEntryForm />} /> Route for PoomsaeEntryForm */}
          {/* Add more routes here as needed */}
        </Routes>
      </main>
      <Footer />
    </>
  );
};