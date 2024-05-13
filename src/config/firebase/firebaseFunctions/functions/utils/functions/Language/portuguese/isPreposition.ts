export default function isPreposition(text:string) {
  const prepositions = [ "de", "da", "para", "em", "com", "por", "sob", 
  "sobre", "entre", "durante", "após", "até", "desde", "a", "ante", 
  "perante", "conforme", "contra", "mediante", "exceto", "segundo", "afora", 
  "abaixo", "acerca", "através"];

  return prepositions.includes(text.toLowerCase());
}