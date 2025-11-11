import React, { useEffect, useState } from 'react';
import { BACKEND_URL } from '../../services/api';

const HealthBadge: React.FC = () => {
  const [status, setStatus] = useState<'ok' | 'fail' | 'loading'>('loading');
  const [message, setMessage] = useState<string>('');
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  useEffect(() => {
    let mounted = true;
    
    const ping = async () => {
      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const res = await fetch(`${BACKEND_URL}/health`, { 
          cache: 'no-store',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const json = await res.json();
        if (!mounted) return;
        
        if (res.ok && json?.status === 'OK') {
          setStatus('ok');
          setMessage('API healthy');
          setConsecutiveFailures(0); // Reset failure count on success
        } else {
          setConsecutiveFailures(prev => prev + 1);
          // Only mark as failed after 2 consecutive failures to avoid false positives
          if (consecutiveFailures >= 1) {
            setStatus('fail');
            setMessage(json?.message || 'Unhealthy');
          }
        }
      } catch (e: any) {
        if (!mounted) return;
        
        setConsecutiveFailures(prev => prev + 1);
        
        // Only mark as failed after 2 consecutive failures
        if (consecutiveFailures >= 1) {
          setStatus('fail');
          if (e.name === 'AbortError') {
            setMessage('Timeout');
          } else {
            setMessage(e?.message || 'No response');
          }
        }
      }
    };
    
    ping();
    const id = setInterval(ping, 10000); // Check every 10 seconds
    return () => { mounted = false; clearInterval(id); };
  }, [consecutiveFailures]);

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
