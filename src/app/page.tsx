'use client'
import { useState } from 'react'

import GameBoard from "../../components/gameboard"
import StatusBar from "../../components/statusbar"

export default function Home() {
  const [highScore, setHighScore] = useState<number>(0);
  const [gameKey, setGameKey] = useState<number>(0);

  const handleRestart = () => {
    setHighScore(0);
    setGameKey(prev => prev + 1);
  };

  return (
    <div className="border-box h-screen flex flex-col gap-2.5 box-border">
      <div>
        <StatusBar
          highScore={highScore}
          setHighScore={setHighScore}
          onRestart={handleRestart}
        />
      </div>
      <div className="border border-white flex-1 flex justify-center items-center">
        <GameBoard
          key={gameKey}
          highScore={highScore}
          setHighScore={setHighScore}
          onRestart={handleRestart}
        />
      </div>
    </div>
  )
}
