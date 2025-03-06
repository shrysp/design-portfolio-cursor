"use client";

import { useEffect, useState, useRef } from "react";

interface VerticalCarouselProps {
  images: string[];
  autoScrollInterval?: number; // in milliseconds
}

export default function VerticalCarousel({ 
  images, 
  autoScrollInterval = 5000 
}: VerticalCarouselProps) {
  const [position, setPosition] = useState(0);
  const [noTransition, setNoTransition] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create a continuous array of images for seamless scrolling
  // We need enough copies to ensure we never see empty space
  const allImages = [...images, ...images, ...images];
  
  // Auto-scroll functionality
  useEffect(() => {
    const totalImages = images.length;
    
    // Function to handle the continuous scroll
    const scrollToNextPosition = () => {
      // Move to the next position
      const nextPosition = position + 1;
      setPosition(nextPosition);
      
      // When we've scrolled through one complete set of images,
      // reset the position to maintain the illusion of infinite scrolling
      if (nextPosition >= totalImages) {
        // Wait for the animation to complete before resetting
        setTimeout(() => {
          // Reset without animation
          setNoTransition(true);
          setPosition(0);
          
          // Re-enable transitions after a short delay
          setTimeout(() => {
            setNoTransition(false);
          }, 50);
        }, 400); // Match this with the transition duration
      }
    };
    
    // Start the interval
    intervalRef.current = setInterval(scrollToNextPosition, autoScrollInterval);
    
    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [position, images.length, autoScrollInterval]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div 
        className="flex flex-col h-full"
        style={{ 
          transform: `translateY(-${position * 100}%)`,
          transition: noTransition ? 'none' : 'transform 400ms ease-in-out'
        }}
      >
        {/* Render all images */}
        {allImages.map((image, i) => (
          <div 
            key={`image-${i}`}
            className="w-full h-full flex-shrink-0"
          >
            <img
              src={image}
              alt={`Hobby ${(i % images.length) + 1}`}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        ))}
      </div>
    </div>
  );
} 