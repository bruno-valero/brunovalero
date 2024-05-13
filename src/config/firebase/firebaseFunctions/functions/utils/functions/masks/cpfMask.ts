export default function cpfMask(cpf:string):string {
  cpf = cpf.replaceAll(' ', '').replaceAll(/\D+/g, '');
  const first = cpf.slice(0,3);
  const second = cpf.slice(3,6);
  const third = cpf.slice(6,9);
  const fourth = cpf.slice(9,11);

  if (first.length < 3) return first;
  if (first.length === 3 && !second) return `${first}.`;
  if (second.length < 3  && !third) return `${first}.${second}`;
  if (second.length === 3 && !third) return `${first}.${second}.`;
  if (third.length < 3 && !fourth) return `${first}.${second}.${third}`;
  if (third.length === 3 && !fourth) return `${first}.${second}.${third}-`;
  if (fourth) return `${first}.${second}.${third}-${fourth}`;
  return `${first}.${second}.${third}-${fourth}`;
}