export interface HighScoreProp {
  highScore: number;
  setHighScore: (score: number) => void;
}

export interface Position {
  top: number,
  left: number
}

export interface GameBoardProps extends HighScoreProp {
  onRestart: () => void;
}