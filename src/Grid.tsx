import {PointerEvent, useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import React from 'react';
import { DiceBonus, getDiceBonusText, getSquareBonusDisplay, TDie, TGameContext } from './Dice';
import { shuffle } from './Board';

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
    isSelected: boolean,
    isDealing: boolean,
    onEnter: (d: TDie) => void,
    onClick: (e: PointerEvent<HTMLDivElement>, d: TDie) => void
    getSquares: () => (null|HTMLDivElement)[][],
    bonusText: string | null,
    gameContext: TGameContext,
  }) {
    function getInitialLetter(): string {
      if (!props.die) return '';
      if (props.die?.faces[0] !== props.die.letter)
        return props.die?.faces[0];
      else return props.die?.faces[1];
    }
    const [lastLetter, setLastLetter] = useState<string>(getInitialLetter());
    const [shuffleLetters, setShuffleLetters] = useState<string[]>([]);
    const [animationClassHack, setAnimationClassHack] = useState<boolean>(true);
    const intervalRef = useRef(0);
    const isAlreadyRenderingRef = useRef(false);


    useEffect(() => {
      if (isAlreadyRenderingRef.current) return () => {
        clearInterval(intervalRef.current);
      };
      isAlreadyRenderingRef.current = true;
      if (props.die && props.die.letter !== lastLetter) {
        clearInterval(intervalRef.current);
        setLastLetter(props.die.letter);
        let letters = props.die.faces.slice();
        shuffle(letters);

        let idx = letters.findIndex(p => p === lastLetter);
        if(idx >= 0){ //check if item found
          letters.splice(idx, 1);
        }

        idx = letters.findIndex(p => p === props.die?.letter);
        if(idx >= 0){ //check if item found
          letters.splice(idx, 1);    
        }
        letters.unshift(lastLetter);
        letters = letters.slice(0,3);
        setShuffleLetters(letters);
        const ref1 = props.getSquares()[props.j][props.i];
        if (ref1) {
          ref1.addEventListener('animationend', function() {
            if (letters.length == 0)
              return;
            letters.pop();
            // ref1.style.animation = 'none';
            // ref1.offsetHeight;
            // ref1.style.animation = '';

            setAnimationClassHack(false);
            setShuffleLetters(letters);
            setTimeout(() => {
              setAnimationClassHack(true);
            }, 20);
            isAlreadyRenderingRef.current = false;
          });
        }
      }
      return () => {
        clearInterval(intervalRef.current);
      };
    }, [props.die?.letter]);
    if (props.die == null) {
      return <div className={'letterSpacer'}> </div>;
    }
    const die : TDie = props.die;
    const hasSideEffect = getDiceBonusText(die.bonus || DiceBonus.B_2X).hasSideEffect;
    let textClass = die.letter.length < 3 ? 'keyLetter' : (die.letter.length < 4 ? 'keyLetterMedium' : 'keyLetterSmall');
    if (hasSideEffect) {
      textClass += ' sideEffect';
    }

    let x = props.i * SPACING;
    let y = props.j * SPACING;
    const displayLetter = shuffleLetters.length > 0 ? shuffleLetters[shuffleLetters.length - 1] : props.die.letter;
    const nextLetter = shuffleLetters.length > 1 ? shuffleLetters[shuffleLetters.length - 2] : props.die.letter;
    const isRolling = shuffleLetters.length > 0 && animationClassHack;

    let c = 'letterDivContainer';
    if (!props.isRotating) {
      c += ' transit';
    }
    if (isRolling) {
      c += ' rolling';
    }

    let letterClass = props.isSelected ? 'letter selectedLetter' :'letter';
    if (die.usedThisLevel)  {
      letterClass += ' blackout';
    }

    if (props.isDealing) {
      x = 4 * SPACING;
      y = -2.3 * SPACING;
    }

    return (
      <div
      ref={(node) => {
        const list = props.getSquares();
        if (!list) {
          console.log('WHAT!!!');
          return;
        }
        list[props.j][props.i] = node;
      }}
      style={{left: x, top: y}}
      className={c}>
      {props.bonusText && <p className="bonusText">{props.bonusText}</p>}
      <div className={letterClass} onPointerDown={(e) => props.onClick(e, die)}>
        <div
          className={props.isRotating ? 'letterDiv letterRot': 'letterDiv'}
          onPointerEnter={() => props.onEnter(die)}>
            <p className={textClass}>{displayLetter.toUpperCase()}</p>
        </div>
        {die.bonus ? <p className="bonus letterBonus">{getSquareBonusDisplay(die, props.gameContext)}</p>: null}
      </div>
      {isRolling? <div className={'nextLetter'}>
        <div
          className={props.isRotating ? 'letterDiv letterRot': 'letterDiv'}>
            <p className={textClass}>{nextLetter.toUpperCase()}</p>
        </div>
        {die.bonus ? <p className="bonus letterBonus">{getSquareBonusDisplay(die, props.gameContext)}</p>: null}
      </div>
       : null}

      </div>
    );
  }
  
  function Lines(props: {points: {x: number, y: number}[], fadeOut: boolean}) {
    const [offset, setOffset] = useState<[number, number]>([0,0]);
    const selfRef = useCallback((node: HTMLDivElement) => {
      if (!node) return;
      const offsetX = node.getBoundingClientRect().x -3;
      const offsetY = node.getBoundingClientRect().y - 3;
      setOffset([offsetX,offsetY]);
    }, []);
    let points = props.points;
    if (points.length === 0) return null;
    points = points.map(p => ({x: p.x - offset[0], y: p.y - offset[1]}));
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
    isDealing: boolean,
    bonusText: {die: TDie, str: string}[],
    gameContext: TGameContext,
    setCurrentWord: React.Dispatch<React.SetStateAction<TDie[]>>,
    commitWord: () => void,
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

    useEffect(() => {
      setPoints([]);
    }, [props.isRotating]);
  
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
      let sortedDice: {d:TDie | null, i:number, j:number, tmp: number, bonusText: null | string}[] = [];
      for (let a = 0; a < props.dice.length; a++) {
        for (let b = 0; b < (props.dice[0] ?  props.dice[0].length : 0); b++) {
          let bonusText = null;
          const bt = props.bonusText.find(bt => bt.die === props.dice[a][b]);
          if (bt) {
            bonusText = bt.str;
          }
          sortedDice.push({d: props.dice[a][b], i: b, j: a, tmp: a * props.dice.length + b + 1, bonusText});
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
                  key={d.d?.id != null ? d.d?.id : -d.tmp}
                  isRotating={props.isRotating}
                  isSelected={d.d != null && props.currentWord.includes(d.d)}
                  isDealing={props.isDealing}
                  onClick={onClick}
                  onEnter={onEnter}
                  getSquares={getSquares}
                  bonusText={d.bonusText}
                  gameContext={props.gameContext}
                />
            )}
      <div style={{display : props.isRotating ? "none" : ""}}>
        <Lines points={points} fadeOut={props.currentWord.length === 0}/>
      </div>
    </div>;
  }

  export default Grid;