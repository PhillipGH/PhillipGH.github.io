export enum DiceBonus {
    B_2X = '2x',
    B_3X = '3x',
    B_PLUS2 = '+2 starter',
    B_1_REROLL = '+1 reroll',
    B_ALPHABET = 'alphabet',
  }
export type TDie = { letter: string, faces: string[], bonus: DiceBonus | null, counter?: number };

export function getSquareBonusDisplay(die: TDie): string {
    switch(die.bonus) {
        case DiceBonus.B_2X:
            return '2x';
        case DiceBonus.B_3X:    
            return '3x';
        case DiceBonus.B_PLUS2:
            return '+2 starter';
        case DiceBonus.B_1_REROLL:
            return '';
        case DiceBonus.B_ALPHABET:
            return '2x  ' + die.letter + ' → ' + nextAlphabetLetter(die.letter);
        default:
            return '';
    }
}

export function getDiceBonusText(bonus: DiceBonus): {title: string, description: string} {
    switch(bonus) {
        case DiceBonus.B_2X:
            return {title: '2x', description: '2x word score'};
        case DiceBonus.B_3X:    
            return {title: '3x', description: '3x word score'};
        case DiceBonus.B_PLUS2:
            return {title: '+2 starter', description: '+2 points for words starting with this die'};
        case DiceBonus.B_1_REROLL:
            return {title: '+1 reroll', description: '+1 board reroll charge'};
        case DiceBonus.B_ALPHABET:
            return {title: 'a → b', description: '2x word score and changes to the next letter in the alphabet.'};
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

const STARTER_DICE_FACES = [
    //'ennnda',
    'titiei',
    'ipcelt',
    'eeeema',
    'eeeeaa',
    //'afiysr',
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
    'nrlhdo'
];
export const STARTER_DICE: TDie[] = STARTER_DICE_FACES.map(faces => ({ letter: faces[0], faces: [...faces], bonus: null}));

export const ADDITIONAL_DICE: TDie[] = [
    {faces: ['ing', 'qu', 'er', 'ir', 'ed', 'ion'], bonus: null},
    {faces: ['x', 'z', 'k', 'q', 'j', 'b'], bonus: DiceBonus.B_3X},
    {faces: ['h', 'h', 'r', 'l', 'd', 'o'], bonus: DiceBonus.B_PLUS2},
    {faces: ['s', 's', 's', 'e', 'n', 'a'], bonus: null},
    {faces: ['i', 'y', 'p', 'f', 'r', 'c'], bonus: DiceBonus.B_2X},
    {faces: ['w', 'n', 'c', 'c', 't', 's'], bonus: DiceBonus.B_PLUS2},
    {faces: ['a', 'a', 'a', 'a', 'a', 'a'], bonus: DiceBonus.B_ALPHABET},
    {faces: ['c', 'p', 'i', 'e', 's', 't'], bonus: DiceBonus.B_1_REROLL},
].map(d => ({letter: d.faces[0], ...d}));

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