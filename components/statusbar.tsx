'use client'

import Image from 'next/image';
import { HighScoreProp } from '@/types';
import { useEffect, useRef, useState } from 'react';


interface StatusBarProps extends HighScoreProp {
  onRestart: () => void;
}

export default function StatusBar({ highScore, onRestart }: StatusBarProps) {

  const [playerIsReady, setPlayerIsReady] = useState<boolean>(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (
        key === 'arrowup' ||
        key === 'arrowdown' ||
        key === 'arrowleft' ||
        key === 'arrowright' ||
        key === 'w' ||
        key === 'a' ||
        key === 's' ||
        key === 'd'
      ) {
        setPlayerIsReady(true);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      touchStartRef.current = { x: t.clientX, y: t.clientY };
    };

    const onTouchEnd = (e: TouchEvent) => {
      const start = touchStartRef.current;
      if (!start) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      const threshold = 20;
      if (Math.max(Math.abs(dx), Math.abs(dy)) > threshold) {
        setPlayerIsReady(true);
      }
      touchStartRef.current = null;
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 md:flex-row justify-between items-center h-15 box-border mx-2">
      <div className="flex flex-row gap-2 items-center">
        <div className="flex relative w-12 h-12 overflow-hidden">
          <Image
            src="/snakeHeroLogo.png"
            fill
            className="object-contain object-center"
            alt="Green Snake" />
        </div>
        <div className="text-2xl text-amber-200">
          SnakeGame
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-5 items-center">
        <div className=" text-amber-200 text-xl">Score <span className="font-bold">{highScore}</span></div>
        <div className="flex flex-col items-center">
          <button
            onClick={() => { setPlayerIsReady(false); onRestart(); }}
            className="flex flex-row items-center justify-center bg-gray-800 text-white gap-2 px-4 py-2 cursor-pointer hover:bg-gray-700/90 transition-colors rounded"
          >
            <Image
              src="/refresh.png"
              width={20}
              height={20}
              alt="Refresh icon"
              className="inline-block" />
            Restart
          </button>

          {!playerIsReady && (
            <div className="mt-2 text-sm text-amber-200 text-center">
              <span>Use </span>
              <span className="font-semibold text-white">Arrow keys</span>
              <span> or </span>
              <span className="font-semibold text-white">WASD</span>
              <span> to play — or </span>
              <span className="font-semibold text-white">swipe in the rectangle</span>
              <span> to play.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
