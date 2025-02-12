export enum DiceBonus {
    B_15X = '1.5x',
    B_2X = '2x',
    B_PLUS4 = '+4 starter',
    B_2_REROLL = '+2 rerolls',
    B_1_REROLL = '+1 reroll',
    B_ALPHABET = 'alphabet',
    B_MULTIPLIER_COUNTER = 'multiplier counter',
    B_MINUS3 = '-3',
  }
export type TDie = { letter: string, faces: string[], bonus: DiceBonus | null, counter?: number };

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
];
export const STARTER_DICE: TDie[] = STARTER_DICE_FACES.map(faces => ({ letter: faces[0], faces: [...faces], bonus: null}));

export const ADDITIONAL_DICE: TDie[] = [
    {faces: ['ing', 'th', 'er', 'in', 'ed', 'tion'], bonus: null},
    {faces: ['x', 'z', 'k', 'qu', 'j', 'y'], bonus: DiceBonus.B_2X},
    {faces: ['h', 'h', 'r', 'l', 'd', 'o'], bonus: DiceBonus.B_PLUS4},
    {faces: ['s', 's', 's', 'e', 'n', 'a'], bonus: null},
    {faces: ['b', 'y', 'p', 'f', 'r', 'qu'], bonus: DiceBonus.B_15X},
    {faces: ['w', 'n', 'c', 'b', 't', 's'], bonus: DiceBonus.B_PLUS4},
    {faces: ['a', 'a', 'a', 'a', 'a', 'a'], bonus: DiceBonus.B_ALPHABET},
    {faces: ['c', 'p', 'i', 'e', 's', 't'], bonus: DiceBonus.B_2_REROLL},
    {faces: ['x', 'x', 'x', 'x', 'x', 'x'], bonus: DiceBonus.B_MULTIPLIER_COUNTER, counter: 1},
    {faces: ['i', 'i', 'f', 'y', 'g', 'l'], bonus: DiceBonus.B_1_REROLL},
    {faces: ['*', '*', '*', '*', '*', '*'], bonus: DiceBonus.B_MINUS3},
    {faces: ['a/b', 'e/f', 'h/i', 'o/k', 'u/y', 'a/y'], bonus: DiceBonus.B_1_REROLL},
].map(d => ({letter: d.faces[0], ...d}));

export function getSquareBonusDisplay(die: TDie): string {
    switch(die.bonus) {
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
            return '1.5x  ' + die.letter + ' → ' + nextAlphabetLetter(die.letter);
        case DiceBonus.B_MULTIPLIER_COUNTER:
            return '(x' + die.counter + ')';
        case DiceBonus.B_MINUS3:
            return '-3';
        default:
            return '';
    }
}

export function getDiceBonusText(bonus: DiceBonus): {title: string, description: string} {
    switch(bonus) {
        case DiceBonus.B_2X:
            return {title: '2x', description: '2x word score'};
        case DiceBonus.B_15X:    
            return {title: '1.5x', description: '1.5x word score'};
        case DiceBonus.B_PLUS4:
            return {title: '+4 starter', description: '+4 points for words starting with this die'};
        case DiceBonus.B_1_REROLL:
            return {title: '+1 reroll', description: '+1 board reroll charge'};
        case DiceBonus.B_2_REROLL:
            return {title: '+2 rerolls', description: '+2 board reroll charges'};
        case DiceBonus.B_ALPHABET:
            return {title: '2x and a → b', description: '2x word score and changes to the next letter in the alphabet.'};
        case DiceBonus.B_MULTIPLIER_COUNTER:
            return {title: 'multiplier', description: 'word score multiplier increases by 1 with each word'};
        case DiceBonus.B_MINUS3:
            return {title: '-3', description: '-3 points for word'};
        default:
            throw new Error('unknown bonus type');
    }
}

export function nextAlphabetLetter(letter: string): string {
    let c= letter.charCodeAt(0);
        switch(c){
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