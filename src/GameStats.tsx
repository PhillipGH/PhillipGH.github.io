import React from "react";
import { TDie } from "./Dice";
import { Die } from "./RewardsPhase";

export type TGameStats = {
    totalWords: number,
    longestWord: string,
    highestWordScoreWord: string,
    highestWordScore: number,
    currentLevel: number,
    currentLevelScore: number,
    currentLevelRequiredScore: number,
};

function GameStatsView(props: {
    stats: TGameStats,
    
    dice: TDie[],
    onRestart: () => void,
}) {
    return <div>
        <h1>Game Over!</h1>
        <button onClick={() => {
            props.onRestart();
        }}>Restart</button>
        <h2>Letter Breakdown:</h2>
        <table id='letterTable'><tbody>
            <tr>
                <td>Level Reached</td>
                <td>{props.stats.currentLevel}</td>
            </tr>
            <tr>
                <td>Level {props.stats.currentLevel} Score</td>
                <td>{props.stats.currentLevelScore} / {props.stats.currentLevelRequiredScore}</td>
            </tr>
            <tr>
                <td>Longest Word</td>
                <td>{props.stats.longestWord.toUpperCase()}</td>
            </tr>
            <tr>
                <td>Highest Scoring Word</td>
                <td>{props.stats.highestWordScoreWord.toUpperCase()} ({props.stats.highestWordScore})</td>
            </tr>
            <tr>
                <td>Total Words</td>
                <td>{props.stats.totalWords}</td>
            </tr>
        </tbody></table>
        <h2>Added Dice:</h2>
        {props.dice.slice(15).reverse().map((die, i) =>
            <div key={i} className='reward'>
                <Die key={i} die={die} />
            </div>
        )}
    </div>;
}

export default GameStatsView;