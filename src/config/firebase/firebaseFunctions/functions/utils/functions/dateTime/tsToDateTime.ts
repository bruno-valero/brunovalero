import getHoursFromTs from './getDateOrTime/relative/getHoursFromTs';
import getMillisecondsFromTs from './getDateOrTime/relative/getMillisecondsFromTs';
import getMinutesFromTs from './getDateOrTime/relative/getMinutesFromTs';
import getMonthFromTs from './getDateOrTime/relative/getMonthFromTs';
import getSecondsFromTs from './getDateOrTime/relative/getSecondsFromTs';
import getYearFromTs from './getDateOrTime/relative/getYearFromTs';
import getDayFromTs from './getDateOrTime/utc/getUTCDayFromTs';

export default function tsToDateTime({ ts }:TsToDateTimePropsType):string {
  const timestamp:number = ts ?? new Date().getTime();
  const year:string = getYearFromTs({ ts: timestamp })
  const month:string = getMonthFromTs({ ts: timestamp })
  const day:string = getDayFromTs({ ts: timestamp })
  const hours:string = getHoursFromTs({ ts: timestamp })
  const minutes:string = getMinutesFromTs({ ts: timestamp })
  const seconds:string = getSecondsFromTs({ ts: timestamp })
  const milliseconds:string = getMillisecondsFromTs({ ts: timestamp })

  const dateTime:string = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;

  return dateTime;
};

export type TsToDateTimePropsType = { ts?:number };
export type TsToDateTimeType = (props:TsToDateTimePropsType) => string;