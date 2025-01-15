import { FormEvent, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import React from 'react';

function Key(props: {letter: string, count: number, onClick: () => void}) {
  let cname = 'noCount';
  if (props.count === 0) {
      cname = 'noCount';
  } else if (props.count === 1) {
      cname = 'oneCount';
  } else if (props.count === 2) {
      cname = 'twoCount';
  } else if (props.count === 3) {
      cname = 'threeCount';
  } else {
      cname = 'manyCount';
  }
  return (
    <div className={'key ' + cname} onClick={props.onClick}>
        <p className={'keyLetter'}>{props.letter}</p>
        <p className="keyCount">{'(' + props.count + ')'}</p>
    </div>
  );
}

function KeyRow(props: {keys: {letter: string, count: number}[], name: string, onClick: (c: string) => void}) {
    return (
        <div className={'keyRow ' + props.name}>
            {props.keys.map(
                key =>
                    <Key
                        letter={key.letter}
                        count={key.count}
                        key={key.letter}
						onClick={() => props.onClick(key.letter)}
                    />
            )}
        </div>
    );
}

function Keyboard(props: {counts: { [key:string]:number; }, onClick: (c: string) => void}) {
    const topRow = 'qwertyuiop';
    const midRow = 'asdfghjkl';
    const bottomRow = 'zxcvbnm';
    function toKeys(str: string) {
        return [...str].map(c => {
            return {letter: c, count: props.counts[c] || 0};
        });
    }
    return (
        <div className="keyboard">
           <KeyRow keys={toKeys(topRow)} name="top" onClick={props.onClick} />
           <KeyRow keys={toKeys(midRow)} name="mid" onClick={props.onClick} />
           <KeyRow keys={toKeys(bottomRow)} name="bottom" onClick={props.onClick} />
        </div>
    );
}

function Game(props: {bank: { [key:string]:number; }, answer: string}) {
  const [text, setTextPrivate] = useState('');
  const getCounts = () => {
    const bank = props.bank;
    let newCounts : { [key:string]:number; } = {};
    let textCounts = counter([...text]);
    for (let [key, value] of Object.entries(bank)) {
        newCounts[key] = value - (textCounts[key] || 0);
    }
    return newCounts;
  }
  

	  
	const setText = (newVal: string) => {
		const newCounts = counter([...newVal])
		// invalidate if it contains illegal letters
		for (let [key, value] of Object.entries(newCounts)) {
			if((props.bank[key] || 0) - value < 0) {
				if (key === ' ') {
					continue;
				}
				return;
			}
		}
		// invalidate if it contains consecutive spaces
		for (let i = 0; i < newVal.length - 1; i++) {
			if (newVal[i] === ' ' && newVal[i+1] === ' ') {
				return;
			}
		}
		setTextPrivate(newVal);
	}
	
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.value;
    setText(newVal);
  }
	
	const handleKeyClick = (c: string) => {
		const newVal = text + c;
		setText(newVal);
	}
  
	const showCounts = (counts: { [key:string]:number; }) => {
      let str = [];
      for (let [c, count] of Object.entries(counts)) {
        for (var i = 0; i < count; i++) {
            str.push(c)
        }
      }
      str.sort();
      return str.join(' ');
	}
    const counts = getCounts();
    return <div className="game">
        <h2>Your thing is: {props.answer}</h2>
        <Keyboard counts={counts} onClick={handleKeyClick}/>
        <h2>Your letters: {showCounts(counts)}</h2>
        <input
            type="text"
            className="submissionBox"
            value={text}
            onChange={handleChange}
        />
    </div>;
}

function App() {

  const [answer, setAnswer] = useState('');
  const [bank, setBank] = useState<{ [key:string]:number; } | null>(null);
  const [invalidMessage, setInvalidMessage] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(event.target.value);
    setInvalidMessage(null);
  }
	const handleSubmit = (event: FormEvent<HTMLFormElement>) =>  {
		if (!answer) {
			setInvalidMessage('Enter a thing!!!');
			event.preventDefault();
			return;
		}
		let newAnswer = '';
		var allowed = /[a-zA-Z ]/
		for (const c of answer) {
			if (c.match(allowed))
				newAnswer += c.toLowerCase();
			else {
				setInvalidMessage('Illegal character: ' + c);
				event.preventDefault();
				return;
			}
		}
    setAnswer(newAnswer);
    setBank(getBank(newAnswer));
		event.preventDefault();
	}
    if (bank != null) {
        return <div className="app">
            <button
                onClick={_e => {setAnswer(''); setBank(null);}}>
                {'<-'}
            </button>
            <Game bank={bank} answer={answer}/>
        </div>;
    }
    
    return <div className="app">
     <form onSubmit={handleSubmit}>
        <label>
          Enter thing to guess:
          <input type="text" value={answer} onChange={handleChange} />
        </label>
        <input type="submit" value="Go" />
      </form>
      {invalidMessage ? <h3 className='invalidMessage'>{invalidMessage}</h3> : null}
    </div>;

}

function counter(array: string[]) : { [key:string]:number; } {
  var count : {[key:string]:number} = {};
  array.forEach(val => count[val] = (count[val] || 0) + 1);
  return count;
}

function getBank(word: string) : { [key:string]:number; } {
    const regex = / /gi;
    word = word.replace(regex, '');
    let bank : { [key:string]:number; } = {};
    let freqTable : { [key:string]:number; } = {'a': 8.2, 'b': 1.5, 'c': 2.8, 'd': 4.3, 'e': 12, 'f': 2.2, 'g': 2 , 'h': 6, 'i': 7, 'j': 0.2, 'k': 0.8, 'l': 4, 'm': 2.4, 'n': 6.7, 'o': 7.5, 'p': 2, 'q': 0.1, 'r': 6, 's': 6.4, 't': 9, 'u': 2.8, 'v': 1, 'w': 2.3, 'x': 0.2, 'y': 2, 'z':  0.1}
    
    // reduce frequency of letters in word
    for (const c of word) {
        freqTable[c] *= 0.6;
    }
    
    const numLetters = word.length * 2.4;
    
    for (var i = 0; i < numLetters; i++) {
        const c = weightedRand(freqTable);
        bank[c] = (bank[c] || 0) + 1;
    }
    
    return bank;
}

function weightedRand(spec : { [key:string]:number; }): string {
  let sum=0;
  for (i in spec) {
    sum += spec[i];
  }
  var i, r=Math.random()*sum;
  sum=0;
  for (i in spec) {
    sum += spec[i];
    if (r <= sum)
      return i;
  }
  return '';
}

export default App
