export default function dateMask(date:string):string {
  date = date.replaceAll(' ', '').replaceAll('/', '');
  const first = date.slice(0,2);
  const second = date.slice(2,4);
  const third = date.slice(4,6);

  if (first.length < 2) return first;
  if (first.length === 2 && !second) return `${first}/`;
  if (second.length < 2) return `${first}/${second}`;
  if (second.length === 2 && !third) return `${first}/${second}/`;
  if (third) return `${first}/${second}/${third}`;  
  return `${first}/${second}/${third}`;
}