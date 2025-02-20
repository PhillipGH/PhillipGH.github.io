import { STARTER_DICE, TDie } from "./Dice";
import { DiceList } from "./RewardsPhase";
import React from 'react';

export type TGameStats = {
    totalWords: number,
    longestWord: string,
    highestWordScoreWord: string,
    highestWordScore: number,
    currentLevel: number,
    currentLevelScore: number,
    currentLevelRequiredScore: number,
    nLetterWords : {[i:number]: number},
};

function GameStatsView(props: {
    stats: TGameStats,
    
    dice: TDie[],
    onRestart: () => void,
}) {

    const nLetterWords = Object.keys(props.stats.nLetterWords).map(Number).sort().map(
        (i: number) =>
            <tr key={i}>
                <td>{i}-Letter Words</td>
                <td>{props.stats.nLetterWords[i]}</td>
            </tr>
    );

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
            {nLetterWords}
            <tr>
                <td>Total Words</td>
                <td>{props.stats.totalWords}</td>
            </tr>
        </tbody></table>
        <h2>Added Dice:</h2>
        <DiceList dice={props.dice.slice(STARTER_DICE.length).reverse()} />
    </div>;
}

export default GameStatsView;