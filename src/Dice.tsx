export enum DiceBonus {
    B_2X = '2x',
    B_PLUS3 = '+3 starter',
  }
export type TDie = { letter: string, faces: string[], bonus: DiceBonus | null};

const STARTER_DICE_FACES = [
    'ennnda',
    'titiei',
    'ipcelt',
    'eeeema',
    'eeeeaa',
    //'afiysr',
    'nemnga',
    'rihprv',
    'tttome',
    //'nesuss',
    'wrovgr',
    //'cpiest',
    //'iypfrs',
    'teliic',
    'ugeema',
    //'rasaaf',
    'nhdtoh',
    'ouotnw',
    'rddonl',
    //'wnccts',
    //'xzkqjb',
    //'hhrldo',
    'touoot',
    //'isfraa',
    'nrlhdo'
];
export const STARTER_DICE: TDie[] = STARTER_DICE_FACES.map(faces => ({ letter: faces[0], faces: [...faces], bonus: null}));

export const ADDITIONAL_DICE: TDie[] = [
    {faces: ['tion', 'qu', 'er', 'ir', 'ed', 'ion'], bonus: null},
    {faces: ['x', 'z', 'k', 'q', 'j', 'b'], bonus: DiceBonus.B_2X},
    {faces: ['h', 'h', 'r', 'l', 'd', 'o'], bonus: DiceBonus.B_PLUS3},
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