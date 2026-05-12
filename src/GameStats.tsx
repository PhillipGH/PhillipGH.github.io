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

const EXPECTED_MAX_WORDS = 100; // don't fill the bar unless they got a lot of words

export function GameStats(props: { stats: TGameStats }) {
  const maxNLetterWords = Math.max(Math.max(...Object.values(props.stats.nLetterWords), 1), EXPECTED_MAX_WORDS);
  
  const nLetterWords = Object.keys(props.stats.nLetterWords)
    .map(Number)
    .sort()
    .map((i: number) => {
      const count = props.stats.nLetterWords[i];
      const percentage = (count / maxNLetterWords) * 100;
      return (
        <>
          <td>{i}-Letter Words</td>
          <td>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  height: '20px',
                  width: `${percentage}%`,
                  backgroundColor: '#6a83c9',
                  borderRadius: '4px',
                  minWidth: percentage > 0 ? '4px' : '0px',
                }}
              />
              <span>{count}</span>
            </div>
          </td>
        </>
      );
    });

  const rows = [];
  if (props.stats.currentLevel !== 0) {
    rows.push(...[
      <>
        <td>Level Reached</td>
        <td>{props.stats.currentLevel}</td>
      </>,
      <>
        <td>Level {props.stats.currentLevel} Score</td>
        <td>
          {props.stats.currentLevelScore} /{" "}
          {props.stats.currentLevelRequiredScore}
        </td>
      </>
    ]);
  }
  rows.push(...[
    <>
      <td>Longest Word{props.stats.longestWords.length > 1 && "s"}</td>
      <td>{props.stats.longestWords.join(", ").toUpperCase()}</td>
    </>,
    <>
      <td>Highest Scoring Word</td>
      <td>
        {props.stats.highestWordScoreWord.toUpperCase()} (
        {props.stats.highestWordScore})
      </td>
    </>,
  ]);
  rows.push(...nLetterWords);
  rows.push(...[
    <>
      <td>Total Words</td>
      <td>{props.stats.totalWords}</td>
    </>,
  ]);

  const animatedRows = rows.map((r, i) =>
    <tr key={i} className="statsRow" style={{animationDelay: `${i * 0.1}s`}}>
      {r}
    </tr>
  );

  return (
    <table id="letterTable">
      <tbody>
        {animatedRows}
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
