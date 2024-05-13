export default function negativeAndPositiveColor({num, model, negativeColor, positiveColor}:NegativeAndPositiveColorParamsType):string {
  if (!model && (typeof num === 'string')) throw 'Se "num" fo uma string, o parametro model deve conter ${num}, que indica onde esta o número do parametro num';
  if (!model && (typeof num === 'number')) {
    if (num <= 0) return negativeColor ?? 'rgba(250,40,40,.8)';
    return positiveColor ?? 'rgba(40,250,40,.8)';
  }
  if (!model) throw 'O parametro model deve conter ${num}, que indica onde esta o número do parametro num';
  if (typeof num === 'number') throw 'Ao fornecer o "model", o "num" deve ser uma string e o parametro model deve conter ${num}, que indica onde esta o número do parametro num';
  if (!/\${num}/g.test(model)) throw 'O parametro model deve conter ${num}, que indica onde esta o número do parametro num';
  const notNumber = model.split('${num}');
  const number = Number(num.replace(notNumber[0], '').replace(notNumber[1], ''));
  if (number <= 0) return negativeColor ?? 'rgba(250,40,40,.8)';
  return positiveColor ?? 'rgba(40,250,40,.8)';
}


export type NegativeAndPositiveColorParamsType = {num:string | number, model?:string, negativeColor?:string, positiveColor?:string};
export type NegativeAndPositiveColorType = ({num, model}:{num:number, model:string}) => string;