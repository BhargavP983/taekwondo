import React, { useState } from 'react';

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  category: string;
}

const galleryItems: GalleryItem[] = [
  { id: 1, src: 'img/gallery-1.jpg', alt: 'Taekwondo Kicks', category: 'Training' },
  { id: 2, src: 'img/gallery-2.jpg', alt: 'Belt Ceremony', category: 'Events' },
  { id: 3, src: 'img/gallery-3.jpg', alt: 'Sparring Session', category: 'Training' },
  { id: 4, src: 'img/gallery-4.jpg', alt: 'Group Photo', category: 'Community' },
  { id: 5, src: 'img/gallery-5.jpg', alt: 'Medal Winners', category: 'Achievements' },
  { id: 6, src: 'img/gallery-6.jpg', alt: 'Kids Class', category: 'Training' },
  { id: 7, src: 'img/gallery-7.jpg', alt: 'Demonstration', category: 'Events' },
  { id: 8, src: 'img/gallery-8.jpg', alt: 'Coach and Student', category: 'Training' },
];

export const GalleryPage: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const categories = ['All', ...new Set(galleryItems.map(item => item.category))];

  const filteredItems = filter === 'All' ? galleryItems : galleryItems.filter(item => item.category === filter);

  const openLightbox = (item: GalleryItem) => {
    setSelectedImage(item);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;

    const currentIndex = filteredItems.findIndex(item => item.id === selectedImage.id);
    let newIndex = currentIndex;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % filteredItems.length;
    } else { // 'prev'
      newIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    }
    setSelectedImage(filteredItems[newIndex]);
  };

  return (
    <section className="container mx-auto py-8" id="gallery-page">
      <h1 className="text-center font-montserrat font-bold text-4xl mb-6 text-primary">Our Gallery</h1>
      <p className="text-center text-lg text-gray-700 mb-8">
        Explore moments from our training sessions, events, and achievements.
      </p>

      {/* Filter Buttons */}
      <div className="flex justify-center flex-wrap gap-3 mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            className={`py-2 px-5 rounded-full text-sm font-semibold transition-colors duration-200
              ${filter === cat ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-primary-light hover:text-primary'}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="relative group overflow-hidden rounded-lg shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300"
            onClick={() => openLightbox(item)}
          >
            <img
              src={item.src}
              alt={item.alt}
              className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-lg font-semibold">{item.category}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[1000] bg-black bg-opacity-75 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 text-white text-3xl z-10 hover:text-gray-300"
              onClick={closeLightbox}
              aria-label="Close image"
            >
              <i className="bi bi-x-lg"></i>
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-xl"
            />
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300"
              onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
              aria-label="Previous image"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300"
              onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
              aria-label="Next image"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
            <div className="absolute bottom-4 left-0 right-0 text-center text-white text-lg bg-black bg-opacity-50 p-2">
              {selectedImage.alt} ({selectedImage.category})
            </div>
          </div>
        </div>
      )}
    </section>
  );
};