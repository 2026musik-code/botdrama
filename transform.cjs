const fs = require('fs');

let code = fs.readFileSync('src/Admin.tsx', 'utf8');

// 1. Find the wrapper to inject conditions
// From: {/* Left Col - Settings */} <div className="space-y-6">
const leftColRegex = /(<div className="space-y-6">\s*<div className="bg-\[#161618\] rounded-2xl border border-white\/5 p-5">\s*<h2 className="text-white font-bold mb-4 flex items-center gap-2">\s*<Activity className="w-4 h-4 text-amber-500" \/> Pengaturan Limit & Popup\s*<\/h2>\s*<div className="space-y-4">)([\s\S]*?)<button onClick={handleSaveConfig} className="w-full flex items-center justify-center gap-2 bg-white\/10 hover:bg-white\/20 text-white font-bold py-3 rounded-xl transition-colors border border-white\/10">\s*<Save className="w-4 h-4" \/> Simpan Pengaturan\s*<\/button>\s*<\/div>\s*<\/div>\s*<div className="bg-\[#161618\] rounded-2xl border border-white\/5 p-5">\s*<h2 className="text-white font-bold mb-4 flex items-center gap-2">\s*<Key className="w-4 h-4 text-amber-500" \/> Ganti Kata Sandi Admin\s*<\/h2>\s*<div className="space-y-4">\s*<input\s+type="password"\s+value={newPassword}\s+onChange={e => setNewPassword\(e\.target\.value\)}\s+placeholder="Kata Sandi Baru"\s+className="w-full bg-\[#1A1A1D\] border border-white\/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"\s*\/>\s*<button onClick={handleUpdatePassword} className="w-full bg-red-500\/10 text-red-500 hover:bg-red-500\/20 font-bold py-3 rounded-xl transition-colors border border-red-500\/20">\s*Ubah Kata Sandi\s*<\/button>\s*<\/div>\s*<\/div>\s*<\/div>/m;

const match = code.match(leftColRegex);
if (!match) {
    console.error("COULD NOT FIND LEFT COL REGEX");
    process.exit(1);
}

// We will split the inner content of "space-y-4" into WEB parts and BOT parts.
const innerContent = match[2];

// Extract API Key
const apiKeyRegex = /<div>\s*<label className="text-xs font-bold text-slate-400 mb-1 block">API Key.*?<\/div>\s*<\/div>/s;
const apiKeyMatch = innerContent.match(apiKeyRegex);
const apiKeyBlock = apiKeyMatch ? apiKeyMatch[0] : '';


// Extract Telegram Bots
const telegramBotsRegex = /<div>\s*<label className="text-xs font-bold text-slate-400 mb-1 block">Telegram Bots[\s\S]*?<\/small>\s*<\/div>/s;
const telegramBotsMatch = innerContent.match(telegramBotsRegex);
const telegramBotsBlock = telegramBotsMatch ? telegramBotsMatch[0] : '';


// Extract Sambutan and Gambar Bot
const sambutanRegex = /<div>\s*<label className="text-xs font-bold text-slate-400 mb-1 block">Teks Sambutan Pendaftaran Bot[\s\S]*?<\/div>[\s\S]*?<div>\s*<label className="text-xs font-bold text-slate-400 mb-1 block">Gambar Bot \/start[\s\S]*?<\/div>/s;
const sambutanMatch = innerContent.match(sambutanRegex);
const sambutanBlock = sambutanMatch ? sambutanMatch[0] : '';


// Combine remaining as Web (popup text and qr)
let webInnerContent = innerContent
    .replace(telegramBotsBlock, '')
    .replace(sambutanBlock, '');

const replacement = `
        {activeTab === 'web' && (
        <div className="space-y-6">
          <div className="bg-[#161618] rounded-2xl border border-white/5 p-5">
             <h2 className="text-white font-bold mb-4 flex items-center gap-2">
               <Activity className="w-4 h-4 text-amber-500" /> Pengaturan Limit & Popup
             </h2>
             <div className="space-y-4">
               ${webInnerContent}
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
               ${telegramBotsBlock}
               ${sambutanBlock}
               <button onClick={handleSaveConfig} className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold py-3 rounded-xl transition-colors border border-emerald-500/20">
                 <Save className="w-4 h-4" /> Simpan Pengaturan Bot
               </button>
             </div>
          </div>
        </div>
        )}
`;

code = code.replace(leftColRegex, replacement);
fs.writeFileSync('src/Admin.tsx', code);
console.log("SUCCESSFULLY TRANSFORMED ADMIN");
