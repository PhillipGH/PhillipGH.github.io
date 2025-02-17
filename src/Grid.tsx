import {PointerEvent, useEffect, useRef, useState } from 'react'
import './App.css'
import React from 'react';
import { DiceBonus, getDiceBonusText, getSquareBonusDisplay, TDie } from './Dice';

const SPACING = 60;

function getSquareRef(die: TDie, dice: (TDie | null)[][], squareRefs: (null|HTMLDivElement)[][]) {
    for (let i = 0; i < dice.length; i++) {
      for (let j = 0; j < dice[i].length; j++) {
        if (dice[i][j] === die) {
          return squareRefs[i][j];
        }
      }
    }
  }
  
  function isValidMove(die: TDie, currentWord: TDie[], dice: (TDie | null)[][]) {
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
  
  function Square(props: {
    i: number,
    j: number,
    die: TDie | null,
    isRotating: boolean,
    onEnter: (d: TDie) => void,
    onClick: (e: PointerEvent<HTMLDivElement>, d: TDie) => void
    getSquares: () => (null|HTMLDivElement)[][]
  }) {
    if (props.die == null) {
      return <div className={'letterSpacer'}> </div>;
    }
    const die : TDie = props.die;
    const hasSideEffect = getDiceBonusText(die.bonus || DiceBonus.B_2X).hasSideEffect;
    let letterClass = die.letter.length < 3 ? 'keyLetter' : (die.letter.length < 4 ? 'keyLetterMedium' : 'keyLetterSmall');
    if (hasSideEffect) {
      letterClass += ' sideEffect';
    }
    return (
      <div
      ref={(node) => {
        const list = props.getSquares();
        list[props.j][props.i] = node;
      }}
      style={{left: props.i * SPACING, top: props.j * SPACING}}
      className='letterDivContainer'>
      <div className={'letter'} onPointerDown={(e) => props.onClick(e, die)}>
        <div
          className={props.isRotating ? 'letterDiv letterRot': 'letterDiv'}
          onPointerEnter={() => props.onEnter(die)}>
            <p className={letterClass}>{die.letter.toUpperCase()}</p>
        </div>
        {die.bonus ? <p className="bonus letterBonus">{getSquareBonusDisplay(die)}</p>: null}
      </div></div>
    );
  }
  
  function Lines(props: {points: {x: number, y: number}[], fadeOut: boolean}) {
    const selfRef = useRef<null|HTMLDivElement>(null);
    let points = props.points;

    if (points.length === 0) return null;
    
    if (selfRef.current !== null) {
      const offsetX = selfRef.current.getBoundingClientRect().x -3;
      const offsetY = selfRef.current.getBoundingClientRect().y - 3;
      points = points.map(p => ({x: p.x - offsetX, y: p.y - offsetY}));
    }
    const lines: {ax: number, ay: number, bx: number, by: number}[] = [];
    for (var i = 1; i < points.length; i++) {
       lines.push({ax: points[i - 1].x, ay: points[i - 1].y, bx: points[i].x, by: points[i].y});
    }
    return <div id="lines" ref={selfRef}>
        <div className={props.fadeOut ? "lineOrDot dot fadeOut" : 'lineOrDot dot'}  style={{
      left: points[0].x - 20,
      top: points[0].y - 20}}></div>
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
  
      let angle = Math.atan((ay - by) / (bx - ax));
      angle = (angle * 180 / Math.PI);
      angle = -angle;
      
      const height = 16;
      const length = Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by)) + height / 2;
      const className = props.fadeOut ? 'lineOrDot line fadeOut' : 'lineOrDot line';
      
    return <div className={className} style={{
      left: (bx + ax) / 2 - length / 2,
      top: (by + ay) / 2 - height / 2,
      width: length,
      height: height,
      transform: `rotate(${angle}deg)`,
      msTransform: `rotate(${angle}deg)`,
      transformOrigin: '50% 50%',
      WebkitTransform: `rotate(${angle}deg)`,
      WebkitTransformOrigin: '50% 50%'
    }} />;
  } 
  
  function Grid(props: {
    dice: (TDie | null)[][],
    currentWord: TDie[],
    isRotating: boolean,
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
        squaresRef.current = props.dice.map((row: (TDie | null)[]) => row.map((_die: (TDie | null)) => null));
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
      let sortedDice: {d:TDie | null, i:number, j:number}[] = [];
      for (let a = 0; a < props.dice.length; a++) {
        for (let b = 0; b < (props.dice[0] ?  props.dice[0].length : 0); b++) {
          sortedDice.push({d: props.dice[a][b], i: b, j: a});
        }
      }
      sortedDice.sort((a,b) => (a.d?.id != null ? a.d?.id : -1) - (b.d?.id!= null ?  b.d?.id : -1));

    return <div
      className={props.isRotating ? "grid groatate" :"grid"}
      style={{width: SPACING * props.dice.length, height: props.dice[0] ? SPACING * props.dice[0].length: 0}}
      onPointerUp={() => setIsMouseDown(false)}
    >
      {sortedDice.map(
              (d) =>
                <Square
                  i={d.i}
                  j={d.j}
                  die={d.d}
                  key={d.d?.id != null ? d.d?.id : -1}
                  isRotating={props.isRotating}
                  onClick={onClick}
                  onEnter={onEnter}
                  getSquares={getSquares}
                />
            )}
      <Lines points={points} fadeOut={props.currentWord.length === 0}/>
    </div>;
  }

  export default Grid;