import React, { useEffect, useState } from 'react';

const TestPage: React.FC = () => {
  const [results, setResults] = useState<any>({});

  useEffect(() => {
    testEndpoints();
  }, []);

  const testEndpoints = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const tests = {
      health: await fetch('http://localhost:5000/health'),
      users: await fetch('http://localhost:5000/api/auth/users', { headers }),
      cadets: await fetch('http://localhost:5000/api/cadets', { headers }),
      poomsae: await fetch('http://localhost:5000/api/poomsae', { headers }),
      dashboard: await fetch('http://localhost:5000/api/dashboard/stats', { headers })
    };

    const results: any = {};
    for (const [key, promise] of Object.entries(tests)) {
      try {
        const response = await promise;
        results[key] = {
          status: response.status,
          ok: response.ok,
          data: await response.json()
        };
      } catch (error: any) {
        results[key] = { error: error.message };
      }
    }

    setResults(results);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Results</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(results, null, 2)}
      </pre>
      <button
        onClick={testEndpoints}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Re-test
      </button>
    </div>
  );
};

export default TestPage;
