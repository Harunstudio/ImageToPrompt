
import React, { useState } from 'react';

export const MegaMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      title: "Mesin Neural",
      links: ["Gemini 3 Pro", "Rekonstruksi Visi v1.5.5", "Analisis Flash-Lite", "Rendering Kelas-CGI"],
      icon: "✨"
    },
    {
      title: "Layanan Studio",
      links: ["Pelatihan AI Kustom", "Retouching Profesional", "Prompt Engineering", "API Perusahaan"],
      icon: "🏛️"
    },
    {
      title: "Galeri AI",
      links: ["Showcase Fotorealistik", "Portofolio Klien", "Perpustakaan Referensi Gaya", "Feed Komunitas"],
      icon: "🖼️"
    },
    {
      title: "Sumber Daya",
      links: ["Dokumentasi", "Menguasai Prompt", "Blog Studio", "Dukungan V2P"],
      icon: "📜"
    }
  ];

  return (
    <>
      <nav className="relative z-[100] w-full border-b border-amber-500/20 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-200 via-yellow-500 to-amber-700 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.3)] group-hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] transition-all group-hover:scale-110">
                <span className="text-black font-black text-xl">H</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-sm tracking-[0.2em] uppercase leading-none">Harun</span>
                <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent font-black text-[10px] uppercase tracking-[0.3em]">Studio Elite</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-10">
              <button 
                onMouseEnter={() => setIsOpen(true)}
                className="text-amber-200/70 hover:text-amber-400 text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center gap-2 group"
              >
                Layanan Global <svg className={`w-3 h-3 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <a href="#" className="text-zinc-500 hover:text-white text-[11px] font-black uppercase tracking-[0.4em] transition-all">Portfolio</a>
              <div className="h-6 w-[1px] bg-zinc-800 mx-2"></div>
              <button className="bg-gradient-to-r from-amber-500 to-amber-700 px-8 py-2.5 rounded-full text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_5px_20px_rgba(251,191,36,0.3)]">
                Hubungi Studio
              </button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="text-amber-500 p-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        <div 
          onMouseLeave={() => setIsOpen(false)}
          className={`absolute top-full left-0 w-full bg-[#080808]/95 backdrop-blur-2xl border-b border-amber-500/10 transition-all duration-700 overflow-hidden ${isOpen ? 'max-h-[800px] opacity-100 py-16' : 'max-h-0 opacity-0 py-0'}`}
        >
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-16">
            {menuItems.map((item, idx) => (
              <div key={idx} className="space-y-8 animate-in fade-in slide-in-from-top-4" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{item.icon}</span>
                  <h3 className="bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent font-black text-[11px] uppercase tracking-[0.5em]">{item.title}</h3>
                </div>
                <ul className="space-y-5">
                  {item.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <a href="#" className="text-zinc-500 hover:text-white text-xs font-bold transition-all flex items-center group">
                        <span className="w-0 group-hover:w-5 h-[2px] bg-amber-500 mr-0 group-hover:mr-4 transition-all duration-500 rounded-full"></span>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};
