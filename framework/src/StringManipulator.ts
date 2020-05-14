import _ from "underscore";
export class StringManipulator {
  static addProximitySpellingErrorToEachWord(
    sentence: string,
    noise: number
  ): string {
    const alphabet: {[key: string]: string[]} = {
      a: ["s", "q", "z"],
      b: ["n", "v", "g"],
      c: ["x", "d", "f"],
      d: ["f", "s", "e"],
      e: ["w", "r", "d"],
      f: ["d", "g", "r"],
      g: ["f", "h", "t"],
      h: ["g", "j", "n"],
      i: ["u", "o", "k"],
      j: ["h", "k", "u"],
      k: ["j", "l", "i"],
      l: ["k", "o", "p"],
      m: ["n", "j", "k"],
      n: ["m", "b", "h"],
      o: ["i", "p", "l"],
      p: ["o", "l"],
      q: ["w", "a", "s"],
      r: ["e", "t", "f"],
      s: ["a", "d", "w"],
      t: ["r", "y", "g"],
      u: ["y", "i", "j"],
      v: ["b", "c", "f"],
      w: ["q", "e", "s"],
      x: ["z", "c", "s"],
      y: ["u", "t", "h"],
      z: ["x", "a", "s"],
    };
    sentence = sentence.toLowerCase();
    const words = sentence.split(" ");
    const modifiableWordIndexes: number[] = [];
    for (const word of words) {
      let legalWord = true;
      if (word.length < 2) {
        continue;
      }
      for (const character of word) {
        if (!alphabet[character]) {
          legalWord = false;
        }
      }
      if (legalWord) {
        modifiableWordIndexes.push(words.indexOf(word));
      }
    }
    const wordsToEdit = Math.ceil(
      modifiableWordIndexes.length * Math.min(noise, 1)
    );

    const editIndexes = _.shuffle(modifiableWordIndexes).slice(0, wordsToEdit);
    let newSentence = "";
    let wordIndex = 0;
    for (const word of words) {
      if (!modifiableWordIndexes.includes(wordIndex)) {
        newSentence += word + " ";
        wordIndex += 1;
        continue;
      }
      if (editIndexes.includes(wordIndex)) {
        let spellingMistakeIndex = _.random(0, word.length - 1);
        if (spellingMistakeIndex === 0) {
          spellingMistakeIndex = 1;
        }
        const wordSplit1 = word.slice(0, spellingMistakeIndex);
        const wordSplit2 = word.slice(spellingMistakeIndex);
        const spellingMistakeValues =
          alphabet[word.charAt(spellingMistakeIndex)];
        const spellingMistake = _.sample(spellingMistakeValues);
        newSentence += wordSplit1 + spellingMistake + wordSplit2 + " ";
      } else {
        newSentence += word + " ";
      }
      wordIndex += 1;
    }
    return newSentence;
  }
}
