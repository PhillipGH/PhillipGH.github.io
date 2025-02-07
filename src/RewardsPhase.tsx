import {PointerEvent, useEffect, useRef, useState } from 'react'
import './App.css'
import React from 'react';
import { TDie } from './Dice';

function Die(props: { die: TDie}) {
    return <div className='die'>
        {props.die.faces.map((face, i) => <div key={i} className='face'>{face}</div>)}
        {props.die.bonus ? <p className="bonus">{props.die.bonus}</p>: null}
    </div>
}

function RewardsPhase(props: {choices: TDie[], onChoice: (die: TDie) => void}) {
    return <div className="rewardsPhase">
    <h2>Choose your bounty!</h2>
    {props.choices.map((die, i) =>
        <div key={i} className='reward'>
            <Die key={i} die={die} />
            <button onClick={() => {props.onChoice(die);}}>choose</button>
        </div>
    )}
  </div>;
}

export default RewardsPhase;