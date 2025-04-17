"use client";

import { useState, useEffect } from 'react';
import { UserCircle, Palette, Tabs, House } from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  const pathname = usePathname();

  // Reset clicked state once navigation is complete
  useEffect(() => {
    setClickedItem(null);
  }, [pathname]);

  // Map navigation items to icons
  const navIcons = [
    { icon: House, href: '/', name: 'Home' },
    { icon: Tabs, href: '/projects', name: 'Projects' },
    { icon: Palette, href: '/craft', name: 'Craft' },
    { icon: UserCircle, href: '/about', name: 'About' },
  ];

  return (
    <nav className="flex relative gap-3 mx-auto items-center justify-center px-2 py-1 w-fit bg-gradient-to-b from-white to-slate-50 rounded-full h-13 border border-slate-300 z-10 shadow-[0px_4px_4px_-1px_rgba(0,0,0,0.25),0px_1px_0px_0px_rgba(0,0,0,0.15)]">
      
      {navIcons.map((item, index) => {
        const isActiveByPath = item.href === '/' 
          ? pathname === '/' 
          : pathname.startsWith(item.href);
        
        // Item is active if it matches the current path OR it was just clicked
        const isActive = isActiveByPath || clickedItem === item.href;
        
        const Icon = item.icon;
        
        return (
          <Link 
            key={index} 
            href={item.href} 
            onClick={() => setClickedItem(item.href)}
            className={`group relative flex items-center justify-center ${isActive ? 'text-white/80' : 'text-slate-400'} size-[36px] border ${isActive ? 'border-blue-700' : 'border-slate-400'} ${isActive ? 'bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700' : 'bg-radial-[at_50%_75%] from-slate-100 via-slate-200 to-slate-300'} shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] rounded-full pointer-cursor
                                ${!isActive ? 'hover:bg-radial-[at_50%_75%] hover:from-slate-200 hover:via-slate-300 hover:to-slate-400 hover:border-slate-500 hover:text-slate-500 hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.17),0px_8px_8px_-4px_rgba(0,0,0,0.17),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset]' : 'hover:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_4px_-2px_rgba(0,0,0,0.17),0px_8px_8px_-4px_rgba(0,0,0,0.17),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset]'} transition-all duration-300
                                active:bg-radial-[at_50%_75%] active:from-blue-300 active:via-blue-500 active:to-blue-700 active:border-blue-700 active:text-white/80 active:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset]`}
          >
            <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b ${isActive ? 'from-white  to-white/20' : 'from-slate-100 via-slate-100/50 to-slate-100/10'} rounded-t-[60px] rounded-b-[12px] z-10 group-active:bg-gradient-to-b group-active:from-white/40 group-active:via-white/20 group-active:to-white/0`}></div>
            <Icon size={24} weight="fill" />
            {/* Navbar tooltip */}
            <div className={`absolute -top-[40px] opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transform transition-all duration-300 px-2 py-1 
              ${isActive 
                ? 'bg-radial-[at_50%_75%] from-blue-300 via-blue-500 to-blue-700 border-blue-700 text-white/80' 
                : 'bg-radial-[at_50%_75%] from-slate-100 via-slate-200 to-slate-300 border-slate-400 text-slate-500'} 
              text-xs font-semibold rounded-full border shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.25),0px_4px_8px_1px_rgba(10,10,10,0.15)_inset,0px_-2px_2px_0px_rgba(10,10,10,0.15)_inset] transition-all duration-300 z-100`}>
              {item.name}
              <div className={`absolute flex inset-[2px] h-1/2 items-center justify-center bg-gradient-to-b from-white to-white/20 rounded-t-[60px] rounded-b-[12px] z-10`}></div>
              
            </div>
          </Link>
        );
      })}

      

    </nav>
  );
} 