import { useEffect, useState } from 'react';
import CertificateForm from '../components/CertificateForm';
import { certificateApi } from '../services/api';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...');

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      const response = await certificateApi.healthCheck();
      setBackendStatus('✅ Connected');
    } catch (error) {
      setBackendStatus('❌ Backend not running');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Certificate Generator
          </h1>
          <p className="text-gray-600">Backend Status: {backendStatus}</p>
        </div>
        
        <CertificateForm />
      </div>
    </div>
  );
}

export default App;
