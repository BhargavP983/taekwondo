import React, { useState } from 'react';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: string;
}

const images: GalleryImage[] = [
  { id: 1, src: 'https://picsum.photos/id/100/400/300', alt: 'Training session 1', category: 'Training' },
  { id: 2, src: 'https://picsum.photos/id/101/400/300', alt: 'Competition action', category: 'Competitions' },
  { id: 3, src: 'https://picsum.photos/id/102/400/300', alt: 'Group photo', category: 'Events' },
  { id: 4, src: 'https://picsum.photos/id/103/400/300', alt: 'Belt promotion', category: 'Promotions' },
  { id: 5, src: 'https://picsum.photos/id/104/400/300', alt: 'Training session 2', category: 'Training' },
  { id: 6, src: 'https://picsum.photos/id/105/400/300', alt: 'Competition podium', category: 'Competitions' },
  { id: 7, src: 'https://picsum.photos/id/106/400/300', alt: 'Instructor demo', category: 'Training' },
  { id: 8, src: 'https://picsum.photos/id/107/400/300', alt: 'Award ceremony', category: 'Events' },
  { id: 9, src: 'https://picsum.photos/id/108/400/300', alt: 'Youth class', category: 'Training' },
];

const categories = ['All', 'Training', 'Competitions', 'Events', 'Promotions'];

export const GalleryPage: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<GalleryImage | null>(null);

  const filteredImages = filter === 'All' ? images : images.filter((img) => img.category === filter);

  const openLightbox = (image: GalleryImage) => {
    setCurrentImage(image);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImage(null);
  };

  return (
    <section className="container mx-auto py-10 px-4">
      <h1 className="text-center font-montserrat font-bold text-4xl text-primary mb-8">Our Gallery</h1>
      <p className="text-center text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
        Explore moments from our training sessions, competitions, events, and promotions.
      </p>

      {/* Category Filter */}
      <div className="flex justify-center flex-wrap gap-3 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`py-2 px-5 rounded-full font-montserrat font-semibold text-sm transition-colors duration-200
              ${filter === cat ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages.map((image) => (
          <div
            key={image.id}
            className="relative overflow-hidden rounded-lg shadow-lg cursor-pointer group transform hover:scale-105 transition-transform duration-300"
            onClick={() => openLightbox(image)}
          >
            <img src={image.src} alt={image.alt} className="w-full h-64 object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-xl font-bold font-montserrat">View</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && currentImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black bg-opacity-80 flex justify-center items-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img src={currentImage.src} alt={currentImage.alt} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-xl" />
            <button
              className="absolute top-4 right-4 text-white text-4xl hover:text-primary transition-colors duration-200 focus:outline-none"
              onClick={closeLightbox}
              aria-label="Close image"
            >
              <i className="bi bi-x-circle-fill"></i>
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-center py-3 px-4 rounded-b-lg">
              <p className="font-montserrat font-semibold text-lg">{currentImage.alt}</p>
              <p className="text-sm text-gray-300">Category: {currentImage.category}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};