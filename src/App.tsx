import {useEffect, useRef, useState } from 'react'
import './App.css'
import React from 'react';
import dictionaryRaw from './assets/dictionary1.txt?raw'
import Grid from './Grid';
import RewardsPhase from './RewardsPhase';
import { ADDITIONAL_DICE, DiceBonus, STARTER_DICE, TDie } from './Dice';

const TIME_LIMIT = 120;
const EASY_WIN = false;

function loadDictionary() {
  let dictionary = new Set<string>();
  dictionaryRaw.split('\n').forEach((word) => {
    dictionary.add(word.trim());
  });
  return dictionary;
}

function rollBoard(dice: TDie[]) {
  // returns a randomized array of dice
  dice = dice.map(
    (d) => ({ ...d, 'letter': d.faces[Math.floor(Math.random() * d.faces.length)] }));
  shuffle(dice);
  if (dice.length > 25) {
    dice = dice.slice(0, 25);
  }
  return dice;
}

function shuffle<T>(array: T[]) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

function chunkArray<T>(arr: T[], columns: number) {
  return arr.reduce<T[][]>((resultArray, item, index) => {
  const chunkIndex = Math.floor(index / columns)

  if (!resultArray[chunkIndex]) {
    resultArray[chunkIndex] = [] // start a new chunk
  }

  resultArray[chunkIndex].push(item)

  return resultArray
}, []);
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

function Board(props: {dictionary: Set<string>, level: number, inputDice: TDie[], onWin: () => void, onLose: () => void}) {
  let requiredScore = 5 + 6 * props.level;
  if (EASY_WIN) {
    requiredScore = 2;
  }
  useEffect(() => {
    const columns = props.inputDice.length < 20 ? 4 : 5;
    setDice(chunkArray(rollBoard(props.inputDice), columns));
  }, []);
  const [dice, setDice] = useState<TDie[][]>([]);
  const [currentWord, setCurrentWord] = useState<TDie[]>([]);
  const [lastWord, setLastWord] = useState('');
  const [score, setScore] = useState<number>(0);

  const [usedWords, setUsedWords] = useState(new Set<string>());

  //timer
  const [startTime, setStartTime] = useState(0);
  const [now, setNow] = useState(0);
  const intervalRef = useRef(0);


  function commitWord() {
    let suffix = '';
    const word = currentWord.map(d => d.letter).join('');
    if (word.length === 0) {
      return;
    }
    if (word.length < 3) {
      suffix = String.fromCodePoint(0x1f6ab) + ' (too short)';
    } else if (props.dictionary.has(word)) {
      if (usedWords.has(word)) {
        suffix = String.fromCodePoint(0x1f6ab) + ' (already played)';
      } else {
        setUsedWords(new Set(usedWords.add(word)));
        let scoreChange = scoreWord(word, currentWord);
        suffix = ' +' + scoreChange;
        setScore(score + scoreChange);
      }
    } else {
      suffix = String.fromCodePoint(0x1f6ab);
    }
    let last = word.toUpperCase() + suffix;
    setLastWord(last);
    setCurrentWord([]);
  }

  function handleStart() {
    setStartTime(Date.now());
    setNow(Date.now());

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setNow(Date.now());
    }, 10);
  }
  
  useEffect(() => {
    handleStart();
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  if (score >= requiredScore) {
    clearInterval(intervalRef.current);
    return <div className="game">
      <h1>Level {props.level} Complete!</h1>
      <button onClick={() => {
        props.onWin();
      }}>Continue</button>
    </div>;
  }


  function fib(n: number): number {
    if (n === 0) return 0;
    if (n === 1) return 1;
    return fib(n - 1) + fib(n - 2);
  }

  function scoreWord(word: string, dice: TDie[]) {
    let multiplier = 1;
    let bonus = 0;
    if (dice[0].bonus === DiceBonus.B_PLUS2) {
      bonus += 2;
    }
    for (let i = 0; i < dice.length; i++) {
      if (dice[i].bonus === DiceBonus.B_2X) {
        multiplier *= 2;
      }
      if (dice[i].bonus === DiceBonus.B_3X) {
        multiplier *= 3;
      }
    }
    const baseScore = word.length > 2 ? fib(word.length - 2) : 0;
    return (baseScore + bonus) * multiplier;
  }

  let displayWord = currentWord.length > 0 ?
    <p>{currentWord.map(d => d.letter).join('').toUpperCase()}</p> :
    <p className="fadeOut">{lastWord}</p>;
  
  let secondsPassed = Math.round((now - startTime) / 1000);
  let secondsLeft = TIME_LIMIT - secondsPassed;
  if (secondsLeft < 0) {
    clearInterval(intervalRef.current);
    return <div className="game">
      <h1>Game Over!</h1>
      <h2>Score: {score}</h2>
      <button onClick={() => {
        props.onLose();
      }}>Restart</button>
    </div>;
  }
  let minutes = Math.floor(secondsLeft / 60);
  let seconds = secondsLeft % 60;

  let progress = (score / requiredScore) * 100;

  return <div>
    <h1>{minutes}:{seconds < 10 ? '0' + seconds : seconds}</h1>
    <div id="progressbar">
      <div style={{width: progress + '%'}}></div>
      <center><label>{score} / {requiredScore}</label></center>
    </div>
    <div className="currentWord">
      {displayWord}
    </div>
    <div className='container'>
      <Grid dice={dice} currentWord={currentWord} setCurrentWord={setCurrentWord} commitWord={commitWord} />
    </div>
  </div>;
}

function Game(props: {dictionary: Set<string>}) {
  const [dice, setDice] = useState<TDie[]>(STARTER_DICE);
  const [level, setLevel] = useState<number>(1);
  const [internalCounter, setInternalCounter] = useState<number>(1);
  const [phase, setPhase] = useState<'board'|'rewards'>('rewards');

  function onWin() { 
    setLevel(level + 1);
    setInternalCounter(internalCounter + 1);
    setPhase('rewards');
  }
  function onLose() {
    setLevel(1);
    setDice(STARTER_DICE);
    setInternalCounter(internalCounter + 1);
    setPhase('rewards');
  }

  let content = <div/>;
  if (phase === 'board') {
    content = <Board key={internalCounter} dictionary={props.dictionary} level={level} onLose={onLose} onWin={onWin} inputDice={dice}/>;
  } else if (phase === 'rewards') {
    content = <RewardsPhase choices={getNRandom(ADDITIONAL_DICE, 3)} onChoice={(die) => {
      setDice([...dice, die]);
      setPhase('board');
    }}/>;
  }

  return <div className="game">
    <p>Level {level}</p>
      {content}
    </div>;
}

function App() {
  let [dictionary, setDictionary] = useState(new Set<string>());
  useEffect(() => {
    setDictionary(loadDictionary());
  }, []);
  return <div className="app noselect">
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
 */