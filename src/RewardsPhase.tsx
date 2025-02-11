import { PointerEvent, useEffect, useRef, useState } from 'react'
import './App.css'
import React from 'react';
import { getDiceBonusText, TDie } from './Dice';

function Die(props: { die: TDie }) {
    let bonus: React.JSX.Element | null = null;
    if (props.die.bonus) {
        const text = getDiceBonusText(props.die.bonus);
        bonus = <div className="bonus"><h3>{text.title}</h3><p>{text.description}</p></div>;
    }
    return <div><div className='die'>
        {props.die.faces.map((face, i) => <div key={i} className='face'>{face.toUpperCase()}</div>)}
    </div>
        {bonus}

    </div>
}

export function DiceView(props: { dice: TDie[] }) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const letters = alphabet.map(letter =>  {
        let count = 0;
        for (let i = 0; i < props.dice.length; ++i) {
            if (props.dice[i].faces.some(face => face.includes(letter))) {
                count++;
            }
        }
        return {letter: letter, count: count};
    });
    letters.sort(function(a, b){return b.count - a.count});

    return <div id="rewardsPhase">
        <h2>Letter Breakdown:</h2>
        <table id='letterTable'>
            <tr>
                <th>Letter</th>
                <th># of Dice</th>
            </tr>
            {letters.map(r => <tr key={r.letter}>
                <td>{r.letter.toUpperCase()}</td>
                <td>{r.count}</td>
            </tr>)}
            
        </table>
        <h2>Current Dice:</h2>
        {props.dice.slice(0).reverse().map((die, i) =>
            <div key={i} className='reward'>
                <Die key={i} die={die} />
            </div>
        )}
    </div>;
}

function RewardsPhase(props: { choices: TDie[], onChoice: (die: TDie) => void }) {
    return <div id="rewardsPhase">
        <h2>Add a New Die!</h2>
        {props.choices.map((die, i) =>
            <button key={i} className='reward' onClick={() => { props.onChoice(die); }}>
                <Die key={i} die={die} />
                {/* <button onClick={() => {props.onChoice(die);}}>choose</button> */}
            </button>
        )}
    </div>;
}

export default RewardsPhase;