import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/wedding1/1920/1080')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
        <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-wider mb-6 animate-fade-in-up uppercase drop-shadow-lg">
          Bush<span className="text-gold-400">Noor</span>
        </h1>
        <p className="font-sans text-xl md:text-2xl font-light tracking-widest uppercase mb-10 max-w-2xl text-gray-100 drop-shadow-md">
          Elegance Woven Into Every Thread
        </p>
        <div className="flex gap-4">
            <a href="#collection" className="bg-white text-black px-8 py-3 uppercase tracking-widest font-bold hover:bg-gold-400 hover:text-white transition-all duration-300 shadow-lg">
            Shop Now
            </a>
            <button 
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth'})}
                className="border-2 border-white text-white px-8 py-3 uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 font-semibold"
            >
            The Brand
            </button>
        </div>
      </div>
    </div>
  );
};