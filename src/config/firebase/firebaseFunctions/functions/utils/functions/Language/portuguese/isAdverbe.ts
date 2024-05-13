export default function isAdverbe(text:string) {
  const adverbe = ["onde", "como", "quando", "porquê", "talvez", "também", 
  "nunca", "sempre", "agora", "bem", "muito", "pouco", "bastante", "aí", 
  "ali", "cá", "lá"];

  return adverbe.includes(text.toLowerCase());
}