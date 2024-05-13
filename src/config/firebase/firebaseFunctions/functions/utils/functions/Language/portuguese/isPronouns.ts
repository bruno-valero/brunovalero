export default function isPronouns(text:string) {
  const pronouns = [
    "eu", "tu", "ele", "ela", "nós", "vós", "eles", "meu", "teu", "seu", "nosso", "vosso", "seu", "este", "esse", "aquele", "nenhum", "todo", "qual", "quem", "cujo"
];

  return pronouns.includes(text.toLowerCase());
}