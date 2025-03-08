"use client";

import React, { useState, useEffect } from 'react';

export default function TimeDisplay() {
  const [currentTime, setCurrentTime] = useState(() => {
    // Initialize with PST time
    return new Date(new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
  });
  
  useEffect(() => {
    const timer = setInterval(() => {
      // Update with PST time every 10 seconds
      setCurrentTime(new Date(new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"})));
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(timer);
  }, []);
  
  // Determine background image based on time of day
  const hour = currentTime.getHours();
  
  let backgroundImage = 'bay-area-day.png';
  
  if (hour >= 5 && hour < 8) {
    // Early morning (sunrise)
    backgroundImage = 'bay-area-sunset.png';
  } else if (hour >= 8 && hour < 17) {
    // Daytime
    backgroundImage = 'bay-area-day.png';
  } else if (hour >= 17 && hour < 20) {
    // Evening (sunset)
    backgroundImage = 'bay-area-sunset.png';
  } else {
    // Night
    backgroundImage = 'bay-area-night.png';
  }
  
  const dayOfWeek = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const month = currentTime.toLocaleDateString('en-US', { month: 'long' });
  const day = currentTime.getDate();
  const daySuffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 || Math.floor(day / 10) === 1) ? 0 : day % 10];
  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  
  return (
    <div style={{backgroundImage: `url(/images/projects/${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center'}} className="isolate relative flex flex-col md:col-span-3 col-span-1 h-[276px] bg-slate-50 rounded-3xl md:p-6 p-4 items-center justify-start gap-6 border border-slate-200 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.17),0px_4px_4px_-2px_rgba(0,0,0,0.15),0px_-1px_0px_0px_rgba(0,0,0,0.15)_inset,0px_1px_1px_0px_rgba(255,255,255,0.15)_inset] overflow-hidden">
      
      <div className={`absolute flex inset-[2px] h-1/3 items-center justify-center bg-gradient-to-b from-white/80  to-white/10 rounded-t-[22px] rounded-b-[12px] z-20 rounded-3xl`}></div>
      
      <div className={`absolute flex inset-0 bg-black/20 backdrop-blur-[2px] items-center justify-center z-0 rounded-3xl`}></div>
        
        <div className="relative w-full space-y-1">
          <div className="relative w-full font-medium text-base font-mono text-white"> Based out of</div>
          <div className="relative w-full font-semibold text-3xl font-mono text-white"> Bay Area, CA</div>
        </div>

        <div className="relative w-full space-y-1">
          <div className="relative w-full font-medium text-base font-mono text-white">
            {dayOfWeek}, {month} {day}{daySuffix}
          </div>
          <div className="relative w-full font-semibold text-3xl font-mono text-white">
            {formattedTime}
          </div>
        </div>
      
    </div>
  );
} 