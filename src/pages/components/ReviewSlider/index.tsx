"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Subani B.",
    initial: "S",
    text: "Vonnesia has assisted me many times. She is efficient and professional.",
    rating: 5,
    color: "from-purple-400 to-pink-400",
  },
  {
    name: "N K.",
    initial: "N",
    text: "Great website, very easy to use and beneficial for clinics and nurses.",
    rating: 5,
    color: "from-blue-400 to-cyan-400",
  },
  {
    name: "Prabhdeep S.",
    initial: "P",
    text: "Great experience using Locum Loop. Nurses are easy to book and very helpful.",
    rating: 5,
    color: "from-green-400 to-emerald-400",
  },
  {
    name: "Daniel R.",
    initial: "D",
    text: "Amazing service! Super professional and reliable. Highly recommended.",
    rating: 5,
    color: "from-orange-400 to-red-400",
  },
  {
    name: "Samantha",
    initial: "S",
    text: "Easy booking and great communication. Will use again!",
    rating: 5,
    color: "from-pink-400 to-rose-400",
  },
  {
    name: "Chris L.",
    initial: "C",
    text: "Smooth and fast service every single time.",
    rating: 5,
    color: "from-indigo-400 to-purple-400",
  },
  {
    name: "John Doe",
    initial: "J",
    text: "Great experience using Laks Dent. Nurses are easy to book and very helpful.",
    rating: 5,
    color: "from-teal-400 to-cyan-400",
  },
  {
    name: "Jane S.",
    initial: "J",
    text: "Great service! Very professional and reliable.",
    rating: 5,
    color: "from-amber-400 to-orange-400",
  },
  {
    name: "Karan S.",
    initial: "K",
    text: "Great website, very easy to use and beneficial for clinics and nurses.",
    rating: 5,
    color: "from-violet-400 to-purple-400",
  },
];

export default function ReviewSlider() {
  const [index, setIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const CARDS_PER_VIEW = 3;

  const next = () => {
    if (index < reviews.length - CARDS_PER_VIEW) {
      setIndex(index + 1);
    } else {
      setIndex(0);
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setIndex((prevIndex) => {
        if (prevIndex < reviews.length - CARDS_PER_VIEW) {
          return prevIndex + 1;
        } else {
          return 0; 
        }
      });
    }, 10000); 

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleMouseEnter = (i: number) => {
    setHoveredIndex(i);
    setIsPaused(true); 
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setIsPaused(false); 
  };

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute top-10 right-10 w-72 h-72 bg-[#C3EAE7]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#C3EAE7]/20 px-4 py-2 rounded-full mb-4">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-gray-700">Trusted by Professionals</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
            What Our <span className="bg-gradient-to-r from-[#4FD1C5] to-[#C3EAE7] bg-clip-text text-transparent">Clients Say</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Real feedback from healthcare professionals using LocumLux
          </p>
        </div>

        <div className="relative w-full px-12">
          <button
            onClick={() => {
              prev();
              setIsPaused(true);
              setTimeout(() => setIsPaused(false), 15000); // Resume after 15s
            }}
            disabled={index === 0}
            className={`absolute -left-2 top-1/2 -translate-y-1/2 bg-white shadow-xl p-3 rounded-full z-20 transition-all duration-300 ${
              index === 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-110 hover:shadow-2xl hover:bg-gradient-to-r hover:from-[#C3EAE7] hover:to-[#4FD1C5]'
            }`}
          >
            <ChevronLeft size={28} className={index === 0 ? 'text-gray-400' : 'text-gray-700'} />
          </button>

          <div className="overflow-hidden py-4">
            <div
              className="flex gap-6 transition-transform duration-700 ease-out"
              style={{
                transform: `translateX(-${index * (100 / CARDS_PER_VIEW)}%)`,
              }}
            >
              {reviews.map((rev, i) => (
                <div
                  key={i}
                  className="min-w-[calc(33.33%-1rem)] relative"
                  onMouseEnter={() => handleMouseEnter(i)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className={`relative bg-white p-8 rounded-2xl shadow-lg transition-all duration-500 h-full border border-gray-100 ${
                    hoveredIndex === i 
                      ? 'transform -translate-y-2 shadow-2xl scale-105' 
                      : 'hover:shadow-xl'
                  }`}>
                    <div className="absolute -top-4 -left-4 bg-gradient-to-br from-[#C3EAE7] to-[#4FD1C5] p-3 rounded-xl shadow-lg">
                      <Quote className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex gap-1 mb-4 justify-center">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star
                          key={idx}
                          size={20}
                          className="text-yellow-400 fill-yellow-400 drop-shadow-sm animate-pulse"
                          style={{ animationDelay: `${idx * 0.1}s` }}
                        />
                      ))}
                    </div>

                    <div className="relative">
                      <p className="text-gray-700 text-base leading-relaxed mb-6 min-h-[80px] text-center italic">
                        "{rev.text}"
                      </p>
                    </div>

                    <div className="w-16 h-1 bg-gradient-to-r from-[#C3EAE7] to-[#4FD1C5] mx-auto mb-6 rounded-full"></div>

                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${rev.color} flex items-center justify-center font-bold text-white text-xl shadow-lg transform transition-transform duration-300 ${
                        hoveredIndex === i ? 'scale-110 rotate-6' : ''
                      }`}>
                        {rev.initial}
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-900 text-lg">{rev.name}</p>
                      </div>
                    </div>

                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[#C3EAE7]/10 to-transparent rounded-tl-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              next();
              setIsPaused(true);
              setTimeout(() => setIsPaused(false), 15000); 
            }}
            className={`absolute -right-2 top-1/2 -translate-y-1/2 bg-white shadow-xl p-3 rounded-full z-20 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:bg-gradient-to-r hover:from-[#4FD1C5] hover:to-[#C3EAE7]`}
          >
            <ChevronRight size={28} className="text-gray-700" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: reviews.length - CARDS_PER_VIEW + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`transition-all duration-300 rounded-full ${
                index === i 
                  ? 'w-8 h-3 bg-gradient-to-r from-[#4FD1C5] to-[#C3EAE7]' 
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
