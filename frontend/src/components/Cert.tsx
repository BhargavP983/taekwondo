import { useState, useEffect, FormEvent } from 'react';
import { certificateApi, API_BASE_URL } from '../../../services/api';

function CertificateForm() {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    grade: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [backendStatus, setBackendStatus] = useState<string>('Checking...');

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      await certificateApi.healthCheck();
      setBackendStatus('✅ Connected');
    } catch (error) {
      setBackendStatus('❌ Backend not running');
      setError('Cannot connect to backend. Please start the backend server.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    console.log('🚀 Form submitted with data:', formData);

    try {
      const response = await certificateApi.generate(formData);
      console.log('✅ Certificate generated:', response);
      setResult(response.data);
      setFormData({ name: '', date: '', grade: '' });
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Failed to generate certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Certificate Generator</h1>
      <p>Backend: {backendStatus}</p>
      <p style={{ fontSize: '12px', color: '#666' }}>API: {API_BASE_URL}</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label>Date:</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div>
          <label>Grade:</label>
          <select
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            required
          >
            <option value="">Select Grade</option>
            <option value="A+">A+</option>
            <option value="A">A</option>
            <option value="B+">B+</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>

        <button type="submit" disabled={loading || backendStatus !== '✅ Connected'}>
          {loading ? 'Generating...' : 'Generate Certificate'}
        </button>
        <span> </span>
        <button onClick={async () => {
          try {
            const result = await certificateApi.generate({
              name: 'Test User',
              date: '2025-11-04',
              grade: 'A+'
            });
            alert('Success! Serial: ' + result.data.serialNumber);
          } catch (error: any) {
            alert('Error: ' + error.message);
          }
        }}>
          Quick Test
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginTop: '20px' }}>
          ❌ {error}
        </div>
      )}

      {result && (
        <div style={{ color: 'green', marginTop: '20px' }}>
          <p>✅ Certificate Generated!</p>
          <p>Serial: {result.serialNumber}</p>
          <a href={result.downloadUrl} target="_blank" rel="noopener noreferrer">
            View Certificate
          </a>
        </div>
      )}
    </div>
  );
}

export default CertificateForm;

