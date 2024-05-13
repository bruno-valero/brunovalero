export default function rgMask(cpf:string):string {
  cpf = cpf.replaceAll(' ', '');
  const first = cpf.slice(0,2);
  const second = cpf.slice(2,5);
  const third = cpf.slice(5,8);
  const fourth = cpf.slice(8,9);

  if (!first) return '';
  if (first && !second) return `${first}.`;
  if (second && !third) return `${first}.${second}.`;
  if (third && !fourth) return `${first}.${second}.${third}-`;
  if (fourth) return `${first}.${second}.${third}-${fourth}`;
  return `${first}.${second}.${third}-${fourth}`;
}