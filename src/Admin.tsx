import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Users, Key, Trash2, Save, LogOut, Search, Activity, Edit2, RefreshCw, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<any>(null);
  
  // Forms
  const [popupText, setPopupText] = useState('');
  const [qrImage, setQrImage] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [telegramBots, setTelegramBots] = useState<{name: string, token: string}[]>([]);
  const [botImageUrl, setBotImageUrl] = useState('');
  const [botWelcomeText, setBotWelcomeText] = useState('');
  const [botAppUrl, setBotAppUrl] = useState('');
  const [botWaUrl, setBotWaUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'web' | 'bot'>('web');
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  
  const navigate = useNavigate();

  const loadConfig = async (authPass: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/config', {
        headers: { 'x-admin-password': authPass }
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setPopupText(data.popupText || '');
        
        if (data.qrImage && data.qrImage.length > 1000000) {
          setQrImage('');
          alert("Sistem mendeteksi gambar QR sebelumnya terlalu besar (bisa menyebabkan lag/crash). Silakan upload ulang gambar berukuran kecil.");
        } else {
          setQrImage(data.qrImage || '');
        }

        setApiKey(data.apiKey || '');
        setTelegramBots(data.telegramBots || []);

        if (data.botImageUrl && data.botImageUrl.length > 1000000) {
          setBotImageUrl('');
          alert("Sistem mendeteksi gambar Bot sebelumnya terlalu besar. Silakan upload ulang.");
        } else {
          setBotImageUrl(data.botImageUrl || '');
        }

        setBotWelcomeText(data.botWelcomeText || '');
        setBotAppUrl(data.botAppUrl || '');
        setBotWaUrl(data.botWaUrl || '');
        setAuthenticated(true);
      } else {
        alert('Kata sandi salah');
      }
    } catch (e) {
      alert('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loadConfig(password);
  };

  const handleSaveConfig = async () => {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({ popupText, qrImage, apiKey, telegramBots, botImageUrl, botWelcomeText, botAppUrl, botWaUrl })
      });
      if (res.ok) {
        alert('Pengaturan berhasil disimpan');
        loadConfig(password);
      }
    } catch (e) {
      alert('Gagal menyimpan pengaturan');
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) return;
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({ newPassword })
      });
      if (res.ok) {
        alert('Kata sandi berhasil diubah. Silahkan login kembali.');
        setPassword('');
        setNewPassword('');
        setAuthenticated(false);
      }
    } catch (e) {
      alert('Gagal mengubah kata sandi');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': password
        }
      });
      if (res.ok) {
        loadConfig(password);
      }
    } catch (e) {
      alert('Gagal menghapus user');
    }
  };

  const handleUpdateLimit = async (id: string, currentLimit: number) => {
    const lim = prompt('Masukkan limit baru (ketik angka saja)', currentLimit.toString());
    if (lim && !isNaN(Number(lim))) {
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': password
          },
          body: JSON.stringify({ limit: Number(lim) })
        });
        if (res.ok) {
          loadConfig(password);
        }
      } catch (e) {
        alert('Gagal mengupdate limit user');
      }
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_DIM = 800;

          if (width > height) {
            if (width > MAX_DIM) {
              height *= MAX_DIM / width;
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width *= MAX_DIM / height;
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const compressed = await compressImage(file);
        setQrImage(compressed);
      }
    }
  };

  const handleBotImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const compressed = await compressImage(file);
        setBotImageUrl(compressed);
      }
    }
  };

  const handleDeleteBot = async (index: number) => {
    if (!confirm('Yakin ingin menghapus bot ini?')) return;
    const newBots = telegramBots.filter((_, i) => i !== index);
    setTelegramBots(newBots);
    
    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({ telegramBots: newBots })
      });
      loadConfig(password);
    } catch(e) {}
  };

  const handleDeleteAllBots = async () => {
    if (!confirm('Yakin ingin menghapus SEMUA bot?')) return;
    setTelegramBots([]);
    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({ telegramBots: [] })
      });
      loadConfig(password);
    } catch(e) {}
  };

  const handleRefreshWebhook = async () => {
    try {
      const res = await fetch('/api/bot/set-webhook');
      const data = await res.json();
      if (res.ok) {
        alert('Webhook berhasil didaftarkan/di-refresh!\n\n' + JSON.stringify(data.results, null, 2));
      } else {
        alert('Gagal refresh webhook: ' + data.error);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastText.trim()) {
      alert('Pesan broadcast tidak boleh kosong!');
      return;
    }
    if (!confirm('Yakin ingin mengirim pesan massal ini ke semua pengunjung bot?')) return;
    
    setBroadcasting(true);
    try {
      const res = await fetch('/api/admin/bot/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({ text: broadcastText })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Broadcast Selesai!\nBerhasil terkirim: ${data.sent}\nGagal terkirim: ${data.failed}`);
        setBroadcastText(''); // clear on success
      } else {
        alert('Broadcast gagal: ' + (data.error || 'Unknown error'));
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setBroadcasting(false);
    }
  };

  const exportWebVisitorsCSV = () => {
    if (!config || !config.users || config.users.length === 0) return alert('Tidak ada data pengunjung web.');
    const rows = [
       ['ID', 'IP Address', 'User Agent', 'Device Info', 'Klik Masuk', 'Batas Masuk', 'Terakhir Aktif', 'Ban Status']
    ];
    config.users.forEach((u: any) => {
       rows.push([
         u.id, 
         u.ip || '', 
         `"${(u.userAgent || '').replace(/"/g, '""')}"`, 
         `"${(u.deviceInfo || '').replace(/"/g, '""')}"`,
         u.dataLimit?.toString() || '0',
         u.limit?.toString() || '0',
         new Date(u.lastActive).toISOString(),
         u.limit === 0 ? 'Banned' : 'Active'
       ]);
    });
    downloadCSV('Data_Pengunjung_Web.csv', rows);
  };

  const exportBotVisitorsCSV = () => {
    if (!config || !config.botVisitors || config.botVisitors.length === 0) return alert('Tidak ada data pengunjung bot.');
    const rows = [
       ['Telegram ID', 'Username', 'Nama Depan', 'Nama Belakang', 'Waktu Berkunjung (/start)', 'Bot Token']
    ];
    config.botVisitors.forEach((v: any) => {
       rows.push([
         v.id || '',
         v.username || '',
         `"${(v.firstName || '').replace(/"/g, '""')}"`,
         `"${(v.lastName || '').replace(/"/g, '""')}"`,
         new Date(v.visitedAt).toISOString(),
         v.botToken || ''
       ]);
    });
    downloadCSV('Data_Pengunjung_Bot.csv', rows);
  };

  const downloadCSV = (filename: string, rows: string[][]) => {
    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#161618] border border-white/5 p-8 rounded-2xl w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
              <Settings className="w-8 h-8 text-amber-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-6">Admin Panel</h1>
          <form onSubmit={handleLogin} className="space-y-4">
             <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">Kata Sandi</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#1A1A1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Masukkan kata sandi admin"
                />
             </div>
             <button disabled={loading} className="w-full bg-amber-500 text-black font-bold py-3 rounded-xl hover:bg-amber-400 transition-colors">
               {loading ? 'Memeriksa...' : 'Masuk'}
             </button>
             <button type="button" onClick={() => navigate('/')} className="w-full text-slate-500 font-bold py-3 hover:text-white transition-colors text-xs">
               Kembali ke Beranda
             </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Active users count (active in last 5 minutes)
  const activeUsers = config?.users.filter((u: any) => new Date(u.lastActive).getTime() > Date.now() - 5 * 60 * 1000).length || 0;

  return (
    <div className="min-h-screen bg-[#0A0A0B] pb-20">
      {/* Header */}
      <div className="bg-[#121214] border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-black p-2 rounded-xl">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Admin Dashboard</h1>
            <p className="text-xs font-medium text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {activeUsers} User Aktif
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => loadConfig(password)} disabled={loading} className="text-amber-500 hover:text-amber-400 flex items-center gap-2 text-sm font-bold bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> <span className="hidden md:inline">{loading ? 'Memuat...' : 'Refresh Data'}</span>
          </button>
          <button onClick={() => {
              setAuthenticated(false);
              setPassword('');
            }} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
             <LogOut className="w-4 h-4" /> <span className="hidden md:inline">Keluar</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        <div className="flex gap-2 p-1 bg-[#161618] border border-white/5 rounded-xl max-w-sm">
          <button 
            onClick={() => setActiveTab('web')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'web' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Users className="w-4 h-4" /> Sistem Web
          </button>
          <button 
            onClick={() => setActiveTab('bot')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'bot' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            Sistem Bot
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Settings */}
        
        {activeTab === 'web' && (
        <div className="space-y-6">
          <div className="bg-[#161618] rounded-2xl border border-white/5 p-5">
             <h2 className="text-white font-bold mb-4 flex items-center gap-2">
               <Activity className="w-4 h-4 text-amber-500" /> Pengaturan Limit & Popup
             </h2>
             <div className="space-y-4">
               
               <div>
                 <label className="text-xs font-bold text-slate-400 mb-1 block">Teks Popup saat limit habis</label>
                 <textarea 
                   rows={4}
                   value={popupText}
                   onChange={e => setPopupText(e.target.value)}
                   className="w-full bg-[#1A1A1D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                 />
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-400 mb-1 block">QR Code (Upload/Base64/URL)</label>
                 <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-2 block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-400" />
                 {qrImage.length > 200 ? (
                   <div className="w-full bg-[#1A1A1D] border border-white/10 rounded-xl px-4 py-3 text-emerald-500/80 text-sm font-mono truncate">
                     ✓ Gambar Custom Terpasang
                   </div>
                 ) : (
                   <input 
                     type="text" 
                     value={qrImage}
                     onChange={e => setQrImage(e.target.value)}
                     placeholder="Atau paste URL gambar QR disini"
                     className="w-full bg-[#1A1A1D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                   />
                 )}
                 {qrImage && (
                   <div className="mt-3 flex flex-col items-start gap-2 mb-4">
                     <div className="bg-white p-2 w-32 h-32 rounded-xl border border-slate-600">
                       <img src={qrImage} alt="QR Code Preview" className="w-full h-full object-contain" />
                     </div>
                     <button
                       onClick={() => setQrImage('')}
                       className="bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-500/20 text-xs font-bold flex items-center gap-2 transition-colors"
                     >
                       <Trash2 className="w-3 h-3" /> Hapus QR
                     </button>
                   </div>
                 )}
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-400 mb-1 block">API Key (Disimpan di R2)</label>
                 <input 
                   type="text" 
                   value={apiKey}
                   onChange={e => setApiKey(e.target.value)}
                   className="w-full bg-[#1A1A1D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 mb-2"
                   placeholder="Masukkan API Key yang baru"
                 />
               </div>
               
               <button onClick={handleSaveConfig} className="w-full flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold py-3 rounded-xl transition-colors border border-amber-500/20">
                 <Save className="w-4 h-4" /> Simpan Pengaturan Web
               </button>
             </div>
          </div>

          <div className="bg-[#161618] rounded-2xl border border-white/5 p-5">
             <h2 className="text-white font-bold mb-4 flex items-center gap-2">
               <Key className="w-4 h-4 text-amber-500" /> Ganti Kata Sandi Admin
             </h2>
             <div className="space-y-4">
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Kata Sandi Baru"
                  className="w-full bg-[#1A1A1D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
                <button onClick={handleUpdatePassword} className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold py-3 rounded-xl transition-colors border border-red-500/20">
                  Ubah Kata Sandi
                </button>
             </div>
          </div>
        </div>
        )}

        {activeTab === 'bot' && (
        <div className="space-y-6">
          <div className="bg-[#161618] rounded-2xl border border-white/5 p-5">
             <h2 className="text-white font-bold mb-4 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
               Pengaturan Bot
             </h2>
             <div className="space-y-4">
               <div>
                 <label className="text-xs font-bold text-slate-400 mb-1 block">Telegram Bots (Disimpan di KV)</label>
                 
                 <div className="space-y-3 mb-4">
                   {telegramBots.map((bot, index) => (
                     <div key={index} className="flex gap-2 items-center bg-white/5 p-3 rounded-xl border border-white/10">
                        <div className="flex-1 space-y-2">
                          <input 
                            type="text" 
                            value={bot.name}
                            onChange={e => {
                              const newBots = [...telegramBots];
                              newBots[index].name = e.target.value;
                              setTelegramBots(newBots);
                            }}
                            className="w-full bg-[#1A1A1D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                            placeholder="Nama Bot"
                          />
                          <input 
                            type="text" 
                            value={bot.token}
                            onChange={e => {
                              const newBots = [...telegramBots];
                              newBots[index].token = e.target.value;
                              setTelegramBots(newBots);
                            }}
                            className="w-full bg-[#1A1A1D] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                            placeholder="Bot Token (Misal: 726...)"
                          />
                        </div>
                        <button 
                          onClick={() => handleDeleteBot(index)}
                          className="bg-red-500/20 hover:bg-red-500/40 text-red-500 p-3 rounded-xl transition-colors shrink-0"
                          title="Hapus Bot Secara Terbuka dan Simpan (Auto Save)"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                     </div>
                   ))}
                   
                   {telegramBots.length > 0 && (
                     <button 
                       onClick={handleDeleteAllBots}
                       className="w-full py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-colors text-sm font-bold"
                     >
                       Hapus Semua Bot
                     </button>
                   )}
                   
                   <button 
                    onClick={() => setTelegramBots([...telegramBots, { name: 'Bot Baru', token: '' }])}
                    className="w-full py-2 border border-dashed border-white/20 rounded-xl text-slate-400 hover:text-white hover:border-white/50 transition-colors text-sm"
                   >
                     + Tambah Bot
                   </button>
                   
                   <button 
                     type="button"
                     onClick={handleRefreshWebhook}
                     className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold py-3 mt-4 rounded-xl transition-colors border border-emerald-500/20 text-sm"
                   >
                     <RefreshCw className="w-4 h-4" /> Daftarkan Webhook Semua Bot
                   </button>
                 </div>

                 <small className="text-slate-500 text-xs mt-1 block mb-4">
                   Setelah menyimpan info bot, klik tombol <b>Daftarkan Webhook</b> di atas untuk menyambungkan bot ke sistem web ini.
                 </small>
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-400 mb-1 block">Teks Sambutan Pendaftaran Bot (/start)</label>
                 <textarea 
                   rows={3}
                   value={botWelcomeText}
                   onChange={e => setBotWelcomeText(e.target.value)}
                   placeholder="selamat datang pecinta Drama\nBuka tombol aplikasi di bawah ini"
                   className="w-full bg-[#1A1A1D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 mb-4 resize-none"
                 />
                 
                 <label className="text-xs font-bold text-slate-400 mb-1 block">URL Tombol Buka Aplikasi (Opsional)</label>
                 <input 
                   type="text" 
                   value={botAppUrl}
                   onChange={e => setBotAppUrl(e.target.value)}
                   placeholder="Contoh: https://id.vipcf.workers.dev"
                   className="w-full bg-[#1A1A1D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 mb-4"
                 />
                 
                 <label className="text-xs font-bold text-slate-400 mb-1 block">URL Tombol Grup WhatsApp (Opsional)</label>
                 <input 
                   type="text" 
                   value={botWaUrl}
                   onChange={e => setBotWaUrl(e.target.value)}
                   placeholder="Contoh: https://chat.whatsapp.com/FfMt4vbJQGfJGvEVdurhP6"
                   className="w-full bg-[#1A1A1D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 mb-4"
                 />
               </div>

               <div>
                 <label className="text-xs font-bold text-slate-400 mb-1 block">Gambar Bot /start (Upload/Base64/URL)</label>
                 <input type="file" accept="image/*" onChange={handleBotImageUpload} className="mb-2 block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-400" />
                 {botImageUrl.length > 200 ? (
                   <div className="w-full bg-[#1A1A1D] border border-white/10 rounded-xl px-4 py-3 text-emerald-500/80 text-sm font-mono truncate mb-4">
                     ✓ Gambar Custom Terpasang
                   </div>
                 ) : (
                   <input 
                     type="text" 
                     value={botImageUrl}
                     onChange={e => setBotImageUrl(e.target.value)}
                     placeholder="Atau paste URL gambar bot disini"
                     className="w-full bg-[#1A1A1D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 mb-4"
                   />
                 )}
                 {botImageUrl && (
                   <div className="mt-3 flex flex-col items-start gap-2 mb-4">
                     <div className="bg-white p-2 w-32 h-32 rounded-xl border border-slate-600">
                       <img src={botImageUrl} alt="Bot Image Preview" className="w-full h-full object-contain" />
                     </div>
                     <button
                       onClick={() => setBotImageUrl('')}
                       className="bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-500/20 text-xs font-bold flex items-center gap-2 transition-colors"
                     >
                       <Trash2 className="w-3 h-3" /> Hapus Gambar
                     </button>
                   </div>
                 )}
               </div>
               <button onClick={handleSaveConfig} className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold py-3 rounded-xl transition-colors border border-emerald-500/20">
                 <Save className="w-4 h-4" /> Simpan Pengaturan Bot
               </button>
             </div>
          </div>
        </div>
        )}


        {activeTab === 'web' && (
          <div className="lg:col-span-2 space-y-4">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 bg-[#161618] border border-white/5 p-4 rounded-2xl">
               <h2 className="text-lg font-bold text-white flex items-center gap-2">
                 <Users className="w-5 h-5 text-amber-500" /> Daftar Pengguna Web
               </h2>
               <div className="flex items-center gap-3">
                 <button 
                   onClick={exportWebVisitorsCSV}
                   className="bg-[#1A1A1D] border border-white/10 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                   Export CSV
                 </button>
                 <div className="text-xs font-bold bg-[#1A1A1D] border border-white/5 px-4 py-2 rounded-xl text-slate-400">
                   Total: {config?.users?.length || 0}
                 </div>
               </div>
             </div>
             
             <div className="grid gap-3">
               {config?.users && config.users.length > 0 ? [...config.users].reverse().map((u: any) => (
                  <div key={u.id} className="bg-[#161618] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="space-y-1 w-full sm:w-[calc(100%-120px)] overflow-hidden">
                      <div className="flex flex-wrap items-center gap-2">
                         <span className="font-mono text-sm font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded break-all">{u.ip}</span>
                         {u.limit === 0 && (
                           <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded uppercase">Banned</span>
                         )}
                         <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">{new Date(u.lastActive).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1 max-w-full break-all" title={u.userAgent}>{u.userAgent}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                       <div className="flex items-center gap-2 bg-[#1A1A1D] border border-white/5 px-3 py-1.5 rounded-lg">
                          <div className="flex flex-col items-center">
                             <span className="text-[10px] text-slate-500 font-bold">Terpakai</span>
                             <span className={`text-sm font-bold ${u.dataLimit >= u.limit ? 'text-red-500' : 'text-emerald-500'}`}>{u.dataLimit}</span>
                          </div>
                          <span className="text-slate-600">/</span>
                          <div className="flex flex-col items-center">
                             <span className="text-[10px] text-slate-500 font-bold">Limit</span>
                             <span className="text-sm font-bold text-white">{u.limit}</span>
                          </div>
                          <button onClick={() => handleUpdateLimit(u.id, u.limit)} className="ml-2 text-slate-400 hover:text-amber-500 p-1">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                       </div>
                       <div className="flex items-center gap-2">
                          <button onClick={() => {
                            if (confirm("Blokir user ini? Limit mereka akan di-set ke 0 sehingga tidak bisa menonton.")) {
                              handleUpdateLimit(u.id, 0);
                            }
                          }} title="Blokir User (Set limit ke 0)" className="bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white p-2.5 rounded-xl border border-orange-500/20 hover:border-orange-500 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                          </button>
                          <button onClick={() => {
                            if (confirm("Hapus riwayat user ini? (Mereka akan dianggap sebagai user baru dan mendapat jatah limit gratis lagi jika berkunjung kembali)")) {
                              handleDeleteUser(u.id);
                            }
                          }} title="Hapus Riwayat (Akan mereset limit jika mereka datang lagi)" className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2.5 rounded-xl border border-red-500/20 hover:border-red-500 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  </div>
               )) : (
                 <div className="text-center py-10 bg-[#161618] rounded-2xl border border-white/5">
                   <p className="text-slate-500 text-sm font-bold">Belum ada user yang tercatat.</p>
                 </div>
               )}
             </div>
          </div>
        )}

        {activeTab === 'bot' && (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#161618] border border-white/5 p-5 rounded-2xl mb-6">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-500" /> Broadcast Pesan
              </h2>
              <p className="text-xs text-slate-400 mb-3">Kirim pesan massal ke semua pengunjung yang pernah berinteraksi (/start) dengan bot.</p>
              <div className="flex flex-col gap-3">
                <textarea
                  rows={3}
                  value={broadcastText}
                  onChange={e => setBroadcastText(e.target.value)}
                  className="w-full bg-[#1A1A1D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                  placeholder="Ketik pesan broadcast disini..."
                />
                <button 
                  onClick={handleBroadcast} 
                  disabled={broadcasting}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {broadcasting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {broadcasting ? 'Mengirim...' : 'Kirim Broadcast Sekarang'}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 bg-[#161618] border border-white/5 p-4 rounded-2xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                Riwayat Pengunjung Bot (/start)
              </h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={exportBotVisitorsCSV}
                  className="bg-[#1A1A1D] border border-white/10 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Export CSV
                </button>
                <div className="text-xs font-bold bg-[#161618] border border-white/5 px-4 py-2 rounded-xl text-slate-400">
                  Total: {config?.botVisitors?.length || 0}
                </div>
              </div>
            </div>
            
            <div className="grid gap-3">
              {config?.botVisitors && config.botVisitors.length > 0 ? [...config.botVisitors].reverse().map((v: any, idx: number) => (
                 <div key={`${v.id}-${idx}`} className="bg-[#161618] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-[#1C1C1F] transition-colors">
                   <div className="flex items-center gap-4">
                     <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-xl font-bold text-slate-300">
                        {v.firstName ? v.firstName.charAt(0).toUpperCase() : '?'}
                     </div>
                     <div className="space-y-0.5">
                        <h3 className="font-bold text-white text-sm">
                          {v.firstName} {v.lastName || ''}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                           {v.username && (
                             <span className="text-xs font-medium text-amber-500">@{v.username}</span>
                           )}
                           <span className="text-[10px] font-mono text-slate-500 bg-black/20 px-1.5 py-0.5 rounded">ID: {v.id}</span>
                        </div>
                     </div>
                   </div>
                   
                   <div className="flex flex-col sm:items-end gap-1 text-left sm:text-right w-full sm:w-auto">
                     <span className="text-xs font-medium text-slate-400">Terakhir mengunjungi:</span>
                     <span className="text-xs text-white">{new Date(v.visitedAt).toLocaleString()}</span>
                   </div>
                 </div>
              )) : (
                <div className="text-center py-10 bg-[#161618] rounded-2xl border border-white/5">
                  <p className="text-slate-500 text-sm font-bold">Belum ada pengunjung bot yang terekam.</p>
                  <p className="text-slate-600 text-xs mt-2">Daftar ini akan otomatis terisi saat seseorang mengetik /start di bot Anda.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
