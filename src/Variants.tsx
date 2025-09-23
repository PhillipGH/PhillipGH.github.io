
export enum Variant {
    BASE = 'Standard',
    WORDSMITH = 'Wordsmith',
}

export function getVariantDescription(variant: Variant): string {
    switch (variant) {
        case Variant.BASE:
            return 'Let\'s get wordy!!';
        case Variant.WORDSMITH:
            return 'Ready for a challenge? Words less than 5 letters long give 0 points!';
    }
}