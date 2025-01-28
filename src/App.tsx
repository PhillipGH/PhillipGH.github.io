import {useEffect, useRef, useState } from 'react'
import './App.css'
import React from 'react';
import dictionaryRaw from './assets/dictionary1.txt?raw'

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

function Lines(props: {linesEqs: {ax: number, ay: number, bx: number, by: number}[], fadeOut: boolean}) {
  return <div id="lines">
  {props.linesEqs.map((line, i) => 
    <Line eq={line} fadeOut={props.fadeOut} key={i} />
    )}
</div>;
  
}

function Line(props :{ fadeOut: boolean, eq : {ax: number, ay: number, bx: number, by: number}}) {
    let ax = props.eq.ax;
    let ay = props.eq.ay;
    let bx = props.eq.bx;
    let by = props.eq.by;

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
    let className = props.fadeOut ? 'lineOrDot line fadeOut' : 'lineOrDot line';
  return <div className={className} style={{
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

function Grid(props: {
  dice: TDie[][],
  currentWord: TDie[],
  setCurrentWord: React.Dispatch<React.SetStateAction<TDie[]>>,
  commitWord: () => void
} ) {
  const squaresRef : React.MutableRefObject<null|(null|HTMLDivElement)[][]> = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  let [lines, setLines] = useState<{ax: number, ay: number, bx: number, by: number}[]>([]);
  useEffect(() => {
    function onMouseUp() {
      setIsMouseDown(false);
      props.commitWord();
    }
    window.addEventListener('mouseup', onMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
    }
  }, [props.currentWord]);

  function getSquares() {
    if (!squaresRef.current) {
      // Initialize the Map on first usage.
      squaresRef.current = props.dice.map((row: TDie[]) => row.map((_die: TDie) => null));
    }
    return squaresRef.current;
  }

  function onClick(die: TDie) {
    setIsMouseDown(true);
    setCurrentWord([die]);
  }

  function onEnter(die: TDie) {
    if (!isMouseDown) return;
    if (props.currentWord.length > 1 && props.currentWord[props.currentWord.length - 2] === die) {
      setCurrentWord(props.currentWord.slice(0, -1));
      return;
    }
    if (!isValidMove(die, props.currentWord, props.dice)) return;
    setCurrentWord(props.currentWord.concat(die));
  }

  function setCurrentWord(word: TDie[]) {
    setLines(calculateLines(word));
    props.setCurrentWord(word);
  }

  function calculateLines(word: TDie[]) {
    if (squaresRef.current === null) return [];
    const lines : {ax: number, ay: number, bx: number, by: number}[] = [];
  for (let i = 1; i < word.length; i++) {
    const prev = word[i - 1];
    const current = word[i];
    const prevRef = getSquareRef(prev, props.dice, squaresRef.current);
    const currentRef = getSquareRef(current, props.dice, squaresRef.current);
    if (!prevRef || !currentRef) continue;
    const ax = prevRef.getBoundingClientRect().x + 25;
    const ay = prevRef.getBoundingClientRect().y+ 25;
    const bx = currentRef.getBoundingClientRect().x+ 25;
    const by = currentRef.getBoundingClientRect().y+ 25;
    lines.push({ax, ay, bx, by});
  }
  return lines;
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
    <Lines linesEqs={lines} fadeOut={props.currentWord.length === 0}/>
  </div>;
}

function Board(props: {dictionary: Set<string>}) {
  const columns = 5;
  const [dice, setDice] = useState<TDie[][]>(chunkArray(rollBoard(ALL_DICE), columns));
  const [currentWord, setCurrentWord] = useState<TDie[]>([]);
  const [lastWord, setLastWord] = useState(<h1></h1>);
  const [score, setScore] = useState<number>(0);

  function commitWord() {
    const word = currentWord.map(d => d.letter).join('');
    if (word.length < 3) {
      setCurrentWord([]);
      setLastWord(<></>);
      return;
    }
    let suffix = null;
    if (props.dictionary.has(word)) {
      let scoreChange = scoreWord(word);
      suffix = <p style={{display: 'inline-block'}}>{' +' + scoreChange}</p>;
      setScore(score + scoreChange);
    } else {
      suffix = <p style={{display: 'inline-block'}}>{String.fromCodePoint(0x1f603)}</p>;
    }
    let last = <div><h1 style={{display: 'inline-block'}}>{word}</h1>{suffix}</div>;
    setLastWord(last);
    setCurrentWord([]);
  }

  function fib(n: number): number {
    if (n === 0) return 0;
    if (n === 1) return 1;
    return fib(n - 1) + fib(n - 2);
  }

  function scoreWord(word: string) {
    return word.length > 2 ? fib(word.length - 2) : 0;
  }

  let displayWord = currentWord.length > 0 ?
    <h1>{currentWord.map(d => d.letter).join('')}</h1> :
    <div className="fadeOut">{lastWord}</div>;

  return <div className="game">
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
