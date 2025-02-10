import {PointerEvent, useEffect, useRef, useState } from 'react'
import './App.css'
import React from 'react';
import { getDiceBonusText, TDie } from './Dice';

function Die(props: { die: TDie}) {
    let bonus : React.JSX.Element | null = null;
    if (props.die.bonus) {
        const text = getDiceBonusText(props.die.bonus);
        bonus = <div className="bonus"><h3>{text.title}</h3><p>{text.description}</p></div>;
    }
    return <div><div className='die'>
        {props.die.faces.map((face, i) => <div key={i} className='face'>{face}</div>)}
        </div>
        {bonus}
        
    </div>
}

export function DiceView(props: {dice: TDie[]}) {
    return <div id="rewardsPhase">
    <h2>Current Dice:</h2>
    {props.dice.map((die, i) =>
        <div key={i} className='reward'>
            <Die key={i} die={die} />
        </div>
    )}
  </div>;
}

function RewardsPhase(props: {choices: TDie[], onChoice: (die: TDie) => void}) {
    return <div id="rewardsPhase">
    <h2>Add a New Die!</h2>
    {props.choices.map((die, i) =>
        <button key={i} className='reward' onClick={() => {props.onChoice(die);}}>
            <Die key={i} die={die} />
            {/* <button onClick={() => {props.onChoice(die);}}>choose</button> */}
        </button>
    )}
  </div>;
}

export default RewardsPhase;