
import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File, base64: string, previewUrl: string) => void;
  currentPreview: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, currentPreview }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const base64Clean = base64.split(',')[1];
        onImageSelect(file, base64Clean, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {!currentPreview ? (
        <div 
          onClick={triggerInput}
          className="w-full aspect-[9/16] border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-zinc-900/50 transition-all group max-h-[600px] mx-auto"
        >
          <div className="p-4 bg-zinc-800 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-400 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-zinc-400 font-medium px-4 text-center">Klik untuk unggah referensi (9:16)</p>
          <p className="text-zinc-600 text-xs mt-2 italic">Potret Disarankan</p>
        </div>
      ) : (
        <div className="relative group rounded-xl overflow-hidden border border-zinc-800 aspect-[9/16] max-h-[600px] mx-auto">
          <img 
            src={currentPreview} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <button 
              onClick={triggerInput}
              className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors"
              title="Ganti Gambar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
