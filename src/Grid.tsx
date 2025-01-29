import {useEffect, useRef, useState } from 'react'
import './App.css'
import React from 'react';
import { TDie } from './App';

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
        <div className={'letterDiv'}  onPointerEnter={() => props.onEnter(props.die)}><p className={'keyLetter'}>{props.die.letter.toUpperCase()}</p></div>
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

  export default Grid;