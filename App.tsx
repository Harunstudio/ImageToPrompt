
import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader.tsx';
import { Button } from './components/Button.tsx';
import { MegaMenu } from './components/MegaMenu.tsx';
import { generateImagePrompt } from './services/geminiService.ts';
import { ImageState, GeneratedPromptData, SubjectType, GenerationMode, LanguageConfig, DetailLevel, HistoryItem } from './types.ts';

const LANGUAGES: LanguageConfig[] = [
  { code: 'id', name: 'Indonesian', nativeName: 'Indonesia', flag: '🇮🇩', prefix: 'TANPA MERUBAH WAJAH ASLI' },
  { code: 'ms', name: 'Malay', nativeName: 'Malaysia', flag: '🇲🇾', prefix: 'TANPA MENGUBAH WAJAH ASLI' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', prefix: 'WITHOUT CHANGING THE ORIGINAL FACE' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', prefix: '원본 얼굴을 유지하면서' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', prefix: '元の顔を変えずに' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', prefix: 'โดยไม่เปลี่ยนใบหน้าเดิม' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', prefix: 'SIN CAMBIAR EL ROSTRO ORIGINAL' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', prefix: 'SANS CHANGER LE VISAGE ORIGINAL' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', prefix: 'OHNE DAS ORIGINALE GESICHT ZU VERÄNDERN' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', prefix: 'SENZA CAMBIARE IL VOLTO ORIGINALE' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', prefix: 'SEM ALTERAR O ROSTO ORIGINAL' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', prefix: 'БЕЗ ИЗМЕНЕНИЯ ОРИГИНАЛЬНОГО ЛИЦA' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', prefix: 'دون تغيير الوجه الأصلي' },
  { code: 'zh-cn', name: 'Chinese Simplified', nativeName: '简体中文', flag: '🇨🇳', prefix: '在不改变原脸的情况下' },
  { code: 'zh-tw', name: 'Chinese Traditional', nativeName: '繁體中文', flag: '🇹🇼', prefix: '在不改變原臉的情況下' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', prefix: 'मूल चेहरे को बदले बिना' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', prefix: 'KHÔNG THAY ĐỔI KHUÔN MẶT GỐC' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', prefix: 'ORİJİNAL YÜZÜ DEĞİŞTİRMEDEN' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', prefix: 'ZONDER HET ORIGINELE GEZICHT TE VERANDEREN' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', prefix: 'BEZ ZMIANY ORYGINALNEJ TWARZY' },
];

const App: React.FC = () => {
  const [image, setImage] = useState<ImageState>({
    file: null,
    previewUrl: null,
    base64: null,
  });
  const [subjectType, setSubjectType] = useState<SubjectType>('Pria');
  const [mode, setMode] = useState<GenerationMode>('Cepat');
  const [detailLevel, setDetailLevel] = useState<DetailLevel>('Standar');
  const [emphasize, setEmphasize] = useState('');
  const [ignore, setIgnore] = useState('');
  const [selectedLang, setSelectedLang] = useState<LanguageConfig>(LANGUAGES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedPromptData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('v2p_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleImageSelect = (file: File, base64: string, previewUrl: string) => {
    setImage({ file, base64, previewUrl });
    setResult(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!image.base64) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateImagePrompt(
        image.base64, 
        subjectType, 
        mode, 
        selectedLang.name,
        detailLevel,
        emphasize,
        ignore
      );
      setResult(data);
      
      // Add to history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imagePreview: image.previewUrl || '',
        subjectType,
        result: data,
        language: selectedLang.code
      };
      const updatedHistory = [newItem, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('v2p_history', JSON.stringify(updatedHistory));
      
    } catch (err: any) {
      setError(err.message || "Engine failure during synthesis.");
    } finally {
      setLoading(false);
    }
  };

  const getFullPrompt = () => {
    if (!result) return "";
    const labels = {
      id: ['DETAIL WAJAH DAN RAMBUT', 'CLOTHING DAN AKSESORIS', 'POSE DAN TEKNIK KAMERA', 'LATAR BELAKANG', 'GAYA SENI', 'RESOLUSI', 'PENCAHAYAAN', 'NEGATIVE PROMPT'],
      en: ['FACE & HAIR DETAIL', 'CLOTHING & ACCESSORIES', 'POSE & CAMERA TECHNIQUE', 'BACKGROUND', 'ART STYLE', 'RESOLUTION', 'LIGHTING', 'NEGATIVE PROMPT']
    };
    const currentLabels = selectedLang.code === 'id' ? labels.id : labels.en;
    return `${selectedLang.prefix}\n\n${currentLabels[0]} : ${result.facialHair}\n\n${currentLabels[1]} : ${result.clothingAcc}\n\n${currentLabels[2]} : ${result.poseCameraAction}\n\n${currentLabels[3]} : ${result.bgStyle}\n\n${currentLabels[4]} : ${result.artStyle}\n\n${currentLabels[5]} : ${result.resolution}\n\n${currentLabels[6]} : ${result.lighting}\n\n${currentLabels[7]} : ${result.negativePrompt}`;
  };

  const copyToClipboard = () => {
    const fullPrompt = getFullPrompt();
    if (!fullPrompt) return;
    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPrompt = () => {
    const fullPrompt = getFullPrompt();
    if (!fullPrompt) return;
    const blob = new Blob([fullPrompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vision2Prompt_${subjectType.replace(/\s+/g, '_')}_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setImage({ file: null, previewUrl: null, base64: null });
    setResult(null);
    setError(null);
    setEmphasize('');
    setIgnore('');
    setDetailLevel('Standar');
  };

  const restoreHistory = (item: HistoryItem) => {
    setResult(item.result);
    setSubjectType(item.subjectType);
    const lang = LANGUAGES.find(l => l.code === item.language) || LANGUAGES[0];
    setSelectedLang(lang);
    setImage(prev => ({ ...prev, previewUrl: item.imagePreview }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('v2p_history');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 selection:bg-amber-500/30 font-inter overflow-x-hidden relative neural-grid">
      <div className="scanline"></div>
      <style>{`
        @keyframes jelly {
          0%, 100% { transform: scale(1, 1); }
          25% { transform: scale(0.85, 1.15); }
          50% { transform: scale(1.15, 0.85); }
          75% { transform: scale(0.95, 1.05); }
        }
        @keyframes float-1 { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-12px) rotate(2deg); } }
        @keyframes float-2 { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-8px) rotate(-2deg); } }
        @keyframes float-3 { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-15px) rotate(1deg); } }
        @keyframes wiggle { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(3deg); } }
        
        .jelly-pop:active { animation: jelly 0.5s ease-in-out; }
        .bubble-float-1 { animation: float-1 4s ease-in-out infinite; }
        .bubble-float-2 { animation: float-2 5s ease-in-out infinite; }
        .bubble-float-3 { animation: float-3 6s ease-in-out infinite; }
        .bubble-wiggle { animation: wiggle 3s ease-in-out infinite; }

        .bubble-glow-selected {
          box-shadow: 0 0 25px rgba(251, 191, 36, 0.3), inset 0 0 10px rgba(251, 191, 36, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.2); border-radius: 10px; }
        
        .neural-grid {
          background-image: radial-gradient(circle at 2px 2px, rgba(251, 191, 36, 0.05) 1px, transparent 0);
          background-size: 40px 40px;
        }
        .scanline {
          width: 100%;
          height: 100px;
          background: linear-gradient(to bottom, transparent, rgba(251, 191, 36, 0.02), transparent);
          position: absolute;
          top: -100px;
          left: 0;
          animation: scan 8s linear infinite;
          pointer-events: none;
          z-index: 1;
        }
        @keyframes scan {
          0% { top: -100px; }
          100% { top: 100%; }
        }
      `}</style>
      
      <MegaMenu />

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16 space-y-4">
          <div className="inline-flex items-center px-4 md:px-6 py-2 rounded-full bg-amber-500/5 text-amber-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] mb-2 md:mb-4 border border-amber-500/10 backdrop-blur-md animate-pulse">
            Neural Architecture Reconstruction v1.5.5
          </div>
          <h1 className="text-4xl md:text-8xl font-black text-white tracking-tighter uppercase leading-tight md:leading-none px-2">
            Vision2Prompt <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent">Pro</span>
          </h1>
          <p className="text-zinc-500 font-bold tracking-[0.2em] md:tracking-[0.3em] text-[9px] md:text-[11px] uppercase italic px-4">
            Developed by Harun Studio &bull; International Elite Edition
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6 md:space-y-10">
            <div className="bg-zinc-900/40 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-zinc-800/50 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
              
              <div className="flex items-center justify-between mb-8 md:mb-10">
                <h2 className="text-base md:text-lg font-black text-white uppercase tracking-widest flex items-center gap-3 md:gap-4">
                  <div className="w-1.5 md:w-2 h-8 md:h-10 bg-gradient-to-b from-amber-400 to-amber-700 rounded-full"></div>
                  Input Sintesis
                </h2>
                <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              </div>
              
              <ImageUploader onImageSelect={handleImageSelect} currentPreview={image.previewUrl} />

              <div className="mt-10 md:mt-14 space-y-6 md:space-y-8">
                <label className="text-[9px] md:text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] md:tracking-[0.4em] block text-center">Struktur Identitas</label>
                <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                  {[
                    { label: 'Pria', icon: '👨', anim: 'bubble-float-1' },
                    { label: 'Wanita Non Hijab', icon: '👩', anim: 'bubble-float-2' },
                    { label: 'Wanita Hijab', icon: '🧕', anim: 'bubble-float-3' },
                    { label: 'Pasangan Couple', icon: '👩‍❤️‍👨', anim: 'bubble-float-1' },
                    { label: 'Anak Kecil Pria', icon: '👦', anim: 'bubble-float-2' },
                    { label: 'Anak Kecil Wanita', icon: '👧', anim: 'bubble-float-3' }
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setSubjectType(opt.label as any)}
                      className={`group relative flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full border-2 transition-all duration-500 jelly-pop ${opt.anim} ${
                        subjectType === opt.label 
                          ? 'bg-amber-500/20 border-amber-500 bubble-glow-selected scale-105 md:scale-110' 
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-600 hover:border-zinc-700'
                      }`}
                    >
                      <span className={`text-3xl md:text-4xl mb-1 transition-transform duration-500 ${subjectType === opt.label ? 'scale-110 md:scale-125' : 'group-hover:scale-110'}`}>
                        {opt.icon}
                      </span>
                      <span className="text-[7px] md:text-[8px] font-black uppercase tracking-tighter text-center px-1 md:px-2 leading-none">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-14 space-y-6">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] block text-center">Analisis Neural Otomatis</label>
                <div className="p-6 bg-zinc-950/40 rounded-[2.5rem] border border-zinc-800/50 shadow-inner text-center">
                   <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest italic animate-pulse">
                     Suasana & Pencahayaan: Aktif (Deteksi Otomatis)
                   </p>
                </div>
              </div>

              <div className="mt-10 md:mt-14 space-y-6">
                <label className="text-[9px] md:text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] md:tracking-[0.4em] block text-center">Detail Deskripsi</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  {(['Singkat', 'Standar', 'Mendetail'] as DetailLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDetailLevel(level)}
                      className={`flex-1 py-3 rounded-xl md:rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                        detailLevel === level 
                          ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-lg' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-14 space-y-6">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] block text-center">Fokus Neural (Opsional)</label>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tekankan (contoh: 'gaya vintage', 'mata biru')"
                      value={emphasize}
                      onChange={(e) => setEmphasize(e.target.value)}
                      className="w-full bg-zinc-950/40 border border-zinc-800/50 rounded-2xl px-6 py-4 text-[11px] font-bold text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/50 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500/30 text-xs">✨</div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Abaikan (contoh: 'kacamata', 'janggut')"
                      value={ignore}
                      onChange={(e) => setIgnore(e.target.value)}
                      className="w-full bg-zinc-950/40 border border-zinc-800/50 rounded-2xl px-6 py-4 text-[11px] font-bold text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-red-500/30 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500/30 text-xs">🚫</div>
                  </div>
                </div>
              </div>

              <div className="mt-10 md:mt-14 space-y-6">
                <label className="text-[9px] md:text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] md:tracking-[0.4em] block text-center">Pilihan Bahasa</label>
                <div className="flex flex-wrap justify-center gap-2 md:gap-3 p-4 md:p-6 bg-zinc-950/40 rounded-[2rem] md:rounded-[2.5rem] border border-zinc-800/50 shadow-inner max-h-48 md:max-h-56 overflow-y-auto custom-scrollbar">
                  {LANGUAGES.map((lang, idx) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLang(lang)}
                      className={`flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full border text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all duration-300 jelly-pop bubble-wiggle ${
                        selectedLang.code === lang.code 
                          ? 'bg-amber-500 border-amber-600 text-black shadow-lg scale-105' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}
                      style={{ animationDelay: `${idx * 0.15}s` }}
                    >
                      <span className="text-base md:text-lg">{lang.flag}</span>
                      {lang.nativeName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-12 flex justify-center gap-4">
                {[
                  { id: 'Cepat', label: 'Kilat' },
                  { id: 'Penalaran', label: 'Analitik' },
                  { id: 'Pro', label: 'Ultra' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id as any)}
                    className={`flex-1 py-4 rounded-[1.5rem] border text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 jelly-pop ${
                      mode === m.id ? 'bg-zinc-800 border-amber-500 text-amber-500 shadow-xl' : 'bg-zinc-900/40 border-zinc-800 text-zinc-600 hover:bg-zinc-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="mt-12">
                <Button 
                  onClick={handleGenerate} 
                  isLoading={loading}
                  disabled={!image.base64}
                  className="w-full h-20 rounded-[2rem] text-[14px] font-black tracking-[0.4em] uppercase bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-700 hover:brightness-125 border-none text-black shadow-[0_20px_50px_rgba(251,191,36,0.3)] transition-all active:scale-95"
                >
                  Mulai Sintesis Global
                </Button>
                {image.previewUrl && (
                  <button onClick={reset} disabled={loading} className="w-full mt-6 text-zinc-600 hover:text-amber-500 text-[10px] font-black uppercase tracking-[0.5em] py-2 transition-colors">
                    Reset Lab Rekonstruksi
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-zinc-900/40 rounded-[2.5rem] md:rounded-[3.5rem] border border-zinc-800/50 shadow-2xl backdrop-blur-3xl overflow-hidden flex flex-col h-full min-h-[600px] md:min-h-[900px]">
              <div className="bg-zinc-950/90 px-6 md:px-12 py-8 md:py-12 border-b border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
                <div className="text-center md:text-left">
                  <h3 className="text-white font-black text-base md:text-lg uppercase tracking-[0.4em] md:tracking-[0.5em]">Hasil Sintesis</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                    <div className="flex items-center gap-2 md:gap-3 bg-amber-500/10 px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-amber-500/20">
                      <span className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      <span className="text-[8px] md:text-[10px] text-amber-500 font-black uppercase tracking-widest">{selectedLang.name}</span>
                    </div>
                    {result?.detectedMood && (
                      <div className="flex items-center gap-2 md:gap-3 bg-blue-500/10 px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-blue-500/20">
                        <span className="text-[8px] md:text-[10px] text-blue-400 font-black uppercase tracking-widest">
                          {selectedLang.code === 'id' ? 'Suasana' : 'Mood'}: {result.detectedMood}
                        </span>
                      </div>
                    )}
                    {result?.artStyle && (
                      <div className="flex items-center gap-2 md:gap-3 bg-purple-500/10 px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-purple-500/20">
                        <span className="text-[8px] md:text-[10px] text-purple-400 font-black uppercase tracking-widest">
                          {selectedLang.code === 'id' ? 'Gaya' : 'Style'}: {result.artStyle}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {result && (
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <button 
                      onClick={copyJson}
                      className="flex items-center justify-center gap-3 text-[10px] md:text-[11px] font-black px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-[2rem] transition-all uppercase tracking-[0.3em] md:tracking-[0.4em] bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-600 jelly-pop"
                    >
                      JSON
                    </button>
                    <button 
                      onClick={downloadPrompt}
                      className="flex items-center justify-center gap-3 text-[10px] md:text-[11px] font-black px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[2rem] transition-all uppercase tracking-[0.3em] md:tracking-[0.4em] bg-zinc-800 text-amber-500 border border-amber-500/20 hover:bg-zinc-700 jelly-pop"
                    >
                      Unduh .TXT
                    </button>
                    <button 
                      onClick={copyToClipboard}
                      className={`flex items-center justify-center gap-3 text-[10px] md:text-[11px] font-black px-8 md:px-12 py-4 md:py-5 rounded-2xl md:rounded-[2rem] transition-all uppercase tracking-[0.3em] md:tracking-[0.4em] shadow-2xl jelly-pop ${
                        copied ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-zinc-100 hover:-translate-y-1'
                      }`}
                    >
                      {copied ? 'Berhasil' : 'Salin Prompt'}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 md:p-12 flex-1 flex flex-col">
                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-10 md:space-y-14 text-center">
                    <div className="relative w-32 h-32 md:w-48 md:h-48">
                      <div className="absolute inset-0 border-[3px] md:border-[4px] border-amber-500/5 rounded-full scale-125"></div>
                      <div className="absolute inset-0 border-t-[4px] md:border-t-[5px] border-amber-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-6 md:inset-8 border-[1.5px] md:border-[2px] border-amber-500/10 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl md:text-6xl animate-bounce">🧬</span>
                      </div>
                    </div>
                    <div className="space-y-4 md:space-y-6">
                      <p className="text-white text-2xl md:text-4xl font-black tracking-tighter uppercase italic">Sintesis Kilat Aktif...</p>
                      <div className="flex justify-center gap-3 md:gap-4">
                        {[1,2,3,4,5].map(i => <div key={i} className="w-2 md:w-2.5 h-2 md:h-2.5 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}}></div>)}
                      </div>
                    </div>
                  </div>
                ) : result ? (
                  <div className="animate-in fade-in zoom-in-95 duration-700 h-full flex flex-col">
                    <div className="flex-1 bg-zinc-950/90 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-zinc-800/50 text-sm md:text-base text-zinc-200 leading-relaxed font-semibold overflow-y-auto custom-scrollbar selection:bg-amber-500/40 whitespace-pre-wrap italic shadow-2xl">
                      {getFullPrompt()}
                    </div>
                    <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
                      <div className="bg-zinc-800/30 p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-zinc-800/50 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 md:w-2 h-full bg-amber-500 group-hover:w-2.5 md:group-hover:w-3 transition-all"></div>
                        <p className="text-[9px] md:text-[11px] font-black text-amber-500 uppercase tracking-widest mb-2 md:mb-3">HD Clarity Shield</p>
                        <p className="text-[10px] md:text-[12px] text-zinc-500 font-bold uppercase">Crystal Clear &bull; 8K RAW Optimized</p>
                      </div>
                      <div className="bg-zinc-800/30 p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-zinc-800/50 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 md:w-2 h-full bg-blue-500 group-hover:w-2.5 md:group-hover:w-3 transition-all"></div>
                        <p className="text-[9px] md:text-[11px] font-black text-blue-500 uppercase tracking-widest mb-2 md:mb-3">Sinyal Suasana</p>
                        <p className="text-[10px] md:text-[12px] text-zinc-500 font-bold uppercase truncate">Terdeteksi: {result.detectedMood}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-zinc-900 text-center space-y-8 md:space-y-12">
                    <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-zinc-900/40 border border-zinc-800/50 flex items-center justify-center relative group">
                      <div className="absolute inset-0 rounded-full border-4 border-amber-500/5 group-hover:border-amber-500/10 animate-ping transition-all"></div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 md:h-32 md:w-32 opacity-10 group-hover:opacity-20 transition-all duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-[12px] uppercase tracking-[0.8em] md:tracking-[1.2em] font-black opacity-30 mb-3 md:mb-4">Menunggu Sinkronisasi Sinyal</p>
                      <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em] font-bold text-zinc-800 italic">Jaringan Elite Global &bull; harunstudio.ai</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {history.length > 0 && (
          <div className="mt-32 space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-[0.4em] flex items-center gap-4">
                <span className="w-12 h-[2px] bg-amber-500"></span>
                Riwayat Sintesis
              </h2>
              <button 
                onClick={clearHistory}
                className="text-[10px] font-black text-zinc-600 hover:text-red-500 uppercase tracking-widest transition-colors"
              >
                Hapus Semua
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => restoreHistory(item)}
                  className="group relative aspect-[3/4] rounded-3xl overflow-hidden border border-zinc-800/50 cursor-pointer hover:border-amber-500/50 transition-all"
                >
                  <img src={item.imagePreview} alt="History" className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest truncate">{item.subjectType}</p>
                    <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-tighter">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <footer className="mt-48 pb-32 border-t border-zinc-900/50 pt-32 text-center space-y-12">
        <div className="flex justify-center flex-wrap gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-1000">
          <span className="text-[12px] font-black tracking-[0.6em] uppercase text-zinc-400 underline underline-offset-8 decoration-amber-500/20">Gemini 3 Pro</span>
          <span className="text-[12px] font-black tracking-[0.6em] uppercase text-zinc-400">Neural Engine v1.5.5</span>
          <span className="text-[12px] font-black tracking-[0.6em] uppercase text-zinc-400">Global Harun Studio</span>
        </div>
        <p className="text-amber-500/10 text-[11px] font-black tracking-[1.5em] uppercase animate-pulse">Elite Access Restricted &bull; 2024 &bull; Synthesis Authorized</p>
      </footer>
    </div>
  );
};

export default App;