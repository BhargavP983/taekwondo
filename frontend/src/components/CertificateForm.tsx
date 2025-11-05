import { useState, FormEvent } from 'react';
import { certificateApi } from '../../services/api';

function CertificateForm() {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    grade: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [certificateUrl, setCertificateUrl] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCertificateUrl(''); // Clear previous certificate

    console.log('🚀 Form submitted with data:', formData);

    try {
      const response = await certificateApi.generate(formData);
      console.log('✅ Certificate generated:', response);

      // Set the certificate URL to display
      setCertificateUrl(response.data.downloadUrl);
      setSerialNumber(response.data.serialNumber);

      // Clear form
      setFormData({ name: '', date: '', grade: '' });
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Failed to generate certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (certificateUrl) {
      const link = document.createElement('a');
      link.href = certificateUrl;
      link.download = `certificate-${serialNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (certificateUrl) {
      const printWindow = window.open(certificateUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  const handleNewCertificate = () => {
    setCertificateUrl('');
    setSerialNumber('');
    setError('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Certificate Generator</h1>

      {!certificateUrl ? (
        // ========== FORM VIEW ==========
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Certificate Details</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                // value="dummy name"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="Enter name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                // value="2025-11-04"
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Grade</label>
              <select
                value={formData.grade}
                // value="A+"
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate Certificate'
              )}
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
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              ❌ {error}
            </div>
          )}
        </div>
      ) : (
        // ========== CERTIFICATE PREVIEW VIEW ==========
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold">Certificate Generated!</h2>
                <p className="text-gray-600 mt-1">Serial Number: <span className="font-mono font-semibold">{serialNumber}</span></p>
              </div>
              <button
                onClick={handleNewCertificate}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                ← Back to Form
              </button>
            </div>

            {/* Certificate Display */}
            <div className="border-4 border-gray-200 rounded-lg p-4 bg-gray-50 mb-6">
              <img
                src={certificateUrl}
                alt="Generated Certificate"
                className="w-full h-auto rounded shadow-lg"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleDownload}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Certificate
              </button>

              <button
                onClick={handlePrint}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Certificate
              </button>

              <button
                onClick={handleNewCertificate}
                className="px-6 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificateForm;
