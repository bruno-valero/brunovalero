import cepMask from '../../masks/cepMask';

interface GetLatLongProps {
  zipCode?: string,
  streetAddress?: string,
  number?: string,
  neighborhood?: string,
  city?: string,
  state?: string,
  apiKey: string,
}

export default async function getLatLong({ zipCode, streetAddress, number, neighborhood, city, state, apiKey }:GetLatLongProps):Promise<{lat: string, lng: string } | null> {
  const data = {
    zipCode:cepMask(zipCode ?? ''), 
    streetAddress:(streetAddress ?? '').split(' ').join('+'), 
    number: number ?? '', 
    neighborhood: (neighborhood ?? '').split(' ').join('+'), 
    city:(city ?? '').split(' ').join('+'), 
    state:(state ?? '').split(' ').join('+'),
  };

  let string = '';
  const zip = data.zipCode;
  const street = data.streetAddress;
  const num = data.number;
  const neigh = data.neighborhood;
  const ci = data.city;
  const uf = data.state;
  
  const All = Boolean(zip) &&  Boolean(street) &&  Boolean(num) &&  Boolean(neigh) &&  Boolean(ci) &&  Boolean(uf);
  const onlyZip = Boolean(zip) &&  (!Boolean(street) ||  !Boolean(num) ||  !Boolean(neigh) ||  !Boolean(ci) ||  !Boolean(uf));
  const notZipAndNumber = (!Boolean(zip) &&  !Boolean(num)) && (Boolean(street) &&   Boolean(neigh) &&  Boolean(ci) &&  Boolean(uf));
  if (All) {
    string = `${num}+${street},${neigh},+${ci},+${uf},+${zip}`;
  }else if (onlyZip) {
    string = `${zip}`;
  }else if (notZipAndNumber) {
    string = `${street},+${neigh},+${ci},+${uf}`;
  } else {
    return null;
  };
  const req = `https://maps.googleapis.com/maps/api/geocode/json?address=${string}&key=${apiKey}`;
  const resp = await (await fetch(req)).json();
  const result = (resp.results?.[0]?.geometry?.location ?? null) ? {
    lat: String(resp.results[0].geometry.location.lat),
    lng: String(resp.results[0].geometry.location.lng),
  } : null;
  return result;
  // const latLong = {
  //   "lat" : '-23.3964116',
  //   "lng" : '-46.3086736',
  // };
  // return latLong;
}