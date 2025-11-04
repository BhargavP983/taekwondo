import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { ScrollToTopButton } from './components/ScrollToTopButton';

function App() {
  return (
    <Router>
      <MainLayout />
      <ScrollToTopButton />
    </Router>
  );
}

export default App;