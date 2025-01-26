import { FormEvent, useEffect, useRef, useState } from 'react'
import './App.css'
import React from 'react';

type TDie = { letter: string, faces: string[] };

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

function getSquareRef(die: TDie, dice: TDie[][], squareRefs: (null|HTMLDivElement)[][]) {
  for (let i = 0; i < dice.length; i++) {
    for (let j = 0; j < dice[i].length; j++) {
      if (dice[i][j] === die) {
        return squareRefs[i][j];
      }
    }
  }
}

function isValidMove(die: TDie, currentWord: TDie[], dice: TDie[][]) {
  if (currentWord.length === 0) return true;
  if (currentWord.includes(die)) return false;
  for (let i = 0; i < dice.length; i++) {
    for (let j = 0; j < dice[i].length; j++) {
      if (dice[i][j] === die) {
        for (let k = Math.max(i - 1, 0); k <= i + 1 && k < dice.length; k++) {
          for (let l = Math.max(j - 1, 0); l <= j + 1 && l < dice[k].length; l++) {
            if (dice[k][l] === currentWord[currentWord.length - 1]) return true;
          }
        }
        return false;
      }
    }
  }
  return false;
}


function Square(props: { die: TDie, onEnter: (d: TDie) => void, onClick: (d: TDie) => void }) {
  return (
    <div className={'letter'} onPointerDown={() => props.onClick(props.die)}>
      <p className={'keyLetter'} onPointerEnter={() => props.onEnter(props.die)}>{props.die.letter.toUpperCase()}</p>
      {/* <p className="keyCount">{'(' + props.count + ')'}</p> */}
    </div>
  );
}

function Lines(props: {squareRefs: null|(null|HTMLDivElement)[][], dice: TDie[][], currentWord: TDie[]}) {
  if (props.currentWord.length === 0) return <></>;
  if (props.squareRefs === null) return <></>;
  const lines : {ax: number, ay: number, bx: number, by: number}[] = [];
  for (let i = 1; i < props.currentWord.length; i++) {
    const prev = props.currentWord[i - 1];
    const current = props.currentWord[i];
    const prevRef = getSquareRef(prev, props.dice, props.squareRefs);
    const currentRef = getSquareRef(current, props.dice, props.squareRefs);
    if (!prevRef || !currentRef) continue;
    const ax = prevRef.getBoundingClientRect().x + 25;
    const ay = prevRef.getBoundingClientRect().y+ 25;
    const bx = currentRef.getBoundingClientRect().x+ 25;
    const by = currentRef.getBoundingClientRect().y+ 25;
    lines.push({ax, ay, bx, by});
  }
  return <div id="lines">
    {lines.map((line, i) => 
      <Line {...line} key={i} />
      )}
  </div>;
}

function Line(props : {ax: number, ay: number, bx: number, by: number}) {
    let ax = props.ax;
    let ay = props.ay;
    let bx = props.bx;
    let by = props.by;

    if (ax > bx) {
        bx = ax + bx;
        ax = bx - ax;
        bx = bx - ax;
        by = ay + by;
        ay = by - ay;
        by = by - ay;
    }

    // console.log('ax: ' + ax);
    // console.log('ay: ' + ay);
    // console.log('bx: ' + bx);
    // console.log('by: ' + by);

    var angle = Math.atan((ay - by) / (bx - ax));
    angle = (angle * 180 / Math.PI);
    angle = -angle;

    var length = Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
  return <div className="lineOrDot line" style={{
    left: ax,
    top: ay,
    width: length,
    height: 15,
    transform: `rotate(${angle}deg)`,
    msTransform: `rotate(${angle}deg)`,
    transformOrigin: '0% 0%',
    WebkitTransform: `rotate(${angle}deg)`,
    WebkitTransformOrigin: '0% 0%'
  }} />;
} 

function Grid(props: { dice: TDie[][], currentWord: TDie[], setCurrentWord: React.Dispatch<React.SetStateAction<TDie[]>>} ) {
  const squaresRef : React.MutableRefObject<null|(null|HTMLDivElement)[][]> = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  useEffect(() => {
    function onMouseUp() {
      setIsMouseDown(false);
      props.setCurrentWord([]);
    }
    window.addEventListener('mouseup', onMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
    }
  }, []);

  function getSquares() {
    if (!squaresRef.current) {
      // Initialize the Map on first usage.
      squaresRef.current = props.dice.map((row: TDie[]) => row.map((_die: TDie) => null));
      console.log('p2', squaresRef.current)
    }
    return squaresRef.current;
  }

  function onClick(die: TDie) {
    setIsMouseDown(true);
    props.setCurrentWord([die]);
  }

  function onEnter(die: TDie) {
    if (!isMouseDown) return;
    if (props.currentWord.length > 1 && props.currentWord[props.currentWord.length - 2] === die) {
      props.setCurrentWord(props.currentWord.slice(0, -1));
      return;
    }
    if (!isValidMove(die, props.currentWord, props.dice)) return;
    props.setCurrentWord(props.currentWord.concat(die));
  }

  return <div className="grid" onPointerUp={() => setIsMouseDown(false)}>
    {props.dice.map(
      (row: TDie[], j) =>
        <div className="gridRow" key={j}>
          {row.map(
            (key, i) =>
              <div ref={(node) => {
                const list = getSquares();
                list[j][i] = node;
              }}>
              <Square
                die={key}
                key={i}
                onClick={onClick}
                onEnter={onEnter}
              />
              </div>
          )}
        </div>)}
    <Lines squareRefs={squaresRef.current} dice={props.dice} currentWord={props.currentWord}/>
  </div>;
}

function Board(props: {}) {
  const columns = 5;
  const [dice, setDice] = useState<TDie[][]>(chunkArray(rollBoard(ALL_DICE), columns));
  const [currentWord, setCurrentWord] = useState<TDie[]>([]);

  function onLetter(die: TDie) {
    setCurrentWord(currentWord.concat(die));
  }

  return <div className="game">
    <div className="currentWord">
    <h1>{currentWord.map(d => d.letter).join('')}</h1>
    </div>
    <Grid dice={dice} currentWord={currentWord} setCurrentWord={setCurrentWord} />
  </div>;
}

function App() {

  const [answer, setAnswer] = useState('');

  return <div className="app noselect">
    <Board />
  </div>;
}

export default App
