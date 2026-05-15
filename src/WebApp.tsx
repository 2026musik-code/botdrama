import React, { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { Play } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function TelegramWebApp() {
  const [searchParams] = useSearchParams();
  const provider = searchParams.get('provider') || '';
  const vid = searchParams.get('vid') || '';
  const [streamData, setStreamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Notify telegram app is ready
    WebApp.ready();
    WebApp.expand();

    if (provider && vid) {
      fetchStream();
    } else {
      setLoading(false);
      setError('Parameter video tidak valid');
    }
  }, [provider, vid]);

  const fetchStream = async () => {
    try {
      const res = await fetch(`/api/stream/${provider}/${vid}`);
      const data = await res.json();
      if (data.success && data.data) {
        setStreamData(data.data);
      } else {
        setError(data.error || 'Video tidak ditemukan');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat video');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-pulse">Memuat Video...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="text-red-500 mb-2">⚠️ Error</div>
        <p>{error}</p>
        <button onClick={() => WebApp.close()} className="mt-4 px-4 py-2 bg-indigo-600 rounded">
          Tutup
        </button>
      </div>
    );
  }

  const url = streamData?.url || streamData?.videoUrl || streamData?.streams?.[0]?.url || streamData?.link || streamData?.file || streamData?.source;

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans flex flex-col">
      <div className="mb-4">
         <h1 className="text-lg font-bold">Nonton Video</h1>
      </div>
      
      {url ? (
        <div className="flex-1 flex flex-col">
          <div className="relative w-full pb-[56.25%] bg-zinc-900 rounded-xl overflow-hidden mb-4">
             <video 
               src={url} 
               controls 
               autoPlay
               className="absolute top-0 left-0 w-full h-full object-contain"
             />
          </div>
          <div className="bg-zinc-900 p-4 rounded-xl mb-4">
             <p className="text-sm text-zinc-400 mb-1">Provider</p>
             <p className="font-medium text-lg capitalize">{provider}</p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-zinc-900 rounded-xl text-zinc-400">
           Url stream tidak ditemukan. {JSON.stringify(streamData)}
        </div>
      )}
      
      <button 
        onClick={() => WebApp.close()} 
        className="w-full mt-auto py-3 bg-zinc-800 hover:bg-zinc-700 transition-colors font-medium rounded-xl text-center"
      >
        Tutup
      </button>
    </div>
  );
}
