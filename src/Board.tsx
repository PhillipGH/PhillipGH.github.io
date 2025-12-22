import {useEffect, useRef, useState } from "react";
import { DEL, DiceBonus, EXCLAIM, nextAlphabetLetter, REROLL_TIME_BONUS, TDie } from "./Dice";
import Grid from "./Grid";
import React from 'react';
import { TGameStats } from "./GameStats";
import CoordinateSet, { runUnion } from "./unionfind";
import { solveForWords } from "./Solver";
import {getRoundDataFromSaveState } from "./App";
import { getRequiredScore, getTimeLimit, Variant } from "./Variants";

type TEvent = { die?: TDie, timing: number};

// missing words: natal
// fake words: ted, tho, lite

const ALL_WORDS_VALID = false;

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

// for balancing:
// for (let i = 3; i <= 12; i++) {
//   console.log(i, i - 3 + fib(i-2) * 3, getBaseScore(i));
// }

// function fib(n: number): number {
//   if (n === 0) return 0;
//   if (n === 1) return 1;
//   return fib(n - 1) + fib(n - 2);
// }

function getBaseScore(n: number): number {
  if (n <= 4) return 1;
  if (n === 5) return 3;
  return getBaseScore(n - 1) * 2 - 1;
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

  export function shuffle<T>(array: T[]) {
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

  function spliceNoMutate<T>(myArray: T[], indexToRemove: number) {
    return myArray.slice(0,indexToRemove).concat(myArray.slice(indexToRemove+1));
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

  function scoreWord(word: string, dice: TDie[], currentLevel: number, variant: Variant) {
    let multiplier = 1;
    let bonus = 0;
    let penalty = 0;

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

        if (dice[0].bonus === DiceBonus.B_PLUS1) {
        bonus += 1;
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
            case DiceBonus.B_MINUS1:
                penalty += 1;
                break;
            case DiceBonus.B_REROLL_WORD:
              penalty += 2;
              break;
            case DiceBonus.B_PLUS_LEVEL:
              if (length > currentLevel)
                bonus += currentLevel;
              break;
        }
    }
    let baseScore = getBaseScore(length);
    // return Math.round((baseScore + bonus) * multiplier - penalty);
    if (variant === Variant.WORDSMITH && length < 5) {
      baseScore = 0;
    }
    return {baseScore, bonus, multiplier, penalty};
}

type TLastWord = {word: string, score?: number, invalidReason?: string | null};

function DisplayWord(props: {
  currentWord: TDie[],
  lastWord: TLastWord,
  currentLevel: number,
  variant: Variant,
}) {
  let word : JSX.Element | null = null;
  let suffix : JSX.Element | null = null;
  if (props.currentWord.length > 0) {
    let w = props.currentWord.map(d => d.letter).join('');
    const tokens = tokenizeWord(w);
    const s = scoreWord(w, props.currentWord, props.currentLevel, props.variant);
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

function PauseMenu(props: {
  onResume: () => void,
  onQuit: () => void,
}) {
  const [iSQuitting, setIsQuitting] = useState(false);
  if (iSQuitting) {
    return <div>
    <h2>Are you sure you want to quit this run?</h2>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <button onClick={() => {
        props.onQuit();
      }}>Yes</button>
      <button onClick={() => {
        setIsQuitting(false);
      }}>No</button>
    </div>
  </div>;
  }
  return <div>
    <h2>Paused</h2>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <button onClick={() => {
        props.onResume();
      }}>Continue</button>
      <button onClick={() => {
        setIsQuitting(true);
      }}>Quit Run</button>
    </div>
  </div>;
}

function Board(props: {
  dictionary: Set<string>,
  dictionarySorted: string[],
  level: number,
  variant: Variant,
  inputDice: TDie[],
  onWin: () => void,
  onLose: () => void,
  rerollCounter: number | null,
  setRerollCounter: React.Dispatch<React.SetStateAction<number | null>>,
  stats: TGameStats,
  setStats: (n: TGameStats) => void,
  setSaveData: (score: number, timeSinceStart: number, usedWords: Set<string>, board: (TDie | null)[][]) => void,
  usedWords: Set<string>,
  setUsedWords: React.Dispatch<React.SetStateAction<Set<string>>>,
}) {

  function useRerollCharge() {
      setTimeBonus(timeBonus + REROLL_TIME_BONUS);
      props.setRerollCounter((props.rerollCounter || 1) - 1);
      reroll();
    }

    function reroll() {
      clearTimeout(eventTimeoutRef.current);
      handleStop();
      const columns = props.inputDice.length < 21 ? 4 : 5;
      const diceOrdered = rollBoard(dice.length > 0 ? dice.flat().filter(d => d != null) as TDie[] : props.inputDice);
      const diceChunked = chunkArray(diceOrdered, columns);
      setDice(diceChunked);

      let corners = [
        [0, 0],
        [diceChunked.length - 1, 0],
        [diceChunked.length - 1, diceChunked[0].length - 1],
        [0, diceChunked[0].length - 1],
      ];

      corners = corners.map((p) => {
        if (diceChunked[p[0]][p[1]] == null)
          return [p[0] === 0 ? p[0] + 1 : p[0] - 1, p[1]];
        else return p;
      });
      shuffle(corners);

      // search for on reroll effects:
      let events: TEvent[] = [];
      for (let i = 0; i < diceOrdered.length; i++) {
        switch (diceOrdered[i].bonus) {
          case DiceBonus.B_XREROLL:
            if (
              diceOrdered[i].counter == null
              &&
              (diceOrdered[i].letter === "x" ||
              diceOrdered[i].letter === "z")
            ) {
              events.push({ die: diceOrdered[i], timing: 500 });
            }
            break;
          case DiceBonus.B_CORNER_SWAP:
            events.push({ die: diceOrdered[i], timing: 500 });
            break;
          case DiceBonus.B_VOWEL_SWAP:            
            events.push({ die: diceOrdered[i], timing: 500 });
            break;
        }
      }
      setEventsQueue(events);

      function processEvent() {
        if (events.length === 0) {
          recalculateHints(diceChunked);
          handleStart();
          return;
        }
        const event = events[0];
        const bonusText: { die: TDie; str: string }[] = [];
        switch (event?.die?.bonus) {
          case DiceBonus.B_XREROLL:
            props.setRerollCounter((c) => (c || 0) + 1);
            bonusText.push({ die: event.die, str: "+1 Reroll" });
            event?.die && (event.die.counter = 1);
            setDice([...diceChunked]);
            break;
          case DiceBonus.B_CORNER_SWAP:
            if (corners.length === 0) break;
            bonusText.push({ die: event.die, str: "Corner" });
            const [x1, y1] = getDiceCoord(event?.die, diceChunked);
            if (corners.find((p) => p[0] === x1 && p[1] === y1)) break;

            const c = corners.pop();
            if (!c) break;
            let temp = diceChunked[x1][y1];
            diceChunked[x1][y1] = diceChunked[c[0]][c[1]];
            diceChunked[c[0]][c[1]] = temp;
            setDice([...diceChunked]);
            break;
          case DiceBonus.B_VOWEL_SWAP:
            const [x,y] = getDiceCoord(event.die, diceChunked);
            console.log(x,y);
            // check if any adjacent dice are vowels
            let adjacentVowelCount = 0;
            for (let [dx, dy] of ROTATION_COORDS) {
              if (diceChunked[x + dx]?.[y + dy]?.letter.match(/(?<!q)[aeiou]/)) {
                console.log(diceChunked[x + dx]?.[y + dy]?.letter);
                adjacentVowelCount++;
              }
            }
            if (adjacentVowelCount > 1) break;
            bonusText.push({ die: event.die, str: "Vowel Swap" });
            // change die to 'e'
            event.die.letter = 'e';
            setDice([...diceChunked]);
            break;
        }
        events = events.slice(1, events.length);
        setEventsQueue(events);
        setBonusText(bonusText);

        eventTimeoutRef.current = setTimeout(() => {
          processEvent();
        }, event.timing);
      }
      eventTimeoutRef.current = setTimeout(() => {
        setIsDealing(false);
        eventTimeoutRef.current = setTimeout(() => {
          setIsDealing(false);
          processEvent();
        }, 1000);
      }, 20);
    }
    useEffect(() => {
      // if we have a cookie, use it, else reroll
      const data = getRoundDataFromSaveState();
      if (data && data.level === props.level && data.board?.length) {
        setTotalTimeSinceStart(data.timeSinceStart);
        setScore(data.score);
        props.setUsedWords(new Set(data.usedWords));
        setDice(data.board);
        setIsDealing(false);
        handleStart();
      } else {
        if (props.variant !== Variant.BLACKOUT) {
          props.setUsedWords(new Set());
        }
        reroll();
      }
    }, []);

    useEffect(() => {
      return () => {
        clearTimeout(timeoutRef.current);
        clearTimeout(eventTimeoutRef.current);
        clearInterval(intervalRef.current);
      } 
    }, []);
    const [dice, setDice] = useState<(TDie | null)[][]>([]);
    const [currentWord, setCurrentWord] = useState<TDie[]>([]);
    const [lastWord, setLastWord] = useState<TLastWord>({word: ''});
    const [score, setScore] = useState<number>(0);
    const [isRotating, setIsRotating] = useState(false);
    const [isDealing, setIsDealing] = useState(true);
    
    const timeoutRef = useRef(0);
    const eventTimeoutRef = useRef(0);
    const [timeBonus, setTimeBonus] = useState(0);
  
    //timer
    const [startTime, setStartTime] = useState(0);
    const [now, setNow] = useState(0);
    const [totalTimeSinceStart, setTotalTimeSinceStart] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [eventsQueue, setEventsQueue] = useState<TEvent[]>([]);
    const [bonusText, setBonusText] = useState<{die: TDie, str: string}[]>([]);
    const [levelisWon, setLevelIsWon] = useState(false);

    const isInEvent = eventsQueue.length > 0;

    const intervalRef = useRef(0);

    let requiredScore = getRequiredScore(props.variant, props.level);
    const TimeLimit = getTimeLimit(props.variant, props.level);
    // const TimeLimit = 300 + props.level * 5 + timeBonus;



  function wordIsInDictionary(word: TDie[]): {dice: TDie[], contributions: string[]} | null {
    return wordIsInDictionaryHelper(word, word.map(d => d.letter));
  }

  function wordIsInDictionaryHelper(dice: TDie[], contributions: string[], ref = { isUsed: false }): {dice: TDie[], contributions: string[]} | null {
    let stringWord = contributions.join("");
    if (ALL_WORDS_VALID || props.dictionary.has(stringWord)) {
      return {dice, contributions};
    }
    let dieIndex = -1;
    let letterIndex = -1;
    for (let i = 0; i < contributions.length; i++) {
      letterIndex = contributions[i].search(/\/|\*|🔙|!/);
      if (letterIndex > -1) {
        dieIndex = i;
        break;
      }
    }

    if (dieIndex < 0) {
      return null;
    }

    dice = dice.slice();
    contributions = contributions.slice();

    let usedWord: {dice: TDie[], contributions: string[]} | null = null;
    let alphabet = ALPHABET;
    let regex = /\*/;

    let dieStr = contributions[dieIndex];
    // if (word[index] === EXCLAIM[0]) {
    //   word = word.replace(EXCLAIM, "");
    //   return wordIsInDictionary(word, ref); } else
    if (dieStr[letterIndex] === "/") {
      alphabet = [dieStr[letterIndex - 1], dieStr[letterIndex + 1]];
      regex = /[a-z]\/[a-z]/;
    } else if (dieStr[letterIndex] === DEL[0]) {
      // remove dieIndex from word
      contributions[dieIndex] = '';
      //const tokens = tokenizeWord(word);
      for (let i = 0; i < dice.length; i++) {
        // TODO maybe we should make it so deletes can't delete other deletes?
        const ref2 = { isUsed: false };
        let result = wordIsInDictionaryHelper(spliceNoMutate(dice, i), spliceNoMutate(contributions, i), ref2);
        if (result) {
          if (ref2.isUsed || props.usedWords.has(result.contributions.join(""))) {
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
      // const newWord = word.slice();
      let newString = dieStr.replace(regex, alphabet[i]);
      const contributionsCopy = contributions.slice();
      contributionsCopy[dieIndex] = newString;
      let result = wordIsInDictionaryHelper(dice, contributionsCopy, ref2);
      if (result) {
        if (ref2.isUsed || props.usedWords.has(result.contributions.join(""))) {
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

  function getDiceCoord(die: TDie, diceArray?: (TDie | null)[][]): [number, number] {
    const d = diceArray || dice;
    for (let i = 0; i < d.length; i++) {
      for (let j = 0; j < d[i].length; j++) {
        if (d[i][j] === die) {
          return [i, j];
        }
      }
    }
    return [-1, -1];
  }

  function recalculateHints(diceArray: (TDie | null)[][], used?: Set<string>) {
    for (let i = 0; i < diceArray.length; i++) {
      for (let j = 0; j < diceArray[0].length; j++) {
        const die = diceArray[i][j];
        if (!die) continue;
        switch (die.bonus) {
          case DiceBonus.B_HINT:
            const hints = solveForWords(i,j, diceArray, props.dictionary, props.dictionarySorted);
            let hint: string | null = null;
            let longest = '';
            for (const s of hints) {
              if (used ? used.has(s) : props.usedWords.has(s)) continue;
              if (s.length > longest.length) {
                longest = s;
              }
            }
            if (longest.length > 4) {
              hint = longest;
              die.savedStr = hint.substring(0,4);
            } else {
              die.savedStr = undefined;
            }
            // console.log(hints, hint);
            break;
        }
      }
    }
  }

  function mutateBoard(word: {dice: TDie[], contributions: string[]}): (TDie | null)[][] {
    let rerollWord = false;
    const rotationDice: TDie[] = [];
    let swapDice = 0;
    for (let i = 0; i < word.dice.length; i++) {
      let die = word.dice[i];
      if (props.variant === Variant.BLACKOUT)
        die.usedThisLevel = true;
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
          bonusText.push({die: die, str: '+5 seconds'});
          setTimeBonus(t => t + 5);
          rerollWord = true;
          break;
        case DiceBonus.B_ROTATE:
          rotationDice.push(die);
          break;
        case DiceBonus.B_SWAP:
          swapDice++; // could instead unswap?
          bonusText.push({die: die, str: '+5 seconds'});
          break;
      }
    }
    if (rerollWord) {
      word.dice.map(die => rerollDie(die));
      setDice([...dice]);
    }
    if (rotationDice) {
      const moves: { x: number, y: number }[][] = [];
      const centerPoints: { x: number, y: number }[] = [];
      let rotationPoints = new CoordinateSet();
      for (let index = 0; index < rotationDice.length; index++) {
        const centerDie = rotationDice[index];
        const [i, j] = getDiceCoord(centerDie);
        rotationPoints.add(i, j);
        const coords = ROTATION_COORDS.map(p => { return { x: i + p[0], y: j + p[1] } });
        moves.push(coords);
        centerPoints.push( { x: i, y: j});
      }
      // combine moves that form the same cycle
      const edges: [number, number][] = [];
      const filteredCornerPoints = new CoordinateSet();
      for (let index = 0; index < moves.length; index++) {
        for (let index2 = index + 1; index2 < moves.length; index2++) {
          // only combine if there's more than one overlap square,
          // else if there's one then don't combine and add the overlap
          // square to the special list of squares to filter out of paths.
          const overlap = moves[index].filter(p1 =>
            moves[index2].find(p2 => p1.x === p2.x && p1.y === p2.y)
          );
          if (overlap.length > 1) {
            edges.push([index, index2]);
          } else if (overlap.length === 1) {
            filteredCornerPoints.add(overlap[0].x, overlap[0].y);
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
        if (path != null) {
          path = path.slice(0, path.length - 1);

          // filter out invalid squares
          path = path.filter(p => {
            return p.x >= 0 &&
              p.x < dice.length &&
              p.y >= 0 &&
              p.y < dice[0].length &&
              dice[p.x][p.y] != null &&
              !filteredCornerPoints.has(p.x,p.y);
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
      setDice([...dice]);
    }
    if (swapDice > 0) {
      const [x1, y1] = getDiceCoord(word.dice[0]);
      const [x2, y2] = getDiceCoord(word.dice[word.dice.length - 1]);
      let temp = dice[x1][y1];
      dice[x1][y1] = dice[x2][y2];
      dice[x2][y2] = temp;
      setTimeBonus(t => t + 5 * swapDice);
      setDice([...dice]);
    }
    if (word.dice[word.dice.length -1].letter.endsWith(EXCLAIM)) {
      for (let index = 0; index < word.dice.length; index++) {
        const die = word.dice[index];
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
    setBonusText(bonusText);
    return dice;
  }

  function commitWord() {
    let suffix: string | null = null;
    let scoreChange = 0;
    let timeChange = 0;
    let word = currentWord.map(d => d.letter).join('');
    let newUsedWords = props.usedWords;
    let newDice = dice;
    if (word.length === 0) {
      return;
    }
    const result =  wordIsInDictionary(currentWord);
    if (result) {
      word = result.contributions.join("");;
      if (word.length < 3) {
        suffix = String.fromCodePoint(0x1f6ab) + ' (too short)';
      } else {
        if (props.usedWords.has(word)) {
          suffix = String.fromCodePoint(0x1f6ab) + ' (already played)';
        } else {
          newUsedWords = new Set(props.usedWords.add(word));
          props.setUsedWords(newUsedWords);
          const s = scoreWord(word, currentWord, props.level, props.variant);
          if (s) {
            scoreChange = Math.round((s.baseScore + s.bonus) * s.multiplier - s.penalty);
            if (props.variant === Variant.WORDSMITH) {
              if ( word.length >= 5) {
                timeChange = -11 + 3 * word.length; // 3 seconds per letter
              }
            }
          }
            
          setScore(score + scoreChange);
          setTimeBonus(t => t + timeChange);
          if (score + scoreChange >= requiredScore) {
            if (props.variant === Variant.BLACKOUT) {
              // wrap the score around and give +1 reroll
              setScore(score + scoreChange - requiredScore); // TODO handle multiple rerolls
              props.setRerollCounter((props.rerollCounter || 0) + 1);
            } else {
              clearInterval(intervalRef.current);
              setLevelIsWon(true);
            }
          }
          
          props.stats.totalWords++;
          if (props.stats.nLetterWords[word.length] == null) {
            props.stats.nLetterWords[word.length] = 0;
          }
          props.stats.nLetterWords[word.length]++;

          if (word.length > props.stats.longestWords[0].length)
            props.stats.longestWords = [word];
          else if (word.length === props.stats.longestWords[0].length)
            props.stats.longestWords.push(word);
          if (scoreChange > props.stats.highestWordScore) {
            props.stats.highestWordScore = scoreChange;
            props.stats.highestWordScoreWord = word;
          }
          props.setStats(props.stats);
          newDice = mutateBoard(result);
          if (props.variant === Variant.BLACKOUT) {
            // check if all dice are used
            let allUsed = true;
            for (let i = 0; i < newDice.length; i++) {
              for (let j = 0; j < newDice[i].length; j++) {
                const die = newDice[i][j];
                if (die && !die.usedThisLevel) {
                  allUsed = false;
                  break;
                }
              }
            }
            if (allUsed) {
              clearInterval(intervalRef.current);
              setLevelIsWon(true);
            }
          }
        }
      }
    } else {
      suffix = String.fromCodePoint(0x1f6ab);
    }
    let last = word.toUpperCase();
    setLastWord({ word: last, score: scoreChange, invalidReason: suffix });
    setCurrentWord([]);
    recalculateHints(newDice, newUsedWords);
  }

  const saveCallbackRef = useRef<() => void>();
  saveCallbackRef.current = () => {
    props.setSaveData(
      score,
      totalTimeSinceStart + Date.now() - startTime,
      props.usedWords,
      dice,
    );
  };


    // called at start and for unpause
    function handleStart() {
      setStartTime(Date.now());
      setNow(Date.now());
      clearInterval(intervalRef.current);
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setNow(Date.now());
        if (saveCallbackRef.current)
          saveCallbackRef.current();
      }, 10);
    }

    function handlePause() {
      if (isPaused || isInEvent)
        return;
      handleStop();
      setIsPaused(true);
    }

    // pausing and reroll animations
    function handleStop() {
      clearInterval(intervalRef.current);
      setNow(Date.now());
      setStartTime(Date.now());
      if (startTime > 0)
        setTotalTimeSinceStart(totalTimeSinceStart + Date.now() - startTime);
    }

    let secondsPassed = (now - startTime + totalTimeSinceStart) / 1000;
    let secondsLeft = Math.floor(TimeLimit + timeBonus - secondsPassed);
    let minutes = Math.floor(secondsLeft / 60);
    let seconds = secondsLeft % 60;


    // todo: it would be more react-style to not useEffect for this (https://react.dev/learn/you-might-not-need-an-effect)
    useEffect(() => {
      if (secondsLeft < 0) {
        if ((props.rerollCounter || 0) > 0) {
          useRerollCharge();
        } else {
          clearInterval(intervalRef.current);
          props.stats.currentLevel = props.level;
          props.stats.currentLevelRequiredScore = requiredScore;
          props.stats.currentLevelScore = score;
          props.setStats(props.stats);
          props.onLose();
        }
      }
    }, [secondsLeft, score]);
  
    const timerHueProgress = Math.min(secondsLeft, 45) / 45.0;
    const timerHue = timerHueProgress * 120;
    const timerSaturationProgress = 1 - Math.min(secondsLeft, 45) / 45.0;
    const timerSaturation = timerSaturationProgress * 70.0 + 30.0;
  
    let progress = Math.min((score / requiredScore) * 100, 100);
    
    let overlay : null | JSX.Element = null;
    if (levelisWon) {
      overlay = <div id="boardOverlay" className="winOverlay">
        <div>
          <h2>Level {props.level} Complete!</h2>
          <button onClick={() => {
            props.onWin();
          }}>Continue</button>
        </div>
      </div>;
    }
    if (isPaused) {
      overlay = <div id="boardOverlay">
       <PauseMenu onQuit={props.onLose} onResume={handleStart}></PauseMenu>
      </div>;
    }

    const rotateButton = <button onClick={() => {
      if (isRotating) return;
      setIsRotating(true);
      clearTimeout(timeoutRef.current);
      setDice(dice[0].map((_val, index) => dice.map(row => row[index]).reverse()));
      timeoutRef.current = setTimeout(() => {
        setIsRotating(false);
      }, 250);
      
    }}>Rotate</button>;

    const pauseButton = <button onClick={handlePause} disabled={isPaused || isInEvent}>⏸️</button>;
  
 
    let rerollButton : null | React.JSX.Element = null;
    if  (props.rerollCounter !== null) {
      rerollButton = <button disabled={props.rerollCounter <= 0 || isPaused || isInEvent} onClick={() => {
        useRerollCharge();
      }}>Reroll ({props.rerollCounter})</button>;
    }
    return (
      <div>
        <div className="buttons">
          {rerollButton}
          {rotateButton}
          {pauseButton}
        </div>

        <h1
          className="timer"
          style={{
            color: "hsl(" + timerHue + ", " + timerSaturation + "%, 50%)",
          }}
        >
          {minutes}:{seconds < 10 ? "0" + seconds : seconds}
        </h1>
        <div id="progressbar">
          <div style={{ width: progress + "%" }}></div>
          <center>
            <label>
              {score} / {requiredScore}
            </label>
          </center>
        </div>
        <DisplayWord
          lastWord={lastWord}
          currentWord={currentWord}
          currentLevel={props.level}
          variant={props.variant}
        />
        <div className="container">
          <Grid
            dice={dice}
            currentWord={currentWord}
            setCurrentWord={setCurrentWord}
            commitWord={commitWord}
            isRotating={isRotating}
            bonusText={bonusText}
            gameContext={{ currentLevel: props.level }}
            isDealing={isDealing}
          />
        </div>
        {overlay}
      </div>
    );
  }

  export default Board;