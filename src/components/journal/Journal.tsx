"use client";

import { GridBackground } from "./GridBackground";
import Book from "./Book";


export function Journal() {
  
  
  const pageWidth = 24*16;
  const pageHeight = 24*22;

  return (
    <div>
      <Book 
        pageWidth={pageWidth}
        pageHeight={pageHeight}
        

        pages={[
          {
            front: <div className="relative isolate text-center h-full bg-linear-to-bl from-stone-700 to-stone-900 rounded-lg shadow-[inset_-2px_2px_2px_rgba(255,255,255,0.1)] overflow-hidden">
              
              
              
              <div className="absolute inset-y-0 z-10 w-0.5 bg-black/80 blur-[2px]"></div>
              <div className="absolute inset-y-0 z-10 left-1 w-0.5 bg-linear-to-l from-white/50 to-black blur-xs"></div>
              <div className="absolute right-0 bottom-0 z-10 size-10 bg-linear-to-br from-transparent via-transparent via-50% to-white/20 blur-xs"></div>
              
              {/* Page Content */}
              <div className="relative z-20 h-full flex flex-col p-4 font-black text-4xl items-center justify-center text-white/80 ">
                
                <img 
                  src="/images/About/Name-Sticker.webp" 
                  alt="Hello, my name is Shreyas" 
                  className="z-[1] size-60 absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 object-contain"
                />

                {/* <img 
                  src="/images/About/Golden-Gate-Bridge-sticker.webp" 
                  alt="Golden Gate Bridge sticker" 
                  className="z-[2] size-32 absolute top-1/3 right-0 -translate-y-1/2 object-contain"
                /> */}
                
                <div className="z-0 absolute inset-0"></div>
              </div>

              

            </div>,

            back: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-100 shadow-[inset_1px_-1px_2px_rgba(0,0,0,0.3),inset_2px_2px_2px_rgba(255,255,255,1)] rounded-r-lg rounded-l-2xl overflow-hidden">
              
              <div className="absolute inset-0">

              <img 
                    src="/images/About/Gojo-meme-sticker.webp"
                    alt="Shreyas Patil"
                   
                    className=" z-[1]  absolute top-1/2 -translate-y-1/2 -right-1/2 object-cover"
                  />
                  

                <GridBackground
                  rows={22}
                  columns={16}
                  color="rgba(0, 0, 0, 0.05)"
                  className=""
                />
              </div>
              
            </div>,
          },
          {
            front: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-100 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_-2px_2px_2px_rgba(255,255,255,1)] rounded-l-lg rounded-r-2xl overflow-hidden" >
              <div className="absolute inset-0">

              <img 
                    src="/images/About/Gojo-meme-sticker.webp"
                    alt="Shreyas Patil"
                   
                    className=" z-[1]  absolute top-1/2 -translate-y-1/2 -left-1/2 object-cover"
                  />

                <GridBackground
                  rows={22}
                  columns={16}
                  color="rgba(0, 0, 0, 0.05)"
                  className=""
                />
              </div>
              <div className="relative z-20 h-full flex items-center justify-center">Page 2 — Front</div>
            </div>,
            back: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-200 shadow-[inset_1px_-1px_2px_rgba(0,0,0,0.3),inset_2px_2px_2px_rgba(255,255,255,1)] rounded-r-lg rounded-l-2xl overflow-hidden">
              <div className="absolute inset-0">
                <GridBackground
                  rows={22}
                  columns={16}
                  color="rgba(0, 0, 0, 0.05)"
                  className=""
                />
              </div>
              <div className="relative z-20 h-full flex items-center justify-center">Page 2 — Back</div>
            </div>,
          },
          {
            front: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-100 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_-2px_2px_2px_rgba(255,255,255,1)] rounded-l-lg rounded-r-2xl overflow-hidden">
              <div className="absolute inset-0">
                <GridBackground
                  rows={22}
                  columns={16}
                  color="rgba(0, 0, 0, 0.05)"
                  className=""
                />
              </div>
              <div className="relative z-20 h-full flex items-center justify-center">Page 3 — Front</div>
            </div>,
            back: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-200 shadow-[inset_1px_-1px_2px_rgba(0,0,0,0.3),inset_2px_2px_2px_rgba(255,255,255,1)] rounded-r-lg rounded-l-2xl overflow-hidden">
              <div className="absolute inset-0">
                <GridBackground
                  rows={22}
                  columns={16}
                  color="rgba(0, 0, 0, 0.05)"
                  className=""
                />
              </div>
              <div className="relative z-20 h-full flex items-center justify-center">Page 3 — Back</div>
            </div>,
          },
          {
            front: <div className="relative text-center h-full w-full bg-linear-to-bl from-stone-50 to-stone-100 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_-2px_2px_2px_rgba(255,255,255,1)] rounded-l-lg rounded-r-2xl overflow-hidden">
              <div className="absolute inset-0">
                <GridBackground
                  rows={22}
                  columns={16}
                  color="rgba(0, 0, 0, 0.05)"
                  className=""
                />
              </div>
              <div className="relative z-20 h-full flex items-center justify-center">Page 4 — Front</div>
            </div>,
            back: <div className="relative isolate text-center h-full bg-linear-to-bl from-stone-700 to-stone-900 rounded-lg shadow-[inset_-2px_2px_4px_rgba(255,255,255,0.1)] overflow-hidden">
              
              <div className="absolute inset-0 z-10 bg-linear-to-bl from-white/0 from-0% via-white/10 via-30%  to-stone-900/20 rounded-lg opacity-50" ></div>
              <div className="absolute inset-y-0 z-10 w-0.5 bg-black/80 blur-[2px]"></div>
              <div className="absolute inset-y-0 z-10 left-1 w-0.5 bg-linear-to-l from-white/50 to-black blur-xs"></div>
              
            </div>,
          },
        ]} 
      />
    </div>
  );
}

