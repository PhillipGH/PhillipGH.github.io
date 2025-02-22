import {useEffect, useRef, useState } from "react";
import { DEL, DiceBonus, EXCLAIM, nextAlphabetLetter, REROLL_TIME_BONUS, TDie } from "./Dice";
import Grid from "./Grid";
import React from 'react';
import { TGameStats } from "./GameStats";
import CoordinateSet, { runUnion } from "./unionfind";

// missing words: natal
// fake words: ted, tho lite

const OVERRIDE_SCORE = null;
const OVERRIDE_TIME = null;

function fib(n: number): number {
  if (n === 0) return 0;
  if (n === 1) return 1;
  return fib(n - 1) + fib(n - 2);
}

const ROTATION_COORDS: [number, number][] = [
  [-1,-1],
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
];

function chunkArray<T>(arr: T[], columns: number) {
  const result = arr.reduce<(T | null)[][]>((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / columns)

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

  // center the bottom
  if (result[0].length - result[result.length - 1].length > 1) {
    result[result.length - 1].unshift(null);
    if (result[0].length === 5 && result[result.length - 1].length === 2) {
      result[result.length - 1].unshift(null);
    }
  }
  return result;
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

  // changes die to a different letter, if possible
  function rerollDie(die: TDie) {
    let faces = die.faces.filter(c => c != die.letter);
    if (faces.length === 0) {
      faces = die.faces;
    }
    die.letter = faces[Math.floor(Math.random() * faces.length)];
  }

  function tokenizeWord(word: string): string[] {
    const tokens : string[] = [];
    for (let i = 0; i < word.length; i++) {
      let token = word[i];
      if (token === DEL[0]) {
        token = word.slice(i, i + DEL.length);
        i += DEL.length - 1;
      } else if (i < word.length - 1 && word[i+1] === '/') {
        token = word.slice(i, i + 3);
        i+=2;
      }
      tokens.push(token);
    }
    return tokens;
  }

  function scoreWord(word: string, dice: TDie[]) {
    let multiplier = 1;
    let bonus = 0;
    let penalty = 0;
    if (dice[0].bonus === DiceBonus.B_PLUS4) {
        bonus += 4;
    }
    for (let i = 0; i < dice.length; i++) {
        switch (dice[i].bonus) {
            case DiceBonus.B_2X:
                multiplier *= 2;
                break;
            case DiceBonus.B_15X:
                multiplier *= 1.5;
                break;
            case DiceBonus.B_ALPHABET:
                multiplier *= 1.5;
                break;
            case DiceBonus.B_MULTIPLIER_COUNTER:
                multiplier *= (dice[i].counter || 1);
                break;
            case DiceBonus.B_MINUS3:
                penalty += 3;
                break;
            case DiceBonus.B_REROLL_WORD:
              penalty += 3;
              break;
        }
    }

    const tokens = tokenizeWord(word);
    let length = tokens.length;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] == DEL) {
        length -= 2;
      }
      if (tokens[i] == EXCLAIM) {
        length -= EXCLAIM.length;
      }
    }
    if (length < 3) {
      return null;
    }
    const baseScore = length - 3 + fib(length-2) * 3;
    // return Math.round((baseScore + bonus) * multiplier - penalty);
    return {baseScore, bonus, multiplier, penalty};
}

type TLastWord = {word: string, score?: number, invalidReason?: string | null};

function DisplayWord(props: {
  currentWord: TDie[],
  lastWord: TLastWord,
}) {
  let word : JSX.Element | null = null;
  let suffix : JSX.Element | null = null;
  if (props.currentWord.length > 0) {
    let w = props.currentWord.map(d => d.letter).join('');
    const tokens = tokenizeWord(w);
    const s = scoreWord(w, props.currentWord);
    w = '';
    let delCounter = 0;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === DEL) {
        delCounter++;
      } else if (tokens[i] == EXCLAIM) {
        if (i == tokens.length - 1)
          w += tokens[i];
      } else {
        w += tokens[i];
      }
    }
    for (let i = 0; i < delCounter; i++) {
      w += DEL;
    }
    if (s) {
      let scoreCalc = s.baseScore + '';
      if (s.bonus > 0) {
        scoreCalc = scoreCalc + ' + ' + s.bonus;
      }
      if (s.multiplier != 1) {
        if (s.bonus === 0) {
          scoreCalc = scoreCalc + ' x ' + s.multiplier;
        } else {
          scoreCalc = '[' + scoreCalc + '] x ' + s.multiplier;
        }
        
      }
      if (s.penalty != 0) {
        scoreCalc = scoreCalc + ' - ' + s.penalty;
      }
      word = <p>{w.toUpperCase()}<sub>{'(' + scoreCalc + ')'}</sub></p>;
    } else {
      word = <p>{w.toUpperCase()}</p>;
    }
  } else if (props.lastWord.word != '') {
    if (props.lastWord.invalidReason != null) {
      word = <p className="fadeOut invalidWord">{props.lastWord.word}</p>;
      suffix = <p className="fadeOut">{props.lastWord.invalidReason}</p>;
    } else {
        word = <p className="fadeOut validWord">{props.lastWord.word}</p>;
        suffix = <p className="fadeOut"><sub>{'('+ props.lastWord.score +')'}</sub></p>;
    }
  }
  return <div className="currentWord" style={{display:'flex'}}>
      {word}
      {suffix}
    </div>
}

function Board(props: {
    dictionary: Set<string>,
    level: number,
    inputDice: TDie[],
    onWin: () => void,
    onLose: () => void,
    rerollCounter: number | null,
    setRerollCounter: (n: number|null) => void,
    stats: TGameStats,
    setStats: (n: TGameStats) => void
  }) {
    function useRerollCharge() {
      setTimeBonus(timeBonus + REROLL_TIME_BONUS);
      props.setRerollCounter((props.rerollCounter || 1) - 1);
      reroll();
    }

    function reroll() {
      const columns = props.inputDice.length < 21 ? 4 : 5;
      setDice(chunkArray(rollBoard(props.inputDice), columns));
    }
    useEffect(() => {
      reroll();
      return () => clearTimeout(timeoutRef.current);
    }, []);
    const [dice, setDice] = useState<(TDie | null)[][]>([]);
    const [currentWord, setCurrentWord] = useState<TDie[]>([]);
    const [lastWord, setLastWord] = useState<TLastWord>({word: ''});
    const [score, setScore] = useState<number>(0);
    const [isRotating, setIsRotating] = useState(false);
    const timeoutRef = useRef(0);
    const [timeBonus, setTimeBonus] = useState(0);
  
    const [usedWords, setUsedWords] = useState(new Set<string>());
  
    //timer
    const [startTime, setStartTime] = useState(0);
    const [now, setNow] = useState(0);
    const intervalRef = useRef(0);

    let requiredScore = OVERRIDE_SCORE || 18 + 18 * props.level;
    const TimeLimit = OVERRIDE_TIME || 105 + props.level * 5 + timeBonus;
    // const TimeLimit = 300 + props.level * 5 + timeBonus;

  function wordIsInDictionary(word: string, ref = { isUsed: false }): string | null {
    if (props.dictionary.has(word)) {
      return word;
    }
    const index = word.search(/\/|\*|🔙|!/);
    let usedWord: string | null = null;
    if (index > -1) {
      let alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
      let regex = /\*/;
      if (word[index] === EXCLAIM[0]) {
        word = word.replace(EXCLAIM, '');
        return wordIsInDictionary(word, ref);
      } else if (word[index] === '/') {
        alphabet = [word[index - 1], word[index + 1]];
        regex = /[a-z]\/[a-z]/;
      } else if (word[index] === DEL[0]) {
        word = word.replace(DEL, '');
        const tokens = tokenizeWord(word);
        for (let i = 0; i < tokens.length; i++) {
          // TODO maybe we should make it so deletes can't delete other deletes?
          const ref2 = { isUsed: false };
          const slicedTokens = tokens.slice();
          slicedTokens.splice(i, 1);
          const slicedWord = slicedTokens.join('');
          let result = wordIsInDictionary(slicedWord, ref2);
          if (result) {
            if (ref2.isUsed || usedWords.has(result)) {
              ref.isUsed = true;
              usedWord = result;
            } else {
              ref.isUsed = false;
              return result;
            }
          }
        }
        return usedWord;
      }
      for (let i = 0; i < alphabet.length; i++) {
        const ref2 = { isUsed: false };
        let result = wordIsInDictionary(word.replace(regex, alphabet[i]), ref2);
        if (result) {
          if (ref2.isUsed || usedWords.has(result)) {
            ref.isUsed = true;
            usedWord = result;
          } else {
            ref.isUsed = false;
            return result;
          }
        }
      }
    }
    return usedWord;
  }

  function getDiceCoord(die: TDie): [number, number] {
    for (let i = 0; i < dice.length; i++) {
      for (let j = 0; j < dice[i].length; j++) {
        if (dice[i][j] === die) {
          return [i, j];
        }
      }
    }
    return [-1, -1];
  }

  function mutateBoard() {
    let rerollWord = false;
    const rotationDice: TDie[] = [];
    let swapDice = false;
    for (let i = 0; i < currentWord.length; i++) {
      let die = currentWord[i];
      switch (die.bonus) {
        case DiceBonus.B_ALPHABET:
          die.letter = nextAlphabetLetter(die.letter);
          setDice([...dice]);
          break;
        case DiceBonus.B_MULTIPLIER_COUNTER:
          die.counter = (die.counter || 1) + 1;
          setDice([...dice]);
          break;
        case DiceBonus.B_REROLL_WORD:
          rerollWord = true;
          break;
        case DiceBonus.B_ROTATE:
          rotationDice.push(die);
          break;
        case DiceBonus.B_SWAP:
          swapDice = true; // could instead unswap?
          break;
      }
    }
    if (rerollWord) {
      currentWord.map(die => rerollDie(die));
      setDice([...dice]);
    }
    if (rotationDice) {
      const moves: { x: number, y: number }[][] = [];
      let rotationPoints = new CoordinateSet();
      for (let index = 0; index < rotationDice.length; index++) {
        const centerDie = rotationDice[index];
        const [i, j] = getDiceCoord(centerDie);
        rotationPoints.add(i, j);
        const coords = ROTATION_COORDS.map(p => { return { x: i + p[0], y: j + p[1] } });
        moves.push(coords);
      }
      // combine moves that form the same cycle
      const edges: [number, number][] = [];
      for (let index = 0; index < moves.length; index++) {
        for (let index2 = index + 1; index2 < moves.length; index2++) {
          if (moves[index].find(p1 => {
            return moves[index2].find(p2 => p1.x === p2.x && p1.y === p2.y)
          })) {
            edges.push([index, index2]);
          }
        }
      }
      const cycles = runUnion(moves.length, edges);

      // now find the longest path that follows the rules in each cycle
      for (let cycleIndex = 0; cycleIndex < cycles.length; cycleIndex++) {
        // first, find all valid points for the path.
        let validPoints = new CoordinateSet();
        cycles[cycleIndex].forEach(movesIndex => {
          moves[movesIndex].forEach(p => {
            if (!rotationPoints.has(p.x, p.y))
              validPoints.add(p.x, p.y);
          })
        });

        // now start constructing the path
        // find the top leftmost square and go x -1
        // got coords confused at some point so it's actually bottom left going up
        const startPoint = validPoints.getRightmostTop();
        const startPath = [startPoint, { x: startPoint.x - 1, y: startPoint.y }];
        function dfs(path: { x: number, y: number }[]): null | { x: number, y: number }[] {
          const last = path[path.length - 1];
          if (!validPoints.has(last.x, last.y)) {
            return null;
          }
          for (let i = 0; i < path.length - 1; i++) {
            if (path[i].x === last.x && path[i].y === last.y) {
              if (i === 0) {
                return path;
              } else {
                return null;
              }
            }
          }
          const paths = [
            dfs([...path, { x: last.x + 1, y: last.y }]),
            dfs([...path, { x: last.x, y: last.y + 1 }]),
            dfs([...path, { x: last.x - 1, y: last.y }]),
            dfs([...path, { x: last.x, y: last.y - 1 }]),
          ];
          const validPaths = paths.filter(p => p != null);
          if (paths.length === 0) {
            return null;
          }
          validPaths.sort((a, b) => b.length - a.length);
          return validPaths[0];
        }

        let path = dfs(startPath);
        if (path !== null) {
          path = path.slice(0, path.length - 1);
          // filter out invalid squares
          path = path.filter(p => {
            return p.x >= 0 && p.x < dice.length && p.y >= 0 && p.y < dice[0].length && dice[p.x][p.y] != null;
          });
          // rotate the dice
          let tmp = dice[path[path.length - 1].x][path[path.length - 1].y];
          for (let k = 0; k < path.length; k++) {
            let p = path[k];
            let tmp2 = dice[p.x][p.y];
            dice[p.x][p.y] = tmp;
            tmp = tmp2;
          }
        }
      }

      /*
      for (let index = 0; index < rotationDice.length; index++) {
        const centerDie = rotationDice[index];
        const [i, j] = getDiceCoord(centerDie);
        const coords = ROTATION_COORDS.map(p => [i + p[0], j + p[1]]).filter(p => {
          return p[0] >= 0 && p[0] < dice.length && p[1] >= 0 && p[1] < dice[0].length && dice[p[0]][p[1]] != null;
        });
        // rotate the dice
        let tmp = dice[coords[coords.length - 1][0]][coords[coords.length - 1][1]];
        for (let k = 0; k < coords.length; k++) {
          let p = coords[k];
          let tmp2 = dice[p[0]][p[1]];
          dice[p[0]][p[1]] = tmp;
          tmp = tmp2;
        }
      }
        */

      setDice([...dice]);
    }
    if (swapDice) {
      const [x1, y1] = getDiceCoord(currentWord[0]);
      const [x2, y2] = getDiceCoord(currentWord[currentWord.length - 1]);
      let temp = dice[x1][y1];
      dice[x1][y1] = dice[x2][y2];
      dice[x2][y2] = temp;
      setDice([...dice]);
    }
    if (currentWord[currentWord.length -1].letter.endsWith(EXCLAIM)) {
      for (let index = 0; index < currentWord.length; index++) {
        const die = currentWord[index];
        const [i, j0] = getDiceCoord(die);
        for (let j = j0; j < dice[0].length; j++) {
          if (j < dice[0].length - 1) {
            dice[i][j] = dice[i][j+1];
          } else {
            dice[i][j] = null;
          }
        }
      }
      setDice([...dice]);
    }
  }

  function commitWord() {
    let suffix: string | null = null;
    let scoreChange = 0;
    let word = currentWord.map(d => d.letter).join('');
    let finalWord: string | null = null;
    if (word.length === 0) {
      return;
    }
    if (finalWord = wordIsInDictionary(word)) {
      word = finalWord;
      if (word.length < 3) {
        suffix = String.fromCodePoint(0x1f6ab) + ' (too short)';
      } else {
        if (usedWords.has(word)) {
          suffix = String.fromCodePoint(0x1f6ab) + ' (already played)';
        } else {
          setUsedWords(new Set(usedWords.add(word)));
          const s = scoreWord(word, currentWord);
          if (s)
            scoreChange = Math.round((s.baseScore + s.bonus) * s.multiplier - s.penalty);
          setScore(score + scoreChange);
          if (score + scoreChange >= requiredScore) {
            clearInterval(intervalRef.current);
          }

          props.stats.totalWords++;
          if (props.stats.nLetterWords[word.length] == null) {
            props.stats.nLetterWords[word.length] = 0;
          }
          props.stats.nLetterWords[word.length]++;

          if (word.length > props.stats.longestWord.length)
            props.stats.longestWord = word;
          if (scoreChange > props.stats.highestWordScore) {
            props.stats.highestWordScore = scoreChange;
            props.stats.highestWordScoreWord = word;
          }
          props.setStats(props.stats);
          mutateBoard();
        }
      }
    } else {
      suffix = String.fromCodePoint(0x1f6ab);
    }
    let last = word.toUpperCase();
    setLastWord({ word: last, score: scoreChange, invalidReason: suffix });
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

    useEffect(() => {
      let secondsPassed = Math.round((now - startTime) / 1000);
      let secondsLeft = TimeLimit - secondsPassed;
      if (secondsLeft < 0) {
        clearInterval(intervalRef.current);
        props.stats.currentLevel = props.level;
        props.stats.currentLevelRequiredScore = requiredScore;
        props.stats.currentLevelScore = score;
        props.setStats(props.stats);
        props.onLose();
      }
    }, [now, startTime, timeBonus, score]);
  
    let overlay : null | JSX.Element = null;
    if (score >= requiredScore) {
      overlay = <div id="winOverlay">
        <div>
          <h2>Level {props.level} Complete!</h2>
          <button onClick={() => {
            props.onWin();
          }}>Continue</button>
        </div>
      </div>;
    }

    let secondsPassed = Math.round((now - startTime) / 1000);
    let secondsLeft = TimeLimit - secondsPassed;
    let minutes = Math.floor(secondsLeft / 60);
    let seconds = secondsLeft % 60;

    const timerHueProgress = Math.min(secondsLeft, 45) / 45.0;
    const timerHue = timerHueProgress * 120;
    const timerSaturationProgress = 1 - Math.min(secondsLeft, 45) / 45.0;
    const timerSaturation = timerSaturationProgress * 70.0 + 30.0;
  
    let progress = Math.min((score / requiredScore) * 100, 100);

    const rotateButton = <button onClick={() => {
      if (isRotating) return;
      setIsRotating(true);
      clearTimeout(timeoutRef.current);
      setDice(dice[0].map((_val, index) => dice.map(row => row[index]).reverse()));
      timeoutRef.current = setTimeout(() => {
        setIsRotating(false);
      }, 250);
      
    }}>Rotate</button>;
  
    let rerollButton : null | React.JSX.Element = null;
    if  (props.rerollCounter !== null) {
      rerollButton = <button disabled={props.rerollCounter <= 0} onClick={() => {
        useRerollCharge();
      }}>Reroll +30s ({props.rerollCounter})</button>;
    }
    return <div>
      <div className="buttons">{rerollButton}{rotateButton}</div>
            
      <h1 className="timer" style={{color:'hsl('+ timerHue +', ' + timerSaturation + '%, 50%)'}}>{minutes}:{seconds < 10 ? '0' + seconds : seconds}</h1>
      <div id="progressbar">
        <div style={{width: progress + '%'}}></div>
        <center><label>{score} / {requiredScore}</label></center>
      </div>
      <DisplayWord lastWord={lastWord} currentWord={currentWord}/>
      <div className='container'>
        <Grid dice={dice} currentWord={currentWord} setCurrentWord={setCurrentWord} commitWord={commitWord} isRotating={isRotating} />
      </div>
      {overlay}
    </div>;
  }

  export default Board;