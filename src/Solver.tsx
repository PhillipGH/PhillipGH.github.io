import { TDie } from "./Dice";


// find all boggle words starting from starting die
export function solveForWords(xStart: number, yStart: number, dice: (TDie | null)[][], dictionary: Set<string>, dictionarySorted: string[]): Set<string> {
    const startDie = dice[xStart][yStart];
    const foundWords = new Set<string>();
    if (startDie == null) return foundWords;
    function recursiveHelper(x: number, y: number, prefix: string, usedDice: TDie[]) {
        // console.log(x,y,prefix);
        if (dictionary.has(prefix)) {
          foundWords.add(prefix);
        }
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                const die = x + i >= 0 && x + i < dice.length && y + j >= 0 && y + j < dice[x].length ? dice[x + i][y + j] : null;
                if (die && !usedDice.includes(die)) {
                    const newPrefix = prefix + die.letter;
                    if (prefixInDictionary(newPrefix, dictionarySorted)) {
                        const newUsedDice = [...usedDice, die];
                        recursiveHelper(x + i, y + j, newPrefix, newUsedDice);
                    }
                }
            }
        }
        return foundWords;
    }
    recursiveHelper(xStart, yStart, startDie.letter, [startDie]);

    return foundWords;

}

function prefixInDictionary(prefix: string, dictionarySorted: string[]): boolean {
    // do a binary search
    let low = 0;
    let high = dictionarySorted.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        // for (let i = 0; i < prefix.length; i++) {

        // }
        // if (hasStar) {
        //     dictionarySorted[mid]

        if (dictionarySorted[mid].startsWith(prefix)) {
            return true;
        }
        if (dictionarySorted[mid] < prefix) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return false;
}