import Image from 'next/image';
import { HighScoreProp } from '@/types';

interface StatusBarProps extends HighScoreProp {
  onRestart: () => void;
}

export default function StatusBar({ highScore, onRestart }: StatusBarProps) {
  return (
    <div className="flex flex-row justify-between items-center h-15 box-border mx-2">
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
      <div className="flex flex-row gap-5 items-center">
        <div>Score <span className="font-bold">{highScore}</span></div>
        <div>
          <button
            onClick={onRestart}
            className="flex flex-row items-center content-center justify-center gap-2 w-37 min-w-30 cursor-pointer hover:bg-gray-800 transition-colors rounded"
          >
            <Image
              src="/refresh.png"
              width={20}
              height={20}
              alt="Refresh icon"
              className="py-3" />
            Restart
          </button>
        </div>
      </div>
    </div>
  );
}
