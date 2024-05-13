export default function isConjunction(text:string) {
  const conjunction = [
    "e", "ou", "mas", "porque", "se", 
    "embora", "enquanto", "contanto que"
];

  return conjunction.includes(text.toLowerCase());
}