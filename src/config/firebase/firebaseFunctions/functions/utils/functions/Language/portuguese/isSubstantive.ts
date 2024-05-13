import isAdverbe from './isAdverbe';
import isArticle from './isArticle';
import isConjunction from './isConjunction';
import isInterjection from './isInterjection';
import isPreposition from './isPreposition';
import isPronouns from './isPronouns';

export default function isSubstantive(text:string) {
  const adverbe = isAdverbe(text);
  const article = isArticle(text);
  const conjunction = isConjunction(text);
  const interjection = isInterjection(text);
  const preposition = isPreposition(text);
  const pronouns = isPronouns(text);

  return !adverbe && !article && !conjunction && !interjection && !preposition && !pronouns;
}