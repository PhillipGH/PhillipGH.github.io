import {PointerEvent, useEffect, useRef, useState } from 'react'
import './App.css'
import React from 'react';
import { getSquareBonusDisplay, TDie } from './Dice';

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
  
  function Square(props: { die: TDie, onEnter: (d: TDie) => void, onClick: (e: PointerEvent<HTMLDivElement>, d: TDie) => void }) {
    return (
      <div className={'letter'} onPointerDown={(e) => props.onClick(e, props.die)}>
        <div className={'letterDiv'}  onPointerEnter={() => props.onEnter(props.die)}><p className={'keyLetter'}>{props.die.letter.toUpperCase()}</p></div>
        {props.die.bonus ? <p className="bonus letterBonus">{getSquareBonusDisplay(props.die)}</p>: null}
      </div>
    );
  }
  
  function Lines(props: {points: {x: number, y: number}[], fadeOut: boolean}) {
    const selfRef = useRef<null|HTMLDivElement>(null);
    let points = props.points;

    if (points.length === 0) return null;
    
    if (selfRef.current !== null) {
      const offsetX = selfRef.current.getBoundingClientRect().x;
      const offsetY = selfRef.current.getBoundingClientRect().y;
      points = points.map(p => ({x: p.x - offsetX, y: p.y - offsetY}));
    }
    const lines: {ax: number, ay: number, bx: number, by: number}[] = [];
    for (var i = 1; i < points.length; i++) {
       lines.push({ax: points[i - 1].x, ay: points[i - 1].y, bx: points[i].x, by: points[i].y});
    }
    return <div id="lines" ref={selfRef}>
        <div className={props.fadeOut ? "lineOrDot dot fadeOut" : 'lineOrDot dot'}  style={{
      left: points[0].x - 25,
      top: points[0].y - 25}}></div>
    {lines.map((line, i) => 
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
    let [points, setPoints] = useState<{x: number, y: number}[]>([]);
    useEffect(() => {
      function onMouseUp() {
        setIsMouseDown(false);
        props.commitWord();
      }
      window.addEventListener('pointerup', onMouseUp);
      
      return () => {
        window.removeEventListener('pointerup', onMouseUp);
      }
    }, [props.currentWord]);
  
    function getSquares() {
      if (!squaresRef.current) {
        // Initialize the Map on first usage.
        squaresRef.current = props.dice.map((row: TDie[]) => row.map((_die: TDie) => null));
      }
      return squaresRef.current;
    }
  
    function onClick(e: PointerEvent<HTMLDivElement>,die: TDie) {
        if ((e.target as HTMLElement).hasPointerCapture(e.pointerId)) {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        }
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
      setPoints(calculatePoints(word));
      props.setCurrentWord(word);
    }
  
      function calculatePoints(word: TDie[]) {
          if (squaresRef.current === null) return [];
          const points: { x: number, y: number}[] = [];
          for (let i = 0; i < word.length; i++) {
              const current = word[i];
              const currentRef = getSquareRef(current, props.dice, squaresRef.current);
              if (!currentRef) continue;
              const x = currentRef.getBoundingClientRect().x + 25;
              const y = currentRef.getBoundingClientRect().y + 25;
              points.push({ x, y });
          }
          return points;
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
                }} key={i}>
                <Square
                  die={key}
                  onClick={onClick}
                  onEnter={onEnter}
                />
                </div>
            )}
          </div>)}
      <Lines points={points} fadeOut={props.currentWord.length === 0}/>
    </div>;
  }

  export default Grid;