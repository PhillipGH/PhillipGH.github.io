
export enum Variant {
  BASE = 'Standard',
  WORDSMITH = 'Wordsmith',
  BLACKOUT = 'Blackout',
}

export function getVariantDescription(variant: Variant): string {
  switch (variant) {
    case Variant.BASE:
      return 'Let\'s get wordy! Form words to score points before time runs out!';
    case Variant.WORDSMITH:
      return 'Words less than 5 letters long give 0 points! Words give bonus time!';
    case Variant.BLACKOUT:
      return 'Use all dice to beat a level! Points grant rerolls! Words cannot be reused between levels!';
  }
}

const OVERRIDE_TIME = null;
const OVERRIDE_SCORE = null;

export function getRequiredScore(variant: Variant, level: number): number {
  if (OVERRIDE_SCORE != null) return OVERRIDE_SCORE;
  switch (variant) {
    case Variant.WORDSMITH:
      if (level < 3) return level * 3;
      return -2 + level * 4;
    case Variant.BLACKOUT:
      return 5 + level * 3;
    case Variant.BASE:
      return 3 + level * 3 + Math.round(3 * Math.log(level));
  }
}

export function getTimeLimit(variant: Variant, level: number): number {
  if (OVERRIDE_TIME != null) return OVERRIDE_TIME;
  switch (variant) {
    case Variant.BASE:
      return 88 + level * 4;
    case Variant.WORDSMITH:
      return 90;
    case Variant.BLACKOUT:
      return 70 + level * 2;
  }
}

// for balancing:
// for (let i = 1; i <= 15; i++) {
//   console.log(i, getRequiredScore( Variant.BASE, i), getRequiredScore( Variant.WORDSMITH, i));
// }