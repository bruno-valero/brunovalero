export default async function getCep(cep:string) {
  type CepResponse = {
    erro:boolean,
    cep: string,
    logradouro: string,
    complemento: string,
    bairro: string,
    localidade: string,
    uf: string,
    ibge: string,
    gia: string,
    ddd: string,
    siafi: string,
  }
  const address:CepResponse = await (await fetch(`https://viacep.com.br/ws/${cep}/json/`)).json();
  if (address.erro) return null;
  return {
    zipCode:address.cep,
    streetAddress:address.logradouro,
    neighborhood:address.bairro,
    city:address.localidade,
    state:address.uf,
    ibge:address.ibge,
    gia:address.gia,
    ddd:address.ddd,
    siafi:address.siafi,
  };
};