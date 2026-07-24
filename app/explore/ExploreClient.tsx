"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MapPin, Star, Heart, ArrowRight, Grid, List as ListIcon } from 'lucide-react';
import Image from 'next/image';

// هذا المكون يفترض وجود بيانات Landmarks من Supabase
export default function ExploreClient({ landmarks = [] }: { landmarks?: any[] }) {
  const [filter, setFilter] = useState('الكل');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-[#05110f] pt-32 pb-20 px-6" dir="rtl">
      <div className="container mx-auto">
        
        {/* Header & Filter Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">استكشف ولاية الوادي</h1>
            <p className="text-gray-400">اكتشف أفضل المعالم السياحية والمواقع التاريخية</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none md:w-64">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="ابحث عن معلم..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-4 text-sm focus:border-amber-500 outline-none transition-all"
              />
            </div>
            <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:bg-white/10 transition-all">
              <Filter size={20} />
            </button>
            <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
              <button 
                onClick={() => setView('grid')}
                className={`p-2 rounded-xl transition-all ${view === 'grid' ? 'bg-amber-500 text-white' : 'text-gray-500'}`}
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => setView('list')}
                className={`p-2 rounded-xl transition-all ${view === 'list' ? 'bg-amber-500 text-white' : 'text-gray-500'}`}
              >
                <ListIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {['الكل', 'قصور تاريخية', 'واحات خضراء', 'مساجد أثرية', 'أسواق شعبية', 'متاحف'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                filter === cat 
                ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Landmarks Grid */}
        <div className={view === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" 
          : "flex flex-col gap-6"
        }>
          <AnimatePresence mode="popLayout">
            {/* Template Card - سيعمل هذا الجزء مع بيانات Supabase الفعلية */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <motion.div
                key={item}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className={`group relative bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.08] transition-all duration-500 ${view === 'list' ? 'flex flex-col md:flex-row' : ''}`}
              >
                <div className={`relative ${view === 'list' ? 'md:w-1/3 aspect-video md:aspect-auto' : 'aspect-[4/5]'}`}>
                  <Image 
                    src={`https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?q=80&w=600&auto=format&fit=crop`} 
                    alt="Landmark" 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <button className="absolute top-4 left-4 p-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-red-500 hover:border-red-500 transition-all">
                    <Heart size={18} />
                  </button>
                  <div className="absolute bottom-4 right-4 px-3 py-1 bg-amber-500 rounded-full text-[10px] font-bold text-black uppercase">
                    تاريخي
                  </div>
                </div>

                <div className="p-8 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold group-hover:text-amber-400 transition-colors">قصر خمانة</h3>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-bold">4.7</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
                      <MapPin size={14} />
                      <span>بلدية قمار، ولاية الوادي</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                      تحفة معمارية تعود للقرن الثامن عشر، تتميز بقبابها الفريدة ونقوشها الجبسية الأصيلة التي تحكي قصص الماضي.
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                    <div className="flex -space-x-2 space-x-reverse">
                      {[1, 2, 3].map((u) => (
                        <div key={u} className="w-8 h-8 rounded-full border-2 border-[#0D221F] overflow-hidden">
                          <Image src={`https://i.pravatar.cc/150?u=${u+10}`} alt="user" width={32} height={32} />
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-[#0D221F] bg-white/5 flex items-center justify-center text-[10px] text-gray-400">
                        +15
                      </div>
                    </div>
                    <button className="text-amber-400 text-sm font-bold flex items-center gap-2 group/btn">
                      التفاصيل <ArrowRight size={16} className="rotate-180 transition-transform group-hover/btn:-translate-x-1" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination Placeholder */}
        <div className="mt-20 flex justify-center gap-2">
          {[1, 2, 3].map((p) => (
            <button key={p} className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${p === 1 ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}