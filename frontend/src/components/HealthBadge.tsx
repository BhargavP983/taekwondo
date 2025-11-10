import React, { useEffect, useState } from 'react';
import { BACKEND_URL } from '../../services/api';

const HealthBadge: React.FC = () => {
  const [status, setStatus] = useState<'ok' | 'fail' | 'loading'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    const ping = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/health`, { cache: 'no-store' });
        const json = await res.json();
        if (!mounted) return;
        if (res.ok && json?.status === 'OK') {
          setStatus('ok');
          setMessage('API healthy');
        } else {
          setStatus('fail');
          setMessage(json?.message || 'Unhealthy');
        }
      } catch (e: any) {
        if (!mounted) return;
        setStatus('fail');
        setMessage(e?.message || 'No response');
      }
    };
    ping();
    const id = setInterval(ping, 15000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const color = status === 'ok' ? 'bg-green-100 text-green-700 border-green-300'
    : status === 'fail' ? 'bg-red-100 text-red-700 border-red-300'
    : 'bg-gray-100 text-gray-700 border-gray-300';

  return (
    <span className={`inline-flex items-center px-3 py-1 border rounded-full text-sm ${color}`} title={message}>
      <span className={`mr-2 h-2 w-2 rounded-full ${status === 'ok' ? 'bg-green-500' : status === 'fail' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
      {status === 'loading' ? 'Checking API…' : message}
    </span>
  );
};

export default HealthBadge;
