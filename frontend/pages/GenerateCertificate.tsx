import React, { useState } from 'react';
import { certificateApi } from '../services/api';

export default function CertificateGenerator() {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    medal: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [certificate, setCertificate] = useState<any>(null); // holds Mongo response

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCertificate(null);
    setLoading(true);
    try {
      const apiResponse = await certificateApi.generate(formData);
      if (!apiResponse.success) throw new Error(apiResponse.message || 'Backend error');
      // Normalize previewUrl (backend already sends absolute) fallback if missing
      const previewUrl = apiResponse.data.previewUrl || `http://localhost:5000${apiResponse.data.filePath}`;
      setCertificate({ ...apiResponse.data, previewUrl });
    } catch (err: any) {
      setError(err.message || 'Failed to generate certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!certificate) return;
    const url = certificate.previewUrl || `http://localhost:5000${certificate.filePath}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${certificate.serial}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!certificate) return;
    const url = certificate.previewUrl || `http://localhost:5000${certificate.filePath}`;
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => printWindow.print();
    }
  };

  const handleNewCertificate = () => {
    setFormData({ name: '', dateOfBirth: '', medal: '', category: '' });
    setError('');
    setCertificate(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Certificate Generator
          </h1>
        </div>

        {!certificate ? (
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Certificate Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="Enter name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Medal</label>
                <select
                  value={formData.medal}
                  onChange={e => setFormData({ ...formData, medal: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                >
                  <option value="">Select Medal</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Bronze">Bronze</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="Enter category (e.g., Junior Male, Senior Female)"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Certificate'}
              </button>
            </form>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                ❌ {error}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">Certificate Generated!</h2>
                  <p className="text-gray-600 mt-1">
                    Serial Number: <span className="font-mono font-semibold">{certificate.serial}</span>
                  </p>
                </div>
                <button
                  onClick={handleNewCertificate}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  ← Back to Form
                </button>
              </div>
              <div className="border-4 border-gray-200 rounded-lg p-4 bg-gray-50 mb-6">
                {/* Display certificate: You can adjust img src if you generate an image on backend */}
                {certificate.previewUrl ? (
                  <img
                    src={certificate.previewUrl}
                    alt="Generated Certificate"
                    className="w-full h-auto rounded shadow-lg"
                  />
                ) : (
                  <div className="text-center text-gray-500 italic">[Certificate Preview Here]</div>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Download Certificate
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Print Certificate
                </button>
                <button
                  onClick={handleNewCertificate}
                  className="px-6 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
                >
                  New Certificate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
