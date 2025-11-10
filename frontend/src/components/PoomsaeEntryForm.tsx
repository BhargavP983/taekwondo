import { useState, FormEvent, ChangeEvent } from 'react';
import Toast from './Toast';
import { poomsaeAPI } from '../../services/api';

interface PoomsaeFormData {
  division: string;
  category: string;
  gender: string;
  name: string;
  stateOrg: string;
  dateOfBirth: string;
  age: string;
  weight: string;
  parentGuardianName: string;
  mobileNo: string;
  currentBeltGrade: string;
  tfiIdNo: string;
  danCertificateNo: string;
  academicQualification: string;
  nameOfCollege: string;
  nameOfBoardUniversity: string;
  district: string;
}

function PoomsaeEntryForm() {
  const [formData, setFormData] = useState<PoomsaeFormData>({
    division: '',
    category: '',
    gender: '',
    name: '',
    stateOrg: '',
    dateOfBirth: '',
    age: '',
    weight: '',
    parentGuardianName: '',
    mobileNo: '',
    currentBeltGrade: '',
    tfiIdNo: '',
    danCertificateNo: '',
    academicQualification: '',
    nameOfCollege: '',
    nameOfBoardUniversity: '',
    district: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tfiIdError, setTfiIdError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  // Dummy data for quick testing
  const fillDummyData = () => {
    const dummyData: PoomsaeFormData = {
      division: 'Over 30',
      category: 'Pair',
      gender: 'Male',
      name: 'ARJUN PATEL',
      stateOrg: 'Andhra Pradesh',
      dateOfBirth: '1995-08-20',
      age: '30',
      weight: '75',
      parentGuardianName: 'Suresh Patel',
      mobileNo: '9876543210',
      currentBeltGrade: '4th Dan',
      tfiIdNo: 'TFI-AP-54321',
      danCertificateNo: 'DAN-2023-12345',
      academicQualification: 'B.Tech',
      nameOfCollege: 'VIT University',
      nameOfBoardUniversity: 'VIT University',
      district: 'Krishna'
    };
    
    setFormData(dummyData);
    console.log('✅ Poomsae form filled with dummy data:', dummyData);
  };

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

    if (name === 'tfiIdNo' && tfiIdError) {
      setTfiIdError('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowSuccess(false);

    console.log('📤 Submitting Poomsae form data:', formData);

    try {
      const result = await poomsaeAPI.create({
        division: formData.division,
        category: formData.category,
        gender: formData.gender as any,
        name: formData.name,
        stateOrg: formData.stateOrg,
        district: formData.district,
        dateOfBirth: formData.dateOfBirth,
        age: formData.age,
        weight: formData.weight,
        parentGuardianName: formData.parentGuardianName,
        mobileNo: formData.mobileNo,
        currentBeltGrade: formData.currentBeltGrade,
        tfiIdNo: formData.tfiIdNo,
        danCertificateNo: formData.danCertificateNo,
        academicQualification: formData.academicQualification,
        nameOfCollege: formData.nameOfCollege,
        nameOfBoardUniversity: formData.nameOfBoardUniversity
      } as any);

      console.log('📥 Response:', result);

      if (result.success) {
        setApplicationNumber(result.data.applicationNumber || result.data.entryId);
        setDownloadUrl(result.data.downloadUrl || '');
        setShowSuccess(true);
        console.log('✅ Success! Application Number:', result.data.applicationNumber || result.data.entryId);
      } else {
        const msg = result.message || 'Registration failed';
        setError(msg);
        if (/TFI ID.*exists/i.test(msg)) {
          setTfiIdError('This TFI ID is already registered. Leave it blank if you don\'t have one or enter a different ID.');
          setToast({ type: 'error', message: 'Duplicate TFI ID. Please leave it blank or use a different ID.' });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit form');
      if (/TFI ID.*exists/i.test(err.message || '')) {
        setTfiIdError('This TFI ID is already registered. Leave it blank if you don\'t have one or enter a different ID.');
        setToast({ type: 'error', message: 'Duplicate TFI ID. Please leave it blank or use a different ID.' });
      }
      console.error('❌ Exception:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `Poomsae_Form_${applicationNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNewEntry = () => {
    setFormData({
      division: '',
      category: '',
      gender: '',
      name: '',
      stateOrg: '',
      dateOfBirth: '',
      age: '',
      weight: '',
      parentGuardianName: '',
      mobileNo: '',
      currentBeltGrade: '',
      tfiIdNo: '',
      danCertificateNo: '',
      academicQualification: '',
      nameOfCollege: '',
      nameOfBoardUniversity: '',
      district: '',
    });
    setShowSuccess(false);
    setError('');
  };

  if (showSuccess) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-green-600 text-white text-center py-6">
            <div className="text-5xl mb-3">✅</div>
            <h1 className="text-3xl font-bold">Registration Successful!</h1>
            <p className="text-green-100 text-lg mt-2">Poomsae Entry Submitted</p>
          </div>

          <div className="p-8">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6 text-center">
              <p className="text-gray-600 mb-2">Your Application Number</p>
              <p className="text-3xl font-bold text-blue-600">{applicationNumber}</p>
            </div>

            <div className="border-4 border-gray-200 rounded-lg p-4 bg-gray-50 mb-6">
              <p className="text-center text-gray-600 mb-3 font-semibold">Generated Entry Form:</p>
              <img src={downloadUrl} alt="Poomsae Form" className="w-full h-auto rounded shadow-lg" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button onClick={handleDownload} className="bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition">
                📥 Download Form
              </button>
              <button onClick={() => window.print()} className="bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition">
                🖨️ Print Form
              </button>
            </div>

            <button onClick={handleNewEntry} className="w-full mt-4 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition">
              Submit Another Entry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center py-6">
          <h1 className="text-3xl font-bold">14th AP STATE SENIOR POOMSAE</h1>
          <h2 className="text-2xl font-bold mt-1">TAEKWONDO CHAMPIONSHIPS - 2025</h2>
          <p className="text-blue-100 mt-2">PROMOTER: ANDHRA PRADESH TAEKWONDO ASSOCIATION</p>
          <h1 className="text-3xl font-bold">POOMSAE</h1>
          <p className="text-xl font-semibold mt-3 text-yellow-300">INDIVIDUAL ENTRY FORM</p>
        </div>

        {/* Quick Test Button
        <div className="bg-yellow-50 border-b-2 border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">⚡ Development Mode</span>
            <button type="button" onClick={fillDummyData} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition">
              ⚡ Quick Test Fill
            </button>
          </div>
        </div> */}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Division, Category, Gender */}
          <div className="grid md:grid-cols-3 gap-4 bg-blue-50 p-4 rounded">
            <div>
              <label className="block text-sm font-medium mb-2">Division *</label>
              <select name="division" value={formData.division} onChange={handleInputChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
                <option value="">Select Division</option>
                <option value="Under 30">Under 30</option>
                <option value="Under 40">Under 40</option>
                <option value="Under 50">Under 50</option>
                <option value="Under 60">Under 60</option>
                <option value="Under 65">Under 65</option>
                <option value="Over 65">Over 65</option>
                <option value="Over 30">Over 30</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
                <option value="">Select Category</option>
                <option value="Individual">Individual</option>
                <option value="Pair">Pair</option>
                <option value="Group">Group</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Name and State/Orgn */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase" placeholder="ENTER NAME IN CAPITALS" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">State / Orgn *</label>
              <input type="text" name="stateOrg" value={formData.stateOrg} onChange={handleInputChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">District *</label>
              <input type="text" name="district" value={formData.district} onChange={handleInputChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>
          </div>

          {/* DOB, Age, Weight */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Date of Birth *</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Age</label>
              <input type="text" name="age" value={formData.age} readOnly className="w-full px-3 py-2 border rounded bg-gray-100" placeholder="Auto" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Weight (kg) *</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" step="0.1" required />
            </div>
          </div>

          {/* Parent/Guardian and Mobile */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Parent / Guardian Name *</label>
              <input type="text" name="parentGuardianName" value={formData.parentGuardianName} onChange={handleInputChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mobile No. of Participant *</label>
              <input type="tel" name="mobileNo" value={formData.mobileNo} onChange={handleInputChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" pattern="[0-9]{10}" placeholder="10-digit mobile number" required />
            </div>
          </div>

          {/* Belt Grade, TFI ID, Dan Certificate */}
          <div className="grid md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded">
            <div>
              <label className="block text-sm font-medium mb-2">Current Belt Grade </label>
              <input type="text" name="currentBeltGrade" value={formData.currentBeltGrade} onChange={handleInputChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g., 4th Dan" />
              {/* <p className="mt-1 text-xs text-gray-500">Optional. Provide your current belt or Dan rank if applicable.</p> */}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">TFI ID No. </label>
              <input type="text" name="tfiIdNo" value={formData.tfiIdNo} onChange={handleInputChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              {/* <p className="mt-1 text-xs text-gray-500">Optional. If provided, it must be unique. Leave blank if you don&apos;t have one.</p> */}
              {tfiIdError && (
                <p className="mt-1 text-sm text-red-600">{tfiIdError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Dan Certificate No. </label>
              <input type="text" name="danCertificateNo" value={formData.danCertificateNo} onChange={handleInputChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              {/* <p className="mt-1 text-xs text-gray-500">Optional. Provide if you have one.</p> */}
            </div>
          </div>

          {/* Academic Qualification, College, Board/University */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Academic Qualification </label>
              <input type="text" name="academicQualification" value={formData.academicQualification} onChange={handleInputChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g., B.Tech" />
              {/* <p className="mt-1 text-xs text-gray-500">Optional.</p> */}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Name of College </label>
              <input type="text" name="nameOfCollege" value={formData.nameOfCollege} onChange={handleInputChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              {/* <p className="mt-1 text-xs text-gray-500">Optional.</p> */}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Name of Board / University </label>
              <input type="text" name="nameOfBoardUniversity" value={formData.nameOfBoardUniversity} onChange={handleInputChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              {/* <p className="mt-1 text-xs text-gray-500">Optional.</p> */}
            </div>
          </div>

          {/* Declaration */}
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-bold text-center mb-3">DECLARATION</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              I, the undersigned do hereby solemnly affirm, declare and confirm for myself, my heirs, executors & 
              administrators that I indemnify the Promoters/ Organisers / Sponsors & its Members, Officials, 
              Participants etc., holding myself personally responsible for all damages, injuries of accidents, claims, 
              demands etc., waiving all prerogative rights, whatsoever related to the above set forth event.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              ❌ {error}
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? '⏳ Submitting...' : 'Submit Entry Form'}
          </button>
        </form>
      </div>
    </div>
    {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        duration={5000}
        onClose={() => setToast(null)}
      />
    )}
    </>
  );
}

export default PoomsaeEntryForm;
