'use client'


interface WaveDivision {
    screenWidth:number;
    areaY?:number;
    color:string;
}

export default function WaveDivision({ screenWidth, color, areaY }:WaveDivision) {

  const calcularNovoValorY = (valorY:number) => {
    return valorY * (areaY ?? 1);
  };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${screenWidth / 1.35} 320`}><path fill={color} fillOpacity="1" d={`M0,${calcularNovoValorY(192)}L40,${calcularNovoValorY(208)}C80,${calcularNovoValorY(224)},160,${calcularNovoValorY(256)},240,${calcularNovoValorY(245.3)}C320,${calcularNovoValorY(235)},400,${calcularNovoValorY(181)},480,${calcularNovoValorY(138.7)}C560,${calcularNovoValorY(96)},640,${calcularNovoValorY(64)},720,${calcularNovoValorY(69.3)}C800,${calcularNovoValorY(75)},880,${calcularNovoValorY(117)},960,${calcularNovoValorY(144)}C1040,${calcularNovoValorY(171)},1120,${calcularNovoValorY(181)},1200,${calcularNovoValorY(176)}C1280,${calcularNovoValorY(171)},1360,${calcularNovoValorY(149)},1400,${calcularNovoValorY(138.7)}L1440,${calcularNovoValorY(128)}L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z`}></path></svg>        
  );
}
