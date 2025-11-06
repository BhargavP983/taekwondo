import { useState, FormEvent, ChangeEvent } from 'react';

interface CadetFormData {
  gender: 'Boy' | 'Girl' | '';
  weightCategory: string;
  name: string;
  dateOfBirth: string;
  age: string;
  weight: string;
  parentGuardianName: string;
  state: string;
  presentBeltGrade: string;
  tfiIdCardNo: string;
  academicQualification: string;
  schoolName: string;
}

function CadetEntryForm() {
  const [formData, setFormData] = useState<CadetFormData>({
    gender: '',
    weightCategory: '',
    name: '',
    dateOfBirth: '',
    age: '',
    weight: '',
    parentGuardianName: '',
    state: '',
    presentBeltGrade: '',
    tfiIdCardNo: '',
    academicQualification: '',
    schoolName: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  // Calculate age automatically
  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'dateOfBirth') {
        updated.age = calculateAge(value);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowSuccess(false);

    try {
      const response = await fetch('http://localhost:5000/api/cadets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
 
      if (result.success) {
        setApplicationNumber(result.data.applicationNumber);
        setDownloadUrl(result.data.downloadUrl);
        setShowSuccess(true);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit form');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `Application_Form_${applicationNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNewEntry = () => {
    setFormData({
      gender: '',
      weightCategory: '',
      name: '',
      dateOfBirth: '',
      age: '',
      weight: '',
      parentGuardianName: '',
      state: '',
      presentBeltGrade: '',
      tfiIdCardNo: '',
      academicQualification: '',
      schoolName: ''
    });
    setShowSuccess(false);
    setError('');
    setApplicationNumber('');
    setDownloadUrl('');
  };

  if (showSuccess) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-600 text-white text-center py-6">
            <div className="text-5xl mb-3">✅</div>
            <h1 className="text-3xl font-bold">Registration Successful!</h1>
            <p className="text-green-100 text-lg mt-2">Your application has been submitted</p>
          </div>

          <div className="p-8">
            {/* Application Number */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6 text-center">
              <p className="text-gray-600 mb-2">Your Application Number</p>
              <p className="text-3xl font-bold text-blue-600">{applicationNumber}</p>
              <p className="text-sm text-gray-500 mt-2">Please save this number for future reference</p>
            </div>

            {/* Application Form Preview */}
            <div className="border-4 border-gray-200 rounded-lg p-4 bg-gray-50 mb-6">
              <img
                src={downloadUrl}
                alt="Application Form"
                className="w-full h-auto rounded shadow-lg"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={handleDownload}
                className="bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Application Form
              </button>

              <button
                onClick={() => window.print()}
                className="bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Application Form
              </button>
            </div>

            <button
              onClick={handleNewEntry}
              className="w-full mt-4 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              Submit Another Entry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center py-6">
          <h1 className="text-3xl font-bold">14th AP STATE SENIOR POOMSAE</h1>
          <h2 className="text-2xl font-bold mt-1">TAEKWONDO CHAMPIONSHIPS - 2025</h2>
          <p className="text-blue-100 mt-2">PROMOTER: ANDHRA PRADESH TAEKWONDO ASSOCIATION</p>
          <h1 className="text-3xl font-bold">CADET</h1>
          <p className="text-xl font-semibold mt-3 text-yellow-300">INDIVIDUAL ENTRY FORM</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Gender and Weight Category */}
          <div className="grid md:grid-cols-3 gap-4 bg-blue-50 p-4 rounded">
            <div>
              <label className="block text-sm font-medium mb-2">Gender *</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="Boy"
                    checked={formData.gender === 'Boy'}
                    onChange={handleInputChange}
                    required
                    className="mr-2"
                  />
                  Boy
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="Girl"
                    checked={formData.gender === 'Girl'}
                    onChange={handleInputChange}
                    required
                    className="mr-2"
                  />
                  Girl
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Weight Category *</label>
              <input
                type="text"
                name="weightCategory"
                value={formData.weightCategory}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g., 45-50 kg"
                required
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Name (In Capital Letters) *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
              placeholder="ENTER NAME IN CAPITALS"
              required
            />
          </div>

          {/* DOB, Age, Weight */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Date Of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Age</label>
              <input
                type="text"
                name="age"
                value={formData.age}
                readOnly
                className="w-full px-3 py-2 border rounded bg-gray-100"
                placeholder="Auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Weight (kg) *</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="kg"
                step="0.1"
                required
              />
            </div>
          </div>

          {/* Parent/Guardian and State */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Parent / Guardian Name *</label>
              <input
                type="text"
                name="parentGuardianName"
                value={formData.parentGuardianName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">State *</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="">Select State</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
                <option value="Telangana">Telangana</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                {/* Add more states */}
              </select>
            </div>
          </div>

          {/* Belt Grade and TFI ID */}
          <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
            <div>
              <label className="block text-sm font-medium mb-2">Present Belt Grade </label>
              <select
                name="presentBeltGrade"
                value={formData.presentBeltGrade}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                
              >
                <option value="">Select Belt Grade</option>
                <option value="White">White Belt</option>
                <option value="Yellow">Yellow Belt</option>
                <option value="Green">Green Belt</option>
                <option value="Blue">Blue Belt</option>
                <option value="Red">Red Belt</option>
                <option value="Black">Black Belt</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">TFI Id Card No. </label>
              <input
                type="text"
                name="tfiIdCardNo"
                value={formData.tfiIdCardNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter TFI ID"
                
              />
            </div>
          </div>

          {/* Academic Qualification and School */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Academic Qualification </label>
              <input
                type="text"
                name="academicQualification"
                value={formData.academicQualification}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g., Class 10"
                
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Name Of The School </label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                
              />
            </div>
          </div>

          {/* Declaration */}
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-bold text-center mb-3">DECLARATION</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              I, the undersigned do hereby solemnly affirm, declare and confirm for myself, my heirs,
              executors & administrators that I indemnify the Promoters/ Organizers / Sponsors &
              its Members, Officials, Participants etc., holding myself personally responsible for all
              damages, injuries of accidents, claims, demands etc., waiving all prerogative rights,
              whatsoever related to the above set forth event.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              ❌ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Entry Form'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CadetEntryForm;
