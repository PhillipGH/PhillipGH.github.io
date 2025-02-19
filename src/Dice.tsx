import React from "react";

export enum DiceBonus {
    B_15X = '1.5x',
    B_2X = '2x',
    B_PLUS4 = '+4 starter',
    B_2_REROLL = '+2 rerolls',
    B_1_REROLL = '+1 reroll',
    B_ALPHABET = 'alphabet',
    B_MULTIPLIER_COUNTER = 'multiplier counter',
    B_MINUS3 = '-3',
    B_REROLL_WORD = 'reroll word',
    B_ROTATE = 'rotate',
}

export enum DieDescription {
    MINUS_ONE_LETTER,
    ASTERIX,
    REROLL_CHARGE,
    HEARTS,
}
export type TDie = { letter: string, faces: string[], bonus: DiceBonus | null, counter?: number, desc?: DieDescription,  id?: number};

export const REROLL_TIME_BONUS = 30;

export const DEL = '🔙'; // also update the regex in Board.tsx!

const STARTER_DICE_FACES = [
    //'ennnda',
    'titiei',
    'ipcelt',
    'eeeema',
    'eeeeaa',
    //'afiysr', // +2 rerolls
    'nemnga',
    'rihprv',
    'tttome',
    //'nesuss', // a instead of u
    'wrovgr',
    //'cpiest',
    //'iypfrs', // x2
    'teliic',
    'ugeema',
    //'rasaaf',
    'nhdtoh',
    'ouotnw',
    'rddonl',
    //'wnccts',
    //'xzkqjb', 3x
    //'hhrldo', // +2
    'touoot',
    //'isfraa',
    'nrlhdo',

    'nrlhdo',
];
export const STARTER_DICE: TDie[] = STARTER_DICE_FACES.map(faces => ({ letter: faces[0], faces: [...faces], bonus: null }));

export const ADDITIONAL_DICE: TDie[] = [
    { faces: ['ing', 'th', 'er', 'in', 'ed', 'tion'], bonus: null },
    { faces: ['s', 's', 's', 'e', 'n', 'a'], bonus: null },

    { faces: ['ch', 'ch', 'th', 'sh', 'ck', 'ck'], bonus: DiceBonus.B_1_REROLL },
    { faces: ['a/b', 'e/f', 'h/i', 'o/k', 'u/y', 'a/y'], bonus: DiceBonus.B_1_REROLL },
    { faces: ['i', 'i', 'f', 'y', 'g', 'l'], bonus: DiceBonus.B_2_REROLL },
    { faces: ['p', 's', 't', 'c', 'e', 'm'], bonus: DiceBonus.B_2_REROLL },

    { faces: ['h', 'm', 'r', 'l', 'd', 'o'], bonus: DiceBonus.B_PLUS4 },
    { faces: ['w', 'n', 'c', 'b', 't', 's'], bonus: DiceBonus.B_PLUS4 },
    { faces: ['d', 'r', 'm', 'g', 'p', 's'], bonus: DiceBonus.B_PLUS4 },

    { faces: ['b', 'y', 'p', 'f', 'r', 'qu'], bonus: DiceBonus.B_15X },
    { faces: ['x', 'z', 'k', 'qu', 'j', 'y'], bonus: DiceBonus.B_2X },
    { faces: ['m', 'a', 'd', 'd', 'y', 'f'], bonus: DiceBonus.B_2X, desc: DieDescription.HEARTS},

    { faces: ['a', 'a', 'a', 'a', 'a', 'a'], bonus: DiceBonus.B_ALPHABET },
    { faces: ['x', 'x', 'x', 'x', 'x', 'x'], bonus: DiceBonus.B_MULTIPLIER_COUNTER, counter: 1 },
    { faces: ['*', '*', '*', '*', '*', '*'], bonus: DiceBonus.B_MINUS3, desc: DieDescription.ASTERIX },
    { faces: [DEL, DEL, DEL, DEL, DEL, DEL], bonus: null, desc: DieDescription.MINUS_ONE_LETTER },

    { faces: ['a/e', 'e/i', 'i/o', 'o/u', 'u/y', 'e/o'], bonus: DiceBonus.B_REROLL_WORD },
    { faces: ['r', 'o', 't', 'a', 't', 'e'], bonus: DiceBonus.B_ROTATE },
].map(d => ({ letter: d.faces[0], ...d }));

// for testing
// STARTER_DICE.push(...ADDITIONAL_DICE);

export function getSquareBonusDisplay(die: TDie): string {
    switch (die.bonus) {
        case DiceBonus.B_2X:
            return '2x';
        case DiceBonus.B_15X:
            return '1.5x';
        case DiceBonus.B_PLUS4:
            return '+5 starter';
        case DiceBonus.B_1_REROLL:
        case DiceBonus.B_2_REROLL:
            return '';
        case DiceBonus.B_ALPHABET:
            return '1.5x  ' + die.letter + '→' + nextAlphabetLetter(die.letter);
        case DiceBonus.B_MULTIPLIER_COUNTER:
            return '(x' + die.counter + ')';
        case DiceBonus.B_MINUS3:
            return '-3';
        case DiceBonus.B_REROLL_WORD:
            return '-3 reroll';
        case DiceBonus.B_ROTATE:
            return '🔃';
        default:
            return '';
    }
}

export function getDiceBonusText(bonus: DiceBonus): { title: string, description?: string, hasSideEffect?: boolean, desc?: DieDescription } {
    switch (bonus) {
        case DiceBonus.B_2X:
            return { title: '2x', description: '2x word score' };
        case DiceBonus.B_15X:
            return { title: '1.5x', description: '1.5x word score' };
        case DiceBonus.B_PLUS4:
            return { title: '+4 starter', description: '+4 points for words starting with this die' };
        case DiceBonus.B_1_REROLL:
            return { title: '+1 reroll charge', desc: DieDescription.REROLL_CHARGE };
        case DiceBonus.B_2_REROLL:
            return { title: '+2 reroll charges', desc: DieDescription.REROLL_CHARGE };
        case DiceBonus.B_ALPHABET:
            return { title: '1.5x and a → b', description: '1.5x word score and changes to the next letter in the alphabet.', hasSideEffect: true };
        case DiceBonus.B_MULTIPLIER_COUNTER:
            return { title: 'multiplier', description: 'word score multiplier increases by 1 with each word', hasSideEffect: true };
        case DiceBonus.B_MINUS3:
            return { title: '-3', description: '-3 points for word' };
        case DiceBonus.B_REROLL_WORD:
            return { title: 'reroll word', description: 'when used, -3 points and all dice in word rerolled', hasSideEffect: true };
        case DiceBonus.B_ROTATE:
            return { title: '🔃 rotate dice', description: 'when used, rotates all the dice surrounding this one clockwise one position', hasSideEffect: true };
        default:
            throw new Error('unknown bonus type');
    }
}

export function getDieDesc(die: TDie): JSX.Element | null {
    let desc: DieDescription | undefined | null = null;
    if (die.bonus) {
        desc = getDiceBonusText(die.bonus).desc;
    }
    desc = die.desc != null ? die.desc : desc;
    switch (desc) {
        case DieDescription.ASTERIX:
            return <p>A <b>*</b> is a wildcard that can be used as any one letter</p>;
        case DieDescription.MINUS_ONE_LETTER:
            return <p>A <b>{DEL}</b> removes one letter from any part of your word</p>;
        case DieDescription.REROLL_CHARGE:
            return <p><b>Reroll Charges</b> can be used at any time to reroll the board and give {REROLL_TIME_BONUS} more seconds</p>;
        case DieDescription.HEARTS:
            return <p>❤️</p>
        default:
            return null;
    }
}

export function nextAlphabetLetter(letter: string): string {
    let c = letter.charCodeAt(0);
    switch (c) {
        case 90: return 'A';
        case 122: return 'a';
        default: return String.fromCharCode(++c);
    }
}

/*
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
  */