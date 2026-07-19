'use client'
import { useState, useEffect, useRef, memo } from 'react'

import { Position, GameBoardProps } from '@/types';
import React from 'react';

function GameBoard({ highScore, setHighScore, onRestart }: GameBoardProps) {
  const [gameOn, setGameOn] = useState<boolean>(true);
  const baseInterval: number = 90;
  const boostedInterval: number = baseInterval / 2;

  const minWidth: number = 200;
  const minSnakeWidth: number = 5;
  const snakeWidthAdjustmentFactor: number = (minSnakeWidth * 100) / minWidth;

  const [snakeDirection, setSnakeDirection] = useState<string>('r');
  const [snakeBody, setSnakeBody] = useState<Position[]>([{ top: 50, left: 50 }]);
  const [foodPosition, setFoodPosition] = useState<Position>({ top: 50, left: 54 });

  const directionRef = useRef(snakeDirection);
  const tickRateRef = useRef(baseInterval);
  const snakeBodyRef = useRef(snakeBody);
  const foodPositionRef = useRef(foodPosition);
  const gameOnRef = useRef(gameOn);
  const highScoreRef = useRef(highScore);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => { gameOnRef.current = gameOn; }, [gameOn]);
  useEffect(() => { directionRef.current = snakeDirection; }, [snakeDirection]);
  useEffect(() => { snakeBodyRef.current = snakeBody; }, [snakeBody]);
  useEffect(() => { foodPositionRef.current = foodPosition; }, [foodPosition]);
  useEffect(() => { highScoreRef.current = highScore; }, [highScore]);

  function checkCollision(al: number, at: number, bl: number, bt: number): boolean {
    const ar = al + snakeWidthAdjustmentFactor;
    const ab = at + snakeWidthAdjustmentFactor;
    const br = bl + snakeWidthAdjustmentFactor;
    const bb = bt + snakeWidthAdjustmentFactor;
    return (ar > bl && al < br && at < bb && ab > bt);
  }

  function eatenSelf(currentBody: Position[]): boolean {
    const head: Position = currentBody[0];
    for (let i = 3; i < currentBody.length; i++) {
      if (checkIfAte(head, currentBody[i])) {
        return true;
      }
    }
    return false;
  }

  function isValidFoodPosition(l: number, t: number, body: Position[]): boolean {
    for (const part of body) {
      if (checkCollision(l, t, part.left, part.top)) return false;
    }
    return true;
  }

  function checkIfAte(s: Position, food: Position): boolean {
    return checkCollision(s.left, s.top, food.left, food.top);
  }

  useEffect(() => {
    if (!gameOnRef.current) return;
    let animationId: number;
    let lastTime = performance.now();
    let accumulator = 0;

    const loop = (now: number) => {
      if (!gameOnRef.current) return;
      const delta = now - lastTime;
      lastTime = now;
      accumulator += delta;

      const currentTickRate = tickRateRef.current;

      while (accumulator >= currentTickRate) {
        accumulator -= currentTickRate;

        const body = snakeBodyRef.current;
        const food = foodPositionRef.current;
        const direction = directionRef.current;
        const head = body[0];

        let newHead: Position;
        let wrapped = false;

        switch (direction) {
          case 'r':
            wrapped = head.left > 100 - snakeWidthAdjustmentFactor;
            newHead = { top: head.top, left: wrapped ? 0 : head.left + snakeWidthAdjustmentFactor };
            break;
          case 'l':
            wrapped = head.left <= snakeWidthAdjustmentFactor;
            newHead = { top: head.top, left: wrapped ? 100 - snakeWidthAdjustmentFactor : head.left - snakeWidthAdjustmentFactor };
            break;
          case 'u':
            wrapped = head.top <= snakeWidthAdjustmentFactor;
            newHead = { top: wrapped ? 100 - snakeWidthAdjustmentFactor : head.top - snakeWidthAdjustmentFactor, left: head.left };
            break;
          case 'd':
            wrapped = head.top > 100 - snakeWidthAdjustmentFactor;
            newHead = { top: wrapped ? 0 : head.top + snakeWidthAdjustmentFactor, left: head.left };
            break;
          default:
            newHead = head;
            break;
        }

        const haveEaten = checkIfAte(newHead, food);

        if (haveEaten) {
          setHighScore(highScoreRef.current + 1);

          const newBody = [newHead, ...body];
          snakeBodyRef.current = newBody;
          setSnakeBody(newBody);

          let newLeft: number, newTop: number;
          do {
            newLeft = Math.floor(Math.random() * 97) + 2;
            newTop = Math.floor(Math.random() * 97) + 2;
          } while (!isValidFoodPosition(newLeft, newTop, newBody));

          const newFood = { top: newTop, left: newLeft };
          foodPositionRef.current = newFood;
          setFoodPosition(newFood);
        } else {
          const newBody = [newHead, ...body];
          newBody.pop();
          snakeBodyRef.current = newBody;
          setSnakeBody(newBody);
        }

        if (eatenSelf(snakeBodyRef.current)) {
          console.log("self eat")
          setGameOn(false);
          return;
        }
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [setHighScore]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (!gameOnRef.current) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (directionRef.current !== 'd') {
            setSnakeDirection('u');
            tickRateRef.current = boostedInterval;
          }
          break;
        case 'ArrowDown':
        case 's':
          if (directionRef.current !== 'u') {
            setSnakeDirection('d');
            tickRateRef.current = boostedInterval;
          }
          break;
        case 'ArrowRight':
        case 'd':
          if (directionRef.current !== 'l') {
            setSnakeDirection('r');
            tickRateRef.current = boostedInterval;
          }
          break;
        case 'ArrowLeft':
        case 'a':
          if (directionRef.current !== 'r') {
            setSnakeDirection('l');
            tickRateRef.current = boostedInterval;
          }
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!gameOnRef.current) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'ArrowDown':
        case 's':
        case 'ArrowLeft':
        case 'a':
        case 'ArrowRight':
        case 'd':
          tickRateRef.current = baseInterval;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    if (!start) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = 20; // px

    if (Math.max(absX, absY) > threshold) {
      if (absX > absY) {
        if (dx > 0 && directionRef.current !== 'l') {
          setSnakeDirection('r');
          tickRateRef.current = boostedInterval;
        } else if (dx < 0 && directionRef.current !== 'r') {
          setSnakeDirection('l');
          tickRateRef.current = boostedInterval;
        }
      } else {
        if (dy > 0 && directionRef.current !== 'u') {
          setSnakeDirection('d');
          tickRateRef.current = boostedInterval;
        } else if (dy < 0 && directionRef.current !== 'd') {
          setSnakeDirection('u');
          tickRateRef.current = boostedInterval;
        }
      }
    }

    touchStartRef.current = null;
  };

  return (
    <div
      className="block w-full aspect-square border-red-50 overflow-hidden rounded-2xl border max-w-200 m-auto relative box-border"
      style={{ minWidth: `${minWidth}px`, touchAction: 'none' as React.CSSProperties['touchAction'] }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {snakeBody.map((body, index) => (
        <div
          key={index}
          className="aspect-square bg-white absolute translate-x-[-50%] translate-y-[-50%]"
          style={{
            left: `${body.left}%`,
            top: `${body.top}%`,
            minWidth: `${minSnakeWidth}px`,
            width: `${snakeWidthAdjustmentFactor}%`,
          }}
        />
      ))}

      <div
        className="aspect-square bg-white absolute translate-x-[-50%] translate-y-[-50%] animate-pulse"
        style={{
          left: `${foodPosition.left}%`,
          top: `${foodPosition.top}%`,
          minWidth: `${minSnakeWidth}px`,
          width: `${snakeWidthAdjustmentFactor}%`,
        }}
      />

      {!gameOn && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 text-white">
          <h2 className="text-3xl font-bold mb-2">Game Over</h2>
          <p className="text-xl">Score: {highScore}</p>
          <button
            onClick={onRestart}
            className="mt-4 px-4 py-2 bg-white text-black rounded font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Restart
          </button>
        </div>
      )}
    </div>
  )
}

export default memo(GameBoard);
