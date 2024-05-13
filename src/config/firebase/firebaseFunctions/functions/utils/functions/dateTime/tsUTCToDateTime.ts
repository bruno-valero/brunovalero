import getUTCDayFromTs from './getDateOrTime/relative/getDayFromTs';
import getUTCHoursFromTs from './getDateOrTime/utc/getUTCHoursFromTs';
import getUTCMillisecondsFromTs from './getDateOrTime/utc/getUTCMillisecondsFromTs';
import getUTCMinutesFromTs from './getDateOrTime/utc/getUTCMinutesFromTs';
import getUTCMonthFromTs from './getDateOrTime/utc/getUTCMonthFromTs';
import getUTCSecondsFromTs from './getDateOrTime/utc/getUTCSecondsFromTs';
import getUTCYearFromTs from './getDateOrTime/utc/getUTCYearFromTs';

export default function tsUTCToDateTime({ ts }:TsUTCToDateTimePropsType):string {
  const timestamp:number = ts ?? new Date().getTime();
  const year:string = getUTCYearFromTs({ ts: timestamp })
  const month:string = getUTCMonthFromTs({ ts: timestamp })
  const day:string = getUTCDayFromTs({ ts: timestamp })
  const hours:string = getUTCHoursFromTs({ ts: timestamp })
  const minutes:string = getUTCMinutesFromTs({ ts: timestamp })
  const seconds:string = getUTCSecondsFromTs({ ts: timestamp })
  const milliseconds:string = getUTCMillisecondsFromTs({ ts: timestamp })

  const dateTime:string = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;

  return dateTime;
};

export type TsUTCToDateTimePropsType = { ts?:number };
export type TsUTCToDateTimeType = (props:TsUTCToDateTimePropsType) => string;