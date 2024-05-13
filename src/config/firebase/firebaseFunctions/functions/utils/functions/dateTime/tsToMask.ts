import getHoursFromTs from './getDateOrTime/relative/getHoursFromTs';
import getMillisecondsFromTs from './getDateOrTime/relative/getMillisecondsFromTs';
import getMinutesFromTs from './getDateOrTime/relative/getMinutesFromTs';
import getMonthFromTs from './getDateOrTime/relative/getMonthFromTs';
import getSecondsFromTs from './getDateOrTime/relative/getSecondsFromTs';
import getYearFromTs from './getDateOrTime/relative/getYearFromTs';
import getDayFromTs from './getDateOrTime/utc/getUTCDayFromTs';

/**
 * 
 * tsToMask [timestamp(ts) convertido para uma Máscara(ToMask)] - Esta função retorna uma máscara de datas totalmente personalizável.
 * 
 * Os parâmetros a seguir devem estar em um objeto {}
 * 
 * @param {number} ts ?:number - timestamp utilizado para gerar a máscara  de datas (se não for passado, usa o momento atual).
 * @param {Array<FormatPossibilityType>} format ?:FormatPossibilityType[] - quais dados de datas e em que ordem aparecerão (se não for passado, usa um formato padrão "['day', 'month', 'year', 'hours', 'minutes', 'seconds', 'milliseconds']").
 * @param {Array<string>} seps ?:string[] - quais serão os separadores dos respectivos dados de datas (se não for passado, usa separadores padrão "['/', '/', ' ', ':', ':', '.']").
 * 
 * Se forem passados a menos, automaticamente substitui os restantes com os respectivos valores padrão.
 * 
 * Se forem passados a mais retira os valores excedentes até que o array tenha o comprimento do array do formato - 1
 * @returns {string} uma string contendo a máscara de data totalmente personalizada.
 * 
 * Caso você queira obter o padrão ISO 8601 "AAAA-MM-DDTHH:MM:SS.SSSZ", use a função tsToDateTime ou tsUTCToDateTime
 */


export default function tsToMask({ ts, format, seps }:tsToMaskPropsType):string {

  const timestamp:number = new Date(ts ?? '').getTime();
  const year:string = getYearFromTs({ ts: timestamp });
  const month:string = getMonthFromTs({ ts: timestamp });
  const day:string = getDayFromTs({ ts: timestamp });
  const hours:string = getHoursFromTs({ ts: timestamp });
  const minutes:string = getMinutesFromTs({ ts: timestamp });
  const seconds:string = getSecondsFromTs({ ts: timestamp });
  const milliseconds:string = getMillisecondsFromTs({ ts: timestamp });

  const dateData = {
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    milliseconds,
  };

  const actualFormat:Array<FormatPossibilityType> = format ?? ['day', 'month', 'year', 'hours', 'minutes', 'seconds', 'milliseconds'];
  const actualSeps:Array<string> = seps ?? ['/', '/', ' ', ':', ':', '.'];
  
  const sep:{substitute?:Array<string>} =  {};

  if (actualSeps.length < (actualFormat.length - 1)) {
    const difference:number = (actualFormat.length - 1) - actualSeps.length;
    const sepModel:Array<string> = ['/', '/', ' ', ':', ':', '.'];
    sep['substitute'] = [...actualSeps, ...sepModel.slice(actualSeps.length, actualSeps.length + difference)];
  }

  if (actualSeps.length > (actualFormat.length - 1)) {   
    sep['substitute'] = actualSeps.slice(0, (actualFormat.length - 1));
  }

  const usableSeps:Array<string> = sep?.substitute ?? actualSeps;

  const dateDataArray:Array<string> = actualFormat.map((item, i) => `${dateData[item] ?? ''}${dateData[item] ? (i > actualFormat.length - 2 ? '' : usableSeps[i]) : ''}`);

  const maskedDate:string = dateDataArray.join('');  

  return maskedDate;
};

export type FormatPossibilityType = 'year' | 'month' | 'day' | 'hours' | 'minutes' | 'seconds' | 'milliseconds';
export type tsToMaskPropsType = {
  ts?:number | string, 
  format?:Array<FormatPossibilityType>,
  seps?: Array<string>,
};
export type tsToMaskType = (props:tsToMaskPropsType) => string;