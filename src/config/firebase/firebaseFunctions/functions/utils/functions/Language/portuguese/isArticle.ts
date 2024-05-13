export default function isArticle(text:string) {
  const article = [
    "o", "a", "os", "as", "um", "uma", "uns", "umas"
];

  return article.includes(text.toLowerCase());
}