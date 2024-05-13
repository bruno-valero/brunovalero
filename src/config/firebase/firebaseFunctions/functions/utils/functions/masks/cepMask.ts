export default function cepMask(cep:string):string {
  cep = cep.replaceAll(' ', '').replaceAll(/\D+/g, '');
  if (cep.length < 5 ) return cep;
  if (cep.length === 5 ) return cep + '-';
  return cep.slice(0,5) + '-' + cep.slice(5,8);
};