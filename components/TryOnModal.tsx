import React, { useState, useRef } from 'react';
import { User, Product, ImageResolution } from '../types';
import { generateTryOnImage } from '../services/geminiService';
import { X, Upload, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface TryOnModalProps {
  product: Product;
  user: User | null;
  guestUsageCount: number;
  onClose: () => void;
  onIncrementUsage: () => void;
  onRequestSignup: () => void;
}

export const TryOnModal: React.FC<TryOnModalProps> = ({
  product,
  user,
  guestUsageCount,
  onClose,
  onIncrementUsage,
  onRequestSignup
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolution, setResolution] = useState<ImageResolution>(ImageResolution.RES_1K);
  const [isWomenConfirmed, setIsWomenConfirmed] = useState(false);

  const maxUsage = user ? 5 : 1;
  const currentUsage = user ? user.tryOnCount : guestUsageCount;
  const remaining = maxUsage - currentUsage;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!previewUrl || remaining <= 0) return;
    if (!isWomenConfirmed) {
        setError("Please confirm the image guidelines.");
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await generateTryOnImage(previewUrl, product.imageUrl, resolution);
      setGeneratedImage(result);
      onIncrementUsage();
    } catch (err: any) {
      setError(err.message || "Failed to generate try-on image.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="bg-white text-black rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row">
        
        {/* Left Side: Controls */}
        <div className="p-6 md:w-1/3 border-r border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-serif font-bold">Virtual Try-On</h3>
             {/* Mobile Close Button */}
             <button onClick={onClose} className="md:hidden p-1">
                <X size={24} />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            See yourself in the <span className="font-semibold">{product.name}</span>.
          </p>

          {!user && remaining <= 0 ? (
            <div className="bg-gold-400/20 border border-gold-400 p-4 rounded mb-4">
              <p className="text-sm mb-2">You have used your free guest try-on.</p>
              <button 
                onClick={onRequestSignup}
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
              >
                Sign Up for 5 More
              </button>
            </div>
          ) : (
            <div className="mb-4">
               <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                 Remaining Tries: {remaining} / {maxUsage}
               </p>
            </div>
          )}

          {remaining > 0 && (
              <>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">1. Upload Your Photo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition relative">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="h-32 mx-auto object-cover rounded" />
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center">
                                <Upload size={24} className="mb-2" />
                                <span className="text-xs">Click to upload (Full body works best)</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">2. Settings</label>
                     <select 
                        value={resolution} 
                        onChange={(e) => setResolution(e.target.value as ImageResolution)}
                        className="w-full border p-2 rounded text-sm mb-2"
                     >
                         <option value={ImageResolution.RES_1K}>Standard Quality (1K)</option>
                         <option value={ImageResolution.RES_2K}>High Quality (2K)</option>
                         <option value={ImageResolution.RES_4K}>Ultra Quality (4K)</option>
                     </select>
                </div>

                <div className="mb-4">
                     <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
                         <input 
                            type="checkbox" 
                            checked={isWomenConfirmed}
                            onChange={(e) => setIsWomenConfirmed(e.target.checked)}
                            className="mt-1"
                         />
                         <span>I confirm this image is for women's wear styling visualization.</span>
                     </label>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={!previewUrl || isLoading || !isWomenConfirmed}
                    className={`w-full py-3 rounded font-bold flex items-center justify-center gap-2 ${
                        !previewUrl || isLoading || !isWomenConfirmed ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-gold-500 text-white hover:bg-gold-600 shadow-lg'
                    }`}
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                    {isLoading ? 'Generating Look...' : 'Generate Look'}
                </button>
              </>
          )}

          {error && (
              <div className="mt-4 bg-red-50 text-red-600 p-3 rounded text-sm flex gap-2">
                  <AlertCircle size={16} className="mt-1 flex-shrink-0" />
                  {error}
              </div>
          )}
        </div>

        {/* Right Side: Result */}
        <div className="flex-1 bg-gray-100 flex flex-col relative min-h-[400px]">
           <button onClick={onClose} className="absolute top-4 right-4 bg-white/50 p-2 rounded-full hover:bg-white transition z-10 hidden md:block">
             <X size={24} />
           </button>
           
           <div className="flex-1 flex items-center justify-center p-4">
               {generatedImage ? (
                   <img src={generatedImage} alt="Virtual Try On Result" className="max-h-full max-w-full rounded shadow-xl object-contain" />
               ) : (
                   <div className="text-gray-400 text-center">
                       <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
                       <p>Your AI-generated look will appear here.</p>
                   </div>
               )}
           </div>
        </div>
      </div>
    </div>
  );
};
