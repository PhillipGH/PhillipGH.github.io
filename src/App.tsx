import {useEffect, useRef, useState } from 'react'
import './App.css'
import React from 'react';
import dictionaryRaw from './assets/dictionary1.txt?raw'
import RewardsPhase, { DiceView } from './RewardsPhase';
import { ADDITIONAL_DICE, DiceBonus, nextAlphabetLetter, STARTER_DICE, TDie } from './Dice';
import Board from './Board';

function loadDictionary() {
  let dictionary = new Set<string>();
  dictionaryRaw.split('\n').forEach((word) => {
    dictionary.add(word.trim());
  });
  return dictionary;
}

function getNRandom<T>(arr: T[], n: number): T[] {
  var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
  if (n > len)
      throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

function Game(props: {dictionary: Set<string>}) {
  const [dice, setDice] = useState<TDie[]>(STARTER_DICE);
  const [choices, setChoices] = useState<TDie[]>(getNRandom(ADDITIONAL_DICE, 3));
  const [level, setLevel] = useState<number>(1);
  const [internalCounter, setInternalCounter] = useState<number>(1);
  const [phase, setPhase] = useState<'board'|'rewards' | 'view_dice'>('rewards');
  const [rerollCounter, setRerollCounter] = useState<number | null>(null);
  const [dieRecieved, setDieRecieved] = useState<boolean>(false);
  const timeoutRef = useRef(0);

  useEffect(() => {
        return () => {
          clearTimeout(timeoutRef.current);
        };
      }, []);


  function onWin() { 
    setLevel(level + 1);
    setInternalCounter(internalCounter + 1);
    setPhase('rewards');
    setChoices(getNRandom(ADDITIONAL_DICE, 3));
  }
  function onLose() {
    setLevel(1);
    setDice(STARTER_DICE);
    setInternalCounter(internalCounter + 1);
    setPhase('rewards');
    setChoices(getNRandom(ADDITIONAL_DICE, 3));
    setRerollCounter(null);
  }

  function onChooseReward(die: TDie) {
      setPhase('board');
      setDieRecieved(false);
      switch (die.bonus) {
        case DiceBonus.B_1_REROLL:
          setRerollCounter((rerollCounter || 0) + 1);
          break;
        case DiceBonus.B_2_REROLL:
          setRerollCounter((rerollCounter || 0) + 2);
          break;
      }
  }

  let content = <div/>;
  let viewButton : React.JSX.Element | null = null;
  if (phase === 'board') {
    content =
    <Board
      key={internalCounter}
      dictionary={props.dictionary}
      level={level} onLose={onLose}
      onWin={onWin}
      inputDice={dice}
      rerollCounter={rerollCounter}
      setRerollCounter={setRerollCounter}
    />;
  } else if (phase === 'rewards') {
    content = <RewardsPhase choices={choices} onChoice={(die) => {
      const timer = setTimeout(() => {
        setDice([...dice, die]);
        setDieRecieved(true);
          setTimeout(() => {
            onChooseReward(die);
          }, 500);
      }, 1370);
    }}/>;
    viewButton = <button id='viewDice' className={dieRecieved ? 'gainDie' : ''} onClick={() => {setPhase('view_dice')}}>Dice ({dice.length})</button>
  } else if (phase === 'view_dice') {
    content = <DiceView dice={dice}/>;
    viewButton = <button id='viewDice' onClick={() => {setPhase('rewards')}}>Back</button>
  }

  return <div className={phase === 'view_dice' ? "game" : "game noselect"}>
      <p>Level {level}</p>
      {viewButton}
      {content}
    </div>;
}

function App() {
  let [dictionary, setDictionary] = useState(new Set<string>());
  useEffect(() => {
    setDictionary(loadDictionary());
  }, []);
  return <div className="app">
    <Game dictionary={dictionary}/>
  </div>;
}

export default App


/**
 * Dice Ideas:
 * alphabet die: on use, move to next letter in the alphabet
 * upgrade die
 * x muktiplier die: it's an x and the multipler gains 1 each time it's used
 * ! factorial die: if you end a word a with the ! you get factorial points but the letters explode!!
 * 
 * 
 * Relic ideas:
 * animal die: 20 points if you spell an animal
 * tines of power: forks your score if you spell tine
 * 
 * todo
 * animate dice choice
 * 
 * 
 */