import {useEffect, useRef, useState } from 'react'
import './App.css'
import React from 'react';

import RewardsPhase, { DiceView } from './RewardsPhase';
import { BASIC_DICE, RARE_DICE, DiceBonus, STARTER_DICE, TDie, DEBUG_REWARD_SCREEN_DICE } from './Dice';
import Board from './Board';
import {GameStatsView, STARTING_STATS, TGameStats } from './GameStats';
import { Variant } from './Variants';
import MainMenu from './MainMenu';

const VERSION = 'v0.1.2.11';

function loadDictionary(dictionaryRaw: string): {dSet: Set<string>, dSort: string[]} {
  let dictionary = new Set<string>();
  const dictionarySorted : string[] = [];
  dictionaryRaw.split('\n').forEach((word) => {
    dictionary.add(word.trim());
    dictionarySorted.push(word.trim());
  });

  dictionarySorted.every((v: string, i: number, arr: string[]) => {
    if (!i) return true;
    if (arr[i-1] > v) {
      console.log('NOT SORTED!!', arr[i-1], v);
      return false;
    }

    return true;
  });
  
  return {dSet: dictionary, dSort: dictionarySorted};
}

function getNRandom<T>(arr: T[], n: number): T[] {
  var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
  if (n > len)
      throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

export interface RoundCookieValues {
    phase: 'mainmenu' | 'board'|'rewards' | 'view_dice' | 'stats',
    timeSinceStart: number,
    score: number,
    level: number,
    variant: Variant,
    usedWords: string[],
    board: (TDie | null)[][], // the cookie method does not like multidimensional arrays?
    stats: TGameStats,
    dice: TDie[],
    choices: TDie[],
    rerollCounter: number | null,
};

export interface PermCookieValues {
    maxLevelReached: { [key in Variant]?: number },
};

const ROUND_COOKIE_NAME = 'save';
const PERM_COOKIE_NAME = 'perm_save';

  export function getRoundDataFromSaveState(): RoundCookieValues | null {
    const data = localStorage.getItem(ROUND_COOKIE_NAME); 
    if (data) {
      try {
        const parsedData: RoundCookieValues = JSON.parse(data);
        if (parsedData.phase && parsedData.dice) {
          return parsedData;
        }
      } catch (e) {
        console.error('Error parsing save data:', e);
      }
    }
    return null;
  }

  export function getPermDataFromSaveState(): PermCookieValues | null {
    const data = localStorage.getItem(PERM_COOKIE_NAME); 
    if (data) {
      try {
        const parsedData: PermCookieValues = JSON.parse(data);
        if (parsedData.maxLevelReached) {
          return parsedData;
        }
      } catch (e) {
        console.error('Error parsing save data:', e);
      }
    }
    return null;
  }

function Game(props: {dictionary: Set<string>, dictionarySorted: string[]}) {
  const [dice, setDice] = useState<TDie[]>(STARTER_DICE);
  const [choices, setChoices] = useState<TDie[]>([]);
  const [level, setLevel] = useState<number>(1);
  const [internalCounter, setInternalCounter] = useState<number>(1);
  const [phase, setPhase] = useState<'mainmenu' | 'board'|'rewards' | 'view_dice' | 'stats'>('mainmenu');
  const [rerollCounter, setRerollCounter] = useState<number | null>(null);
  const [dieRecieved, setDieRecieved] = useState<boolean>(false);
  const [stats, setStats] = useState<TGameStats>(STARTING_STATS);
  const [variant, setVariant] = useState<Variant>(Variant.BASE);
  const [usedWords, setUsedWords] = useState(new Set<string>());

  const allowScroll = phase === 'view_dice' || phase === 'stats';
  const timeoutRef = useRef(0);

  function setSaveDataFromBoard(score: number, timeSinceStart: number, usedWords: Set<string>, board: (TDie | null)[][]): void {
    const data = {
      timeSinceStart,
      score,
      level,
      variant,
      usedWords: Array.from(usedWords),
      board: board,
      stats,
      dice,
      choices,
      phase,
      rerollCounter,
    };
    localStorage.setItem(ROUND_COOKIE_NAME, JSON.stringify(data));
  }

  function setSaveData() {
    const data = {
      timeLeft: null, //Math.max(0, TimeLimit - (now - startTime) + timeBonus),
      score: null,
      level,
      variant,
      usedWords: null,
      board: null,
      stats,
      dice,
      choices,
      phase,
      rerollCounter,
    };
    localStorage.setItem(ROUND_COOKIE_NAME, JSON.stringify(data));
    
    const permData = getPermDataFromSaveState();
    if (!permData) {
      const newPermData: PermCookieValues = {
        maxLevelReached: {
          [variant]: level,
        },
      }
      localStorage.setItem(PERM_COOKIE_NAME, JSON.stringify(newPermData));
    } else {
      if (permData.maxLevelReached[variant] == null || permData.maxLevelReached[variant] < level) {
        permData.maxLevelReached[variant] = level;
        localStorage.setItem(PERM_COOKIE_NAME, JSON.stringify(permData));
      }
    }
    
  }

  useEffect(() => {
    if (phase === 'stats' || phase === 'rewards' && choices.length > 0 && !dieRecieved) {
      const data = getRoundDataFromSaveState();
      if (data && data.level && data.level >= level && phase === 'rewards') {
        return;
      }
      setSaveData();
    }
  }, [phase, level, dice, choices, variant]);

  function loadFromSaveState(): boolean {
    const data = getRoundDataFromSaveState();
    if (data && data.phase && data.dice) {
      if ((data.phase === 'rewards' || data.phase === 'view_dice') && !data.choices) {
        return false;
      }
      setPhase(data.phase);
      setDice(data.dice);
      setLevel(data.level);
      setStats(data.stats);
      setChoices(data.choices);
      setRerollCounter(data.rerollCounter);
      setVariant(data.variant);
      return true;
    }
    return false;
  }

  useEffect(() => {
    if (!loadFromSaveState()) {
      onQuitRun();
    }
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (allowScroll) {
      document.body.classList.remove("noselect");
    } else {
      document.body.classList.add("noselect");
    }
    
  }, [allowScroll]);


  function onWin() {
    setLevel(level + 1);
    setInternalCounter(internalCounter + 1);
    setPhase('rewards');
    if ((level + 1) % 3 === 0) {
      setChoices(getNRandom(RARE_DICE, 2).concat(getNRandom(BASIC_DICE, 1)));
    } else {
      setChoices(getNRandom(BASIC_DICE, 3));
    }
  }
  function onLose() {
    setPhase('stats');
  }

  function onQuitRun() {
    setPhase('mainmenu');
    localStorage.removeItem(ROUND_COOKIE_NAME);
  }

  function onStartRun(variant: Variant) {
    setLevel(1);
    setDice(STARTER_DICE);
    setInternalCounter(internalCounter + 1);
    setPhase('rewards');
    if (DEBUG_REWARD_SCREEN_DICE) {
      setChoices([DEBUG_REWARD_SCREEN_DICE, ...getNRandom(BASIC_DICE, 2)]);
    } else {
      setChoices(getNRandom(BASIC_DICE, 3));
    }
    setRerollCounter(null);
    setStats(STARTING_STATS);
    setVariant(variant);
  }

  function onChooseReward(die: TDie) {
      setPhase('board');
      setDieRecieved(false);
      switch (die.bonus) {
        case DiceBonus.B_1_REROLL:
          setRerollCounter((rerollCounter || 0) + 1);
          break;
        case DiceBonus.B_2_REROLL:
          setRerollCounter((rerollCounter || 0) + 2);
          break;
      }
  }

  if (phase === 'mainmenu') {
    return <div className="game">
      <MainMenu variants={[Variant.BASE, Variant.WORDSMITH, Variant.BLACKOUT]} onStart={(variant: Variant) => {onStartRun(variant);}}/>
    </div>;
  }

  let content = <div/>;
  let viewButton : React.JSX.Element | null = null;
  if (phase === 'board') {
    content =
    <Board
      key={internalCounter}
      dictionary={props.dictionary}
      dictionarySorted={props.dictionarySorted}
      level={level} onLose={onLose}
      variant={variant}
      onWin={onWin}
      inputDice={dice.map((d, index) => {return {...d, id: index};})}
      rerollCounter={rerollCounter}
      setRerollCounter={setRerollCounter}
      stats={stats}
      setStats={setStats}
      setSaveData={setSaveDataFromBoard}
      usedWords={usedWords}
      setUsedWords={setUsedWords}
    />;
  } else if (phase === 'rewards') {
    content = <RewardsPhase choices={choices} onChoice={(die) => {
      timeoutRef.current = setTimeout(() => {
        setDice([...dice, die]);
        setDieRecieved(true);
          timeoutRef.current = setTimeout(() => {
            onChooseReward(die);
          }, 340);
      }, 1370);
    }}/>;
    viewButton = <button id='viewDice' className={dieRecieved ? 'gainDie' : ''} onClick={() => {setPhase('view_dice')}}>Dice ({dice.length})</button>
  } else if (phase === 'view_dice') {
    content = <DiceView dice={dice} stats={stats}/>;
    viewButton = <button id='viewDice' onClick={() => {setPhase('rewards')}}>Back</button>
  } else if (phase === 'stats') {
    content = <GameStatsView stats={stats} dice={dice} onRestart={onQuitRun}/>;
  }
  let variantText = '';
  if (variant !== Variant.BASE) {
    variantText = ` - ${variant}`;
  }
  return <div className={allowScroll ? "game" : "game noselect"}>
      <div id='topBar'><p>Level {level}{variantText}</p><sup>{VERSION}</sup></div>
      {viewButton}
      {content}
    </div>;
}

function App() {
  let [dictionary, setDictionary] = useState(new Set<string>());
  let [dictionarySorted, setDictionarySorted] = useState<string[]>([]);
  useEffect(() => {
    import('./assets/dictionary1.txt?raw').then((dictionaryModule:any) => {
      const dict = loadDictionary(dictionaryModule.default);
      setDictionary(dict.dSet);
      setDictionarySorted(dict.dSort);
    });
  }, []);
  if(dictionary.size === 0) {
    return <div id='loading'>
      <h2>Loading Dictionary...</h2>
      </div>;
  }
  return <div className="app">
    <Game dictionary={dictionary} dictionarySorted={dictionarySorted}/>
  </div>;
}

export default App


/**
 * Dice Ideas:
 * alphabet die: on use, move to next letter in the alphabet
 * upgrade die
 * x muktiplier die: it's an x and the multipler gains 1 each time it's used
 * ! factorial die: if you end a word a with the ! you get factorial points but the letters explode!!
 * 
 * 
 * Relic ideas:
 * animal die: 20 points if you spell an animal
 * tines of power: forks your score if you spell tine
 * 
 * todo
 * animate dice choice
 * 
 * 
 */