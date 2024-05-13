export default function isInterjection(text:string) {
  const interjection = [
    "ah", "oh", "uau", "ei"
];

  return interjection.includes(text.toLowerCase());
}