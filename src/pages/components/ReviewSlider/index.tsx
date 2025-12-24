"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

interface Review {
  id: string;
  name: string;
  practiceName: string;
  initial: string;
  text: string;
  rating: number;
  color: string;
  createdAt?: string;
}

export default function ReviewSlider() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [index, setIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CARDS_PER_VIEW = 3;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/reviews/get-reviews');
        const data = await response.json();
        
        if (data.success && data.data) {
          setReviews(data.data);
        } else {
          setError('Failed to load reviews');
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const next = () => {
    if (reviews.length === 0) return;
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
    if (isPaused || reviews.length === 0) return;

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
  }, [isPaused, reviews.length]);

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

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#C3EAE7]"></div>
            <p className="mt-4 text-gray-600">Loading reviews...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!isLoading && !error && reviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No reviews available yet.</p>
          </div>
        )}

        {!isLoading && !error && reviews.length > 0 && (
        <>
        <div className="relative w-full px-12">
          <button
            onClick={() => {
              prev();
              setIsPaused(true);
              setTimeout(() => setIsPaused(false), 15000); 
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
                  key={rev.id}
                  className="min-w-[calc(33.33%-1rem)] relative"
                  onMouseEnter={() => handleMouseEnter(i)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className={`relative bg-gradient-to-br from-white to-gray-50 p-6 rounded-3xl shadow-lg transition-all duration-500 h-full border-2 ${
                    hoveredIndex === i 
                      ? 'transform -translate-y-3 shadow-2xl scale-105 border-[#C3EAE7]' 
                      : 'border-transparent hover:shadow-xl hover:border-[#C3EAE7]/30'
                  }`}>
                    <div className="absolute -top-4 -left-4 bg-gradient-to-br from-[#4FD1C5] to-[#2BA89F] p-3 rounded-2xl shadow-xl">
                      <Quote className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex gap-1 mb-4 justify-center">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star
                          key={idx}
                          size={20}
                          className="text-yellow-400 fill-yellow-400 drop-shadow-md transition-transform hover:scale-125"
                          style={{ 
                            animationDelay: `${idx * 0.1}s`,
                            filter: 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3))'
                          }}
                        />
                      ))}
                    </div>

                    <div className="relative mb-5">
                      <p className="text-gray-700 text-sm leading-relaxed min-h-[60px] text-center italic font-medium px-2">
                        "{rev.text}"
                      </p>
                    </div>

                    <div className="flex items-center justify-center mb-5">
                      <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-[#C3EAE7] to-transparent rounded-full"></div>
                      <div className="w-2 h-2 bg-gradient-to-br from-[#C3EAE7] to-[#4FD1C5] rounded-full mx-2 shadow-md"></div>
                      <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-[#4FD1C5] to-transparent rounded-full"></div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-[#4FD1C5] to-[#2BA89F] flex items-center justify-center font-bold text-white text-2xl shadow-xl ring-4 ring-white transform transition-all duration-300 ${
                        hoveredIndex === i ? 'scale-110 rotate-6 shadow-2xl' : ''
                      }`} style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                        {rev.initial || rev.name.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C3EAE7] to-[#4FD1C5] px-3 py-1 rounded-full shadow-md">
                          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                          </svg>
                          <span className="text-xs font-semibold text-white tracking-wide">Dental Nurse</span>
                        </div>
                        
                        <p className="font-bold text-gray-900 text-base tracking-tight">{rev.name}</p>
                        
                        <div className="inline-flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full shadow-sm border border-gray-200">
                          <svg className="w-3.5 h-3.5 text-[#4FD1C5]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.447.894l-3.553-1.776-3.553 1.776A1 1 0 014 16V4zm4 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd"/>
                          </svg>
                          <p className="text-xs text-gray-700 font-semibold">{rev.practiceName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[#C3EAE7]/20 via-[#4FD1C5]/10 to-transparent rounded-tl-full"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-[#4FD1C5]/5 to-transparent rounded-br-full"></div>
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
            {reviews.length > CARDS_PER_VIEW && Array.from({ length: Math.max(1, reviews.length - CARDS_PER_VIEW + 1) }).map((_, i) => (
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
        </>
        )}
      </div>
    </section>
  );
}
