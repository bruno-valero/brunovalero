
interface getDistanceProps {
  origins:{lat:string, lng:string};
  destinations:{lat:string, lng:string};
  apiKey: string,
}

export default async function getDistance({ apiKey, origins, destinations }:getDistanceProps):Promise<{distance:number, duration:number} | null> {
  const origin = `${origins.lat},${origins.lng}`;
  const destination = `${destinations.lat},${destinations.lng}`;
  const req = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${apiKey}`;
  const resp = await (await fetch(req)).json();

  const hasDistance = Boolean(resp?.rows?.[0]?.elements?.[0]?.distance?.value);
  const hasDuration = Boolean(resp?.rows?.[0]?.elements?.[0]?.duration?.value);
  const result = hasDistance && hasDuration ? {
    distance: resp.rows[0].elements[0].distance.value,
    duration: resp.rows[0].elements[0].duration.value,
  } : null

  return result;
}