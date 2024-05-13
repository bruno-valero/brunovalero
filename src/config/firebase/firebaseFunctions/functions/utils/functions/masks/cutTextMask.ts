export default function cutTextMask(text:string, length:number):string {
  return text.length > length ? text.slice(0, (length - 2)) + '..' : text;
};