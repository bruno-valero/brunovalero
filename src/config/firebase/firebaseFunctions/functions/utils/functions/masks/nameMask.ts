import isSubstantive from '../Language/portuguese/isSubstantive';

export default function nameMask(name:string):string {
  const word = name.trim().split(' ');
  const capitalized = word.map(w => {
    if (!isSubstantive(w)) return w.toLowerCase();
    const capWord = w.slice(0,1).toUpperCase() + w.slice(1).toLowerCase();
    return capWord;
  })
  let newWord = name;
  // @ts-ignore
  const ajust = word.map((w, i) => {
    newWord = newWord.replace(w, capitalized[i])
  })
  return newWord;
}