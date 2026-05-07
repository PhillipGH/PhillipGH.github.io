import { STARTER_DICE, TDie } from "./Dice";
import { DiceList } from "./RewardsPhase";
// import React from 'react';

export type TGameStats = {
  totalWords: number;
  longestWords: string[];
  highestWordScoreWord: string;
  highestWordScore: number;
  currentLevel: number;
  currentLevelScore: number;
  currentLevelRequiredScore: number;
  nLetterWords: { [i: number]: number };
  isWin?: boolean;
};

 export const STARTING_STATS: TGameStats = {
    totalWords: 0,
    longestWords: [''],
    highestWordScoreWord: '',
    highestWordScore: 0,
    currentLevel: 0,
    currentLevelScore: 0,
    currentLevelRequiredScore: 0,
    nLetterWords: {},
  };

export function GameStats(props: { stats: TGameStats }) {
  const maxNLetterWords = Math.max(...Object.values(props.stats.nLetterWords), 1);
  
  const nLetterWords = Object.keys(props.stats.nLetterWords)
    .map(Number)
    .sort()
    .map((i: number) => {
      const count = props.stats.nLetterWords[i];
      const percentage = (count / maxNLetterWords) * 100;
      return (
        <tr key={i}>
          <td>{i}-Letter Words</td>
          <td>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  height: '20px',
                  width: `${percentage}%`,
                  backgroundColor: '#4CAF50',
                  borderRadius: '4px',
                  minWidth: percentage > 0 ? '4px' : '0px',
                }}
              />
              <span>{count}</span>
            </div>
          </td>
        </tr>
      );
    });

  return (
    <table id="letterTable">
      <tbody>
        {props.stats.currentLevel !== 0 && <>
        <tr>
          <td>Level Reached</td>
          <td>{props.stats.currentLevel}</td>
        </tr>
        <tr>
          <td>Level {props.stats.currentLevel} Score</td>
          <td>
            {props.stats.currentLevelScore} /{" "}
            {props.stats.currentLevelRequiredScore}
          </td>
        </tr>
        </>}
        <tr>
          <td>Longest Word{props.stats.longestWords.length > 1 && "s"}</td>
          <td>{props.stats.longestWords.join(", ").toUpperCase()}</td>
        </tr>
        <tr>
          <td>Highest Scoring Word</td>
          <td>
            {props.stats.highestWordScoreWord.toUpperCase()} (
            {props.stats.highestWordScore})
          </td>
        </tr>
        {nLetterWords}
        <tr>
          <td>Total Words</td>
          <td>{props.stats.totalWords}</td>
        </tr>
      </tbody>
    </table>
  );
}

export function GameStatsView(props: {
  stats: TGameStats;
  dice: TDie[];
  onRestart: () => void;
}) {
  const isWin = props.stats.isWin === true;
  const header = isWin ? <h1>🏆 You Win! 🏆</h1> : <h1>Game Over!</h1>;
  return (
    <div>
      {header}
      <button
        onClick={() => {
          props.onRestart();
        }}
      >
        Return to Menu
      </button>
      <h2>Stats:</h2>
      <GameStats stats={props.stats} />
      <h2>Added Dice:</h2>
      <DiceList dice={props.dice.slice(STARTER_DICE.length).reverse()} />
    </div>
  );
}
