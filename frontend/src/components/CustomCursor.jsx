import React, { useEffect, useState } from 'react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -200, y: -200 });
  const [isDesktop, setIsDesktop] = useState(true);
  
  useEffect(() => {
    // Only show on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsDesktop(false);
      return;
    }

    const handleMouseMove = (e) => {
      // Use requestAnimationFrame for smoother performance
      requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!isDesktop) return null;

  return (
    <div 
      className="mouse-aura" 
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px` 
      }} 
    />
  );
};

export default CustomCursor;
