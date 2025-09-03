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
  const nLetterWords = Object.keys(props.stats.nLetterWords)
    .map(Number)
    .sort()
    .map((i: number) => (
      <tr key={i}>
        <td>{i}-Letter Words</td>
        <td>{props.stats.nLetterWords[i]}</td>
      </tr>
    ));

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
  return (
    <div>
      <h1>Game Over!</h1>
      <button
        onClick={() => {
          props.onRestart();
        }}
      >
        Restart
      </button>
      <h2>Stats:</h2>
      <GameStats stats={props.stats} />
      <h2>Added Dice:</h2>
      <DiceList dice={props.dice.slice(STARTER_DICE.length).reverse()} />
    </div>
  );
}
