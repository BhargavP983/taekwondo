import React, { useEffect, useState } from 'react';

export interface Certificate {
    _id: string;
    name: string;
    serial: string;
    grade: string;
    date: string;
    filePath: string;
    // Add more fields as in your backend if needed
}

interface CertificateListProps {
    fetchCertificates: () => Promise<{ success: boolean; data: Certificate[] }>;
    title?: string;
    filterFn?: (cert: Certificate) => boolean;
}

const CertificateList: React.FC<CertificateListProps> = ({ fetchCertificates, title, filterFn }) => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            const response = await fetchCertificates();
            console.log('CERTIFICATE API RESPONSE:', response); // Add this line
            if (response.success) {
                setCertificates(response.data);
            }
            setLoading(false);
        };
        fetchAll();
    }, [fetchCertificates]);

    const shownCertificates = filterFn ? certificates.filter(filterFn) : certificates;

    if (loading)
        return <div className="p-8 text-center">Loading certificates...</div>;

    return (
        <div className="w-full py-8">
            <h2 className="text-2xl font-bold mb-6">{title ?? 'Certificates'}</h2>
            {shownCertificates.length === 0 ? (
                <div className="text-gray-500 italic text-center">No certificates available.</div>
            ) : (
                <div className="grid gap-6">
                    {shownCertificates.map(cert => (
                        <div key={cert._id} className="bg-white p-4 rounded shadow flex items-center gap-8">
                            <img
                                src={`http://localhost:5000${cert.filePath}`}
                                alt={cert.name}
                                className="w-40 h-auto rounded border"
                            />
                            <div>
                                <div className="font-bold text-lg">{cert.name}</div>
                                <div className="text-gray-600">
                                    Serial: <span className="font-mono">{cert.serial}</span>
                                </div>
                                <div>Date: {new Date(cert.date).toLocaleDateString()}</div>
                                <div>Grade: {cert.grade}</div>
                                <button
                                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
                                    onClick={() => window.open(`http://localhost:5000${cert.filePath}`, '_blank')}
                                >
                                    View/Download
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CertificateList;
