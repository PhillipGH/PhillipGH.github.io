import { PointerEvent, useEffect, useRef, useState } from 'react'
import './App.css'
import React from 'react';
import { getDiceBonusText, TDie } from './Dice';

export function Die(props: { die: TDie, chosen?: boolean}) {
    const selfRef = useRef<null|HTMLDivElement>(null);
    let bonus: React.JSX.Element | null = null;
    if (props.die.bonus) {
        const text = getDiceBonusText(props.die.bonus);
        bonus = <div className="bonus"><h3>{text.title}</h3><p>{text.description}</p></div>;
    }
    if (props.chosen && selfRef.current !== null) {
        const offsetY = selfRef.current.getBoundingClientRect().y;
        const offsetX = document.getElementById('viewDice')?.getBoundingClientRect().x;
        //style = {"--height-offset": -offsetY } as React.CSSProperties;
        document.documentElement.style.setProperty("--height-offset", -offsetY +'px');
        document.documentElement.style.setProperty("--width-offset", offsetX +'px');
    }
    return <div ref={selfRef}>
        <div className={props.chosen ? 'die assembled' : 'die'}>
            {props.die.faces.map((face, i) => <div key={i} className='face'>{face.toUpperCase()}</div>)}
        </div>
        {props.chosen && <div style={{width:333.6, height: 55.6}}></div>}
        {bonus}
    </div>
}

export function DiceView(props: { dice: TDie[] }) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const letters = alphabet.map(letter => {
        let count = 0;
        for (let i = 0; i < props.dice.length; ++i) {
            if (props.dice[i].faces.some(face => face.includes(letter))) {
                count++;
            }
        }
        return { letter: letter, count: count };
    });
    letters.sort(function (a, b) { return b.count - a.count });

    return <div id="rewardsPhase">
        <h2>Letter Breakdown:</h2>
        <table id='letterTable'><tbody>
            <tr>
                <th>Letter</th>
                <th># of Dice</th>
            </tr>
            {letters.map(r => <tr key={r.letter}>
                <td>{r.letter.toUpperCase()}</td>
                <td>{r.count}</td>
            </tr>)}

        </tbody></table>
        <h2>Current Dice:</h2>
        {props.dice.slice(0).reverse().map((die, i) =>
            <div key={i} className='reward'>
                <Die key={i} die={die} />
            </div>
        )}
    </div>;
}

function RewardsPhase(props: { choices: TDie[], onChoice: (die: TDie) => void }) {
    const [chosenDie, setChosenDie] = useState<null | TDie>(null);
    function onClick(die: TDie) {
        if (chosenDie !== null) {
            return;
        }
        setChosenDie(die);
        props.onChoice(die);
    }

    return <div id="rewardsPhase">
        <h2>Add a New Die!</h2>
        {props.choices.map((die, i) =>
            <button key={i} className='reward' onClick={() => { onClick(die); }}>
                <Die key={i} die={die} chosen={die === chosenDie} />
            </button>
        )}
    </div>;
}

export default RewardsPhase;