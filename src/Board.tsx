import { useEffect, useRef, useState } from "react";
import { DiceBonus, nextAlphabetLetter, TDie } from "./Dice";
import Grid from "./Grid";
import React from 'react';

const TIME_LIMIT = 120;
const EASY_WIN = false;

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



function Board(props: {
    dictionary: Set<string>,
    level: number,
    inputDice: TDie[],
    onWin: () => void,
    onLose: () => void,
    rerollCounter: number | null,
    setRerollCounter: (n: number|null) => void
  }) {
    let requiredScore = 5 + 6 * props.level;
    if (EASY_WIN) {
      requiredScore = 2;
    }
  
    function reroll() {
      const columns = props.inputDice.length < 20 ? 4 : 5;
      setDice(chunkArray(rollBoard(props.inputDice), columns));
    }
    useEffect(() => {
      reroll();
    }, []);
    const [dice, setDice] = useState<TDie[][]>([]);
    const [currentWord, setCurrentWord] = useState<TDie[]>([]);
    const [lastWord, setLastWord] = useState('');
    const [score, setScore] = useState<number>(0);
  
    const [usedWords, setUsedWords] = useState(new Set<string>());
  
    //timer
    const [startTime, setStartTime] = useState(0);
    const [now, setNow] = useState(0);
    const intervalRef = useRef(0);

    function wordIsInDictionary(word: string, ref = {isUsed: false}): string | null {
        if (props.dictionary.has(word)) {
            return word;
        }
        const index = word.search(/\/|\*/);         
        let usedWord : string | null = null;
        if (index > -1) { 
            let alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
            let regex = /\*/;
            if (word[index] === '/') {
                alphabet = [word[index - 1], word[index + 1]];
                regex = /[a-z]\/[a-z]/;
            }
            for (let i = 0; i < alphabet.length; i++) {
                const ref2  = {isUsed: false};
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
  
  
    function commitWord() {
      let suffix = '';
      let word = currentWord.map(d => d.letter).join('');
      let finalWord : string | null = null;
      if (word.length === 0) {
        return;
      }
      if (word.length < 3) {
        suffix = String.fromCodePoint(0x1f6ab) + ' (too short)';
      } else if (finalWord = wordIsInDictionary(word)) {
        word = finalWord;
        if (usedWords.has(word)) {
          suffix = String.fromCodePoint(0x1f6ab) + ' (already played)';
        } else {
            setUsedWords(new Set(usedWords.add(word)));
            let scoreChange = scoreWord(word, currentWord);
            suffix = ' +' + scoreChange;
            setScore(score + scoreChange);
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
                }
            }

        }
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
  
    if (score >= requiredScore) {
      clearInterval(intervalRef.current);
      return <div className="game">
        <h1>Level {props.level} Complete!</h1>
        <button onClick={() => {
          props.onWin();
        }}>Continue</button>
      </div>;
    }
  
  
    function fib(n: number): number {
      if (n === 0) return 0;
      if (n === 1) return 1;
      return fib(n - 1) + fib(n - 2);
    }
  
    function scoreWord(word: string, dice: TDie[]) {
        let multiplier = 1;
        let bonus = 0;
        let penalty = 0;
        if (dice[0].bonus === DiceBonus.B_PLUS2) {
            bonus += 2;
        }
        for (let i = 0; i < dice.length; i++) {
            switch (dice[i].bonus) {
                case DiceBonus.B_2X:
                    multiplier *= 2;
                    break;
                case DiceBonus.B_3X:
                    multiplier *= 3;
                    break;
                case DiceBonus.B_ALPHABET:
                    multiplier *= 2;
                    break;
                case DiceBonus.B_MULTIPLIER_COUNTER:
                    multiplier *= (dice[i].counter || 1);
                    break;
                case DiceBonus.B_MINUS1:
                    penalty += 1;
                    break;
            }
        }
        const baseScore = word.length > 2 ? fib(word.length - 2) : 0;
        return (baseScore + bonus) * multiplier - penalty;
    }
  
    let displayWord = currentWord.length > 0 ?
      <p>{currentWord.map(d => d.letter).join('').toUpperCase()}</p> :
      <p className="fadeOut">{lastWord}</p>;
    
    let secondsPassed = Math.round((now - startTime) / 1000);
    let secondsLeft = TIME_LIMIT - secondsPassed;
    if (secondsLeft < 0) {
      clearInterval(intervalRef.current);
      return <div className="game">
        <h1>Game Over!</h1>
        <h2>Level {props.level} - Score {score}/{requiredScore}</h2>
        <button onClick={() => {
          props.onLose();
        }}>Restart</button>
      </div>;
    }
    let minutes = Math.floor(secondsLeft / 60);
    let seconds = secondsLeft % 60;
  
    let progress = (score / requiredScore) * 100;
  
    let rerollButton : null | React.JSX.Element = null;
    if  (props.rerollCounter !== null) {
      rerollButton = <button disabled={props.rerollCounter <= 0} onClick={() => {
        props.setRerollCounter((props.rerollCounter || 1) - 1);
        reroll();
      }}>Reroll ({props.rerollCounter})</button>;
    }
    return <div>
      <h1 className="timer">{minutes}:{seconds < 10 ? '0' + seconds : seconds}</h1>
      <div id="progressbar">
        <div style={{width: progress + '%'}}></div>
        <center><label>{score} / {requiredScore}</label></center>
      </div>
      <div className="currentWord">
        {displayWord}
      </div>
      <div className='container'>
        <Grid dice={dice} currentWord={currentWord} setCurrentWord={setCurrentWord} commitWord={commitWord} />
      </div>
      {rerollButton}
    </div>;
  }

  export default Board;