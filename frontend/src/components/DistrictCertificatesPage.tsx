import CertificateList from '../components/Certificatelist';
import { certificateApi } from '../../services/api';

export default function DistrictCertificatesPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <CertificateList
          fetchCertificates={certificateApi.getAll}
          title="All Generated Certificates"
        />
      </div>
    </div>
  );
}
