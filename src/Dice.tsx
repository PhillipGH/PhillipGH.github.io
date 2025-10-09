// import React from "react";

export enum DiceBonus {
    B_15X = '1.5x',
    B_2X = '2x',
    B_PLUS1 = '+1 starter',
    B_2_REROLL = '+2 rerolls',
    B_1_REROLL = '+1 reroll',
    B_ALPHABET = 'alphabet',
    B_MULTIPLIER_COUNTER = 'multiplier counter',
    B_MINUS1 = '-1',
    B_REROLL_WORD = 'reroll word',
    B_ROTATE = 'rotate',
    B_SWAP = 'swap',
    B_4X = '',
    B_XREROLL = '+1 reroll on x or z',
    B_CORNER_SWAP = 'corner',
    B_PLUS_LEVEL = '+<level>',
    B_HINT = 'hint',
}

export enum DieDescription {
    MINUS_ONE_LETTER,
    ASTERIX,
    REROLL_CHARGE,
    HEARTS,
}
export type TDie = {
    letter: string,
    faces: string[],
    bonus: DiceBonus | null,
    counter?: number,
    savedStr?: string,
    desc?: DieDescription,
    id?: number,
    usedThisLevel?: boolean,
};
export type TGameContext = { currentLevel: number };

export const REROLL_TIME_BONUS = 30;

export const DEL = '🔙'; // also update the regex in Board.tsx!
export const EXCLAIM  = '!'; // also update the regex in Board.tsx!

// TODO:
// good consonants that turns into e if no vowels next to it
// Q with global 1.5x on words 6 or longer
// Z with global word wrap effect???

// Choose a variant? mode? modifer? Each has unlock and trophy
// - level 5 you must use 50% of squares on board level 6 60%
// - a quarter of the time to get a quarter of the score
// - level 5 get a word 7 or longer level 9 get a word 8 or longer


const STARTER_DICE_FACES = [
    //'ennnda',
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
    'eiitt',
    //'wnccts',
    //'xzkqjb', 3x
    //'hhrldo', // +2
    // 'touoot', // basic die
    //'isfraa',
    'nrlhdo',
];
export const STARTER_DICE: TDie[] = STARTER_DICE_FACES.map(faces => ({ letter: faces[0], faces: [...faces], bonus: null }));

export const BASIC_DICE: TDie[] = [
    { faces: ['ing', 'th', 'er', 'in', 'ed', 'tion'], bonus: null },
    { faces: ['s', 's', 's', 'e', 'n', 'a'], bonus: null },
    { faces: ['t', 'o', 'o', 'o', 't', 's'], bonus: null },
    { faces: ['a', 'a', 'a', 'a', 'a', 'a'], bonus: null },
    { faces: ['ch', 'ch', 'th', 'sh', 'ck', 'ck'], bonus: DiceBonus.B_1_REROLL },
    { faces: ['a/b', 'e/f', 'h/i', 'o/k', 'u/y', 'a/y'], bonus: DiceBonus.B_1_REROLL },
    { faces: ['i', 'i', 'f', 'y', 'g', 'l'], bonus: DiceBonus.B_1_REROLL },
    { faces: ['p', 's', 't', 'c', 'e', 'm'], bonus: DiceBonus.B_1_REROLL },
    { faces: ['h', 'm', 'r', 'l', 'd', 'o'], bonus: DiceBonus.B_PLUS1 },
    { faces: ['w', 'n', 'c', 'b', 't', 's'], bonus: DiceBonus.B_PLUS1 },
    { faces: ['d', 'r', 'm', 'g', 'p', 's'], bonus: DiceBonus.B_PLUS1 },
    { faces: ['b', 'y', 'p', 'f', 'r', 'qu'], bonus: DiceBonus.B_15X },
    { faces: ['x', 'z', 'k', 'qu', 'j', 'y'], bonus: DiceBonus.B_2X },
    { faces: ['a', 'a', 'i', 'b', 'x', 'z'], bonus: DiceBonus.B_XREROLL }, //{ faces: ['x', 'z', 'x', 'z', 'x', 'z'], bonus: DiceBonus.B_XREROLL },
    { faces: ['c', 'o', 'r', 'n', 'e', 'r'], bonus: DiceBonus.B_CORNER_SWAP },
    { faces: ['a','b','c', 'd', 'e', 'f'], bonus: DiceBonus.B_PLUS_LEVEL },

].map(d => ({ letter: d.faces[0], ...d }));

export const RARE_DICE: TDie[] = [
    { faces: ['m', 'a', 'd', 'd', 'y', 'f'], bonus: DiceBonus.B_2X, desc: DieDescription.HEARTS},
    { faces: ['a', 'a', 'a', 'a', 'a', 'a'], bonus: DiceBonus.B_ALPHABET },
    { faces: ['x', 'x', 'x', 'x', 'x', 'x'], bonus: DiceBonus.B_MULTIPLIER_COUNTER, counter: 1 },
    { faces: ['*', '*', '*', '*', '*', '*'], bonus: DiceBonus.B_MINUS1, desc: DieDescription.ASTERIX },
    { faces: [DEL, DEL, DEL, DEL, DEL, DEL], bonus: null, desc: DieDescription.MINUS_ONE_LETTER },
    { faces: ['a/e', 'e/i', 'i/o', 'o/u', 'u/y', 'e/o'], bonus: DiceBonus.B_REROLL_WORD },
    { faces: ['r', 'o', 't', 'a', 't', 'e'], bonus: DiceBonus.B_ROTATE },
    { faces: ['d', 'w/a', 'p', 'p', 'e', 's'], bonus: DiceBonus.B_SWAP },
    { faces: ['s', 'p', 'c', 'd', 'm', 'a'], bonus: DiceBonus.B_HINT},
].map(d => ({ letter: d.faces[0], ...d }));

// for testing
// STARTER_DICE.push(...ADDITIONAL_DICE);
// STARTER_DICE.push(BASIC_DICE[11]);
// STARTER_DICE.push(RARE_DICE[8]);

export function getSquareBonusDisplay(die: TDie, context: TGameContext): string {
    switch (die.bonus) {
        case DiceBonus.B_2X:
            return '2x';
        case DiceBonus.B_15X:
            return '1.5x';
        case DiceBonus.B_PLUS1:
            return '+1 starter';
        case DiceBonus.B_1_REROLL:
        case DiceBonus.B_2_REROLL:
        case DiceBonus.B_XREROLL:
            return '';
        case DiceBonus.B_ALPHABET:
            return '1.5x  ' + die.letter + '→' + nextAlphabetLetter(die.letter);
        case DiceBonus.B_MULTIPLIER_COUNTER:
            return '(x' + die.counter + ')';
        case DiceBonus.B_MINUS1:
            return '-1';
        case DiceBonus.B_REROLL_WORD:
            return '-2 reroll';
        case DiceBonus.B_ROTATE:
            return '🔃';
        case DiceBonus.B_SWAP:
            return 'swap';
        case DiceBonus.B_PLUS_LEVEL:
            return '+'+ context.currentLevel + ' if > ' + context.currentLevel;
        case DiceBonus.B_HINT:
            return 'hint: ' + (die.savedStr || 'n/a');
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
        case DiceBonus.B_PLUS1:
            return { title: '+1 starter', description: '+1 point for words starting with this die' };
        case DiceBonus.B_1_REROLL:
            return { title: '+1 reroll charge', desc: DieDescription.REROLL_CHARGE };
        case DiceBonus.B_2_REROLL:
            return { title: '+2 reroll charges', desc: DieDescription.REROLL_CHARGE };
        case DiceBonus.B_XREROLL:
            return { title: 'On board reroll once per level, +1 reroll charge if this lands on x or z', desc: DieDescription.REROLL_CHARGE };
        case DiceBonus.B_ALPHABET:
            return { title: '1.5x and a → b', description: '1.5x word score and changes to the next letter in the alphabet.', hasSideEffect: true };
        case DiceBonus.B_MULTIPLIER_COUNTER:
            return { title: 'multiplier', description: 'word score multiplier increases by 1 with each word', hasSideEffect: true };
        case DiceBonus.B_MINUS1:
            return { title: '-1', description: '-1 points for word' };
        case DiceBonus.B_REROLL_WORD:
            return { title: 'reroll word', description: 'when used, -2 points and all dice in word rerolled', hasSideEffect: true };
        case DiceBonus.B_ROTATE:
            return { title: '🔃 rotate dice', description: 'when used, rotates all the dice surrounding this one clockwise one position', hasSideEffect: true };
        case DiceBonus.B_SWAP:
            return { title: 'swap dice', description: 'When used in a word, swaps the position of the first and last letter of the word and +5 seconds of time', hasSideEffect: true };
        case DiceBonus.B_CORNER_SWAP:
            return { title: 'corner swap', description: 'On reroll, wants to be in the corner of the board'};
        case DiceBonus.B_PLUS_LEVEL:
            return { title: '+<level>', description: '+<level> points if word is longer than <level> letters'};
        case DiceBonus.B_HINT:
            return { title: 'hint', description: 'says the first 4 letters of a word of length > 4 starting with this die'};
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