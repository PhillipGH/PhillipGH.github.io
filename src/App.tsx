import { FormEvent, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import React from 'react';

type TDie = {letter: string, faces: [string]};

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

const ALL_DICE : TDie[] = ALL_DICE_FACES.map(faces => ({letter: faces[0], faces: faces}));

function rollBoard(dice: TDie[]) {
  // returns a randomized array of dice
  dice = dice.map(
      (d) => ({...d, 'letter': d.faces[Math.floor(Math.random()*d.faces.length)]}));
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

function Square(props: {die: TDie}) {
  return (
    <div className={'key'} onClick={() => {}}>
        <p className={'keyLetter'}>{props.die.letter.toUpperCase()}</p>
        {/* <p className="keyCount">{'(' + props.count + ')'}</p> */}
    </div>
  );
}

function Grid(props: {dice: TDie[], columns: number}) {
  const chunkedArray = props.dice.reduce<TDie[][]>((resultArray, item, index) => { 
    const chunkIndex = Math.floor(index/props.columns)
  
    if(!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [] // start a new chunk
    }
  
    resultArray[chunkIndex].push(item)
  
    return resultArray
  }, []);

  return <div className="grid">
    {chunkedArray.map(
      (row: TDie[], j) =>
        <div className="gridRow" key={j}>
          {row.map(
            (key, i) =>
              <Square
                die={key}
                key={i}
              />
          )}
        </div>)}
  </div>;
}

function Board(props: {}) {
  const [dice, setDice] = useState<string | null>(null);

    return <div className="game">
        <Grid dice={rollBoard(ALL_DICE)} columns={5} />
    </div>;
}

function App() {

  const [answer, setAnswer] = useState('');
    
    return <div className="app noselect">
     <Board />
    </div>;
}

export default App
