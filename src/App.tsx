import {useEffect, useRef, useState } from 'react'
import './App.css'
import React from 'react';
import dictionaryRaw from './assets/dictionary1.txt?raw'
import Grid from './Grid';

export type TDie = { letter: string, faces: string[] };

const TIME_LIMIT = 180;

const ALL_DICE_FACES = [
  'ennnda',
  'titiei',
  'ipcelt',
  'eeeema',
  'eeeeaa',
  'afiysr',
  'nemnga',
  'rihprv',
  'tttome',
  'nesuss',
  'wrovgr',
  'cpiest',
  'iypfrs',
  'teliic',
  'ugeema',
  'rasaaf',
  'nhdtoh',
  'ouotnw',
  'rddonl',
  'wnccts',
  'xzkqjb',
  'hhrldo',
  'touoot',
  'isfraa',
  'nrlhdo'
];

function loadDictionary() {
  let dictionary = new Set<string>();
  dictionaryRaw.split('\n').forEach((word) => {
    dictionary.add(word.trim());
  });
  return dictionary;
}

const ALL_DICE: TDie[] = ALL_DICE_FACES.map(faces => ({ letter: faces[0], faces: [...faces]}));

function rollBoard(dice: TDie[]) {
  // returns a randomized array of dice
  dice = dice.map(
    (d) => ({ ...d, 'letter': d.faces[Math.floor(Math.random() * d.faces.length)] }));
  shuffle(dice);
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

function Board(props: {dictionary: Set<string>}) {
  const columns = 5;
  const [dice, setDice] = useState<TDie[][]>(chunkArray(rollBoard(ALL_DICE), columns));
  const [currentWord, setCurrentWord] = useState<TDie[]>([]);
  const [lastWord, setLastWord] = useState('');
  const [score, setScore] = useState<number>(0);

  //timer
  const [startTime, setStartTime] = useState(0);
  const [now, setNow] = useState(0);
  const intervalRef = useRef(0);


  function commitWord() {
    const word = currentWord.map(d => d.letter).join('');
    if (word.length < 3) {
      setCurrentWord([]);
      setLastWord('');
      return;
    }
    let suffix = '';
    if (props.dictionary.has(word)) {
      let scoreChange = scoreWord(word);
      suffix = ' +' + scoreChange;
      setScore(score + scoreChange);
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


  function fib(n: number): number {
    if (n === 0) return 0;
    if (n === 1) return 1;
    return fib(n - 1) + fib(n - 2);
  }

  function scoreWord(word: string) {
    return word.length > 2 ? fib(word.length - 2) : 0;
  }

  let displayWord = currentWord.length > 0 ?
    <h1>{currentWord.map(d => d.letter).join('').toUpperCase()}</h1> :
    <h1 className="fadeOut">{lastWord}</h1>;
  
  let secondsPassed = Math.round((now - startTime) / 1000);
  let secondsLeft = TIME_LIMIT - secondsPassed;
  if (secondsLeft < 0) {
    clearInterval(intervalRef.current);
    return <div className="game">
      <h1>Game Over!</h1>
      <h2>Score: {score}</h2>
    </div>;
  }
  let minutes = Math.floor(secondsLeft / 60);
  let seconds = secondsLeft % 60;

  return <div className="game">
    <h1>{minutes}:{seconds < 10 ? '0' + seconds : seconds}</h1>
    <div className="currentWord">
    {displayWord}
    </div>
    <Grid dice={dice} currentWord={currentWord} setCurrentWord={setCurrentWord} commitWord={commitWord}/>
  </div>;
}

function App() {
  let [dictionary, setDictionary] = useState(new Set<string>());
  useEffect(() => {
    setDictionary(loadDictionary());
  }, []);
  return <div className="app noselect">
    <Board dictionary={dictionary}/>
  </div>;
}

export default App
