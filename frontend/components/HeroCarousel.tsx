import React, { useState, useEffect, useCallback } from 'react';

interface HeroCarouselProps {}

export const HeroCarousel: React.FC<HeroCarouselProps> = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const totalSlides = 3;

  const goToNext = useCallback(() => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(goToNext, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [goToNext]);

  const slides = [
    {
      img: 'img/slider-1.jpg',
      alt: 'Taekwondo action 1',
      title: 'Welcome to AP Taekwondo',
      description: 'Empowering youth. Promoting excellence.',
    },
    {
      img: 'img/slider-2.jpg',
      alt: 'Taekwondo action 2',
      title: 'Unite with Champions',
      description: 'State-level championships. National acclaim.',
    },
    {
      img: 'img/slider-3.jpg',
      alt: 'Taekwondo event 3',
      title: 'Join the Movement',
      description: 'Inclusive. Inspiring. For all ages.',
    },
  ];

  return (
    <section id="heroCarousel" className="relative mt-0 pt-0">
      <div className="relative overflow-hidden w-full" style={{ height: '430px' }}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
              index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img src={slide.img} className="block w-full h-full object-cover" alt={slide.alt} />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-center">
              <div className="px-4">
                <h2 className="font-bold font-montserrat text-4xl md:text-5xl mb-3">{slide.title}</h2>
                <p className="text-lg md:text-xl">{slide.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`w-3 h-3 rounded-full bg-white opacity-50 transition-opacity duration-300 ${
              index === activeIndex ? 'opacity-100' : ''
            }`}
            aria-current={index === activeIndex ? 'true' : 'false'}
            aria-label={`Slide ${index + 1}`}
            onClick={() => goToSlide(index)}
          ></button>
        ))}
      </div>

      {/* Controls */}
      <button
        className="absolute top-1/2 left-0 -translate-y-1/2 p-4 text-white text-3xl z-20 hover:bg-black hover:bg-opacity-20 transition-colors duration-200"
        type="button"
        onClick={goToPrev}
        aria-label="Previous"
      >
        <span className="bi bi-chevron-left" aria-hidden="true"></span>
        <span className="sr-only">Previous</span>
      </button>
      <button
        className="absolute top-1/2 right-0 -translate-y-1/2 p-4 text-white text-3xl z-20 hover:bg-black hover:bg-opacity-20 transition-colors duration-200"
        type="button"
        onClick={goToNext}
        aria-label="Next"
      >
        <span className="bi bi-chevron-right" aria-hidden="true"></span>
        <span className="sr-only">Next</span>
      </button>
    </section>
  );
};