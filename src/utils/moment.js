import moment from 'moment'

export const format = 'YYYY-MM-DD'

export const DEFAULT_FORMAT = 'YYYY-MM-DD hh:mm:ss'
export const now = moment()

export const today = moment([
  now.year(),
  now.month(),
  now.date(),
  23,
  59,
  59,
  0,
]).toDate()

export const tomorrow = moment(new Date()).add(1, 'days').format(format)

export const nextThreeDay = moment(new Date()).add(3, 'days').format(format)

export const oneYearAgo = moment(new Date()).subtract(1, 'years')

export const listLast30Days = getDays(today, 30)

export function getDays(date, number) {
  const listDays = Array.from({ length: number + 1 }, (item, index) => {
    return getDay(date, index)
  })
  return listDays
}

export function getDay(date, number) {
  return moment(date).subtract(number, 'days').format(format)
}

export function convertLocalToUTC(date, format) {
  return moment(date).utc().format(format)
}

export function convertUTCToLocal(date, format) {
  return moment.utc(date).local().format(format)
}

function theDayBeforeToday(numberOfDay, hour = 0, minute = 0) {
  return moment([now.year(), now.month(), now.date(), hour, minute])
    .subtract(numberOfDay, 'days')
    .toDate()
}

export const yesterday = theDayBeforeToday(1)
export const yesterdayEnd = theDayBeforeToday(1, 23, 59)

export const last3Days = theDayBeforeToday(3)
export const last6Days = theDayBeforeToday(6)
export const last7Days = theDayBeforeToday(7)
export const last30Days = theDayBeforeToday(30)
export const last90Days = theDayBeforeToday(90)
export const last365Days = theDayBeforeToday(365)

export const lastMonth = moment(today)
  .subtract(1, 'months')
  .startOf('month')
  .toDate()

export const lastMonthEnd = moment(today)
  .subtract(1, 'months')
  .endOf('month')
  .toDate()

export const lastYear = moment(today)
  .subtract(1, 'years')
  .startOf('year')
  .toDate()

export const lastYearEnd = moment(today)
  .subtract(1, 'years')
  .endOf('year')
  .milliseconds(0)
  .toDate()

export const thisMonth = moment(today).startOf('month').toDate()

export const thisYear = moment(today).startOf('year').toDate()

export const thisQuarterStart = moment(today)
  .quarter(moment(today).quarter())
  .startOf('quarter')
  .toDate()

export const lastQuarterStart = moment(today)
  .quarter(moment(today).quarter())
  .subtract(1, 'quarter')
  .startOf('quarter')
  .toDate()

export const lastQuarterEnd = moment(today)
  .quarter(moment(today).quarter())
  .subtract(1, 'quarter')
  .endOf('quarter')
  .milliseconds(0)
  .toDate()

export const defaultRange = {
  today: [today, today],
  yesterday: [yesterday, yesterday],
  last_7_days: [last7Days, today],
  this_month: [thisMonth, today],
  last_month: [lastMonth, lastMonthEnd],
  this_year: [thisYear, today],
  last_1_year: [last365Days, today],
}

export const toFormatString = (date, fmt = 'DD/MM/YYYY') => {
  return moment(date).format(fmt)
}

export const toCreatedDate = (date) => {
  return moment(date).format('HH:mm DD/MM/YYYY')
}

export const rangeLength = (start, end, unit = 'days') => {
  return Array.from(moment.range(start, end).by(unit)).length
}

export const fromStringToFormat = (
  str,
  fromFmt = DEFAULT_FORMAT,
  toFmt = DEFAULT_FORMAT
) => {
  return moment(str, fromFmt).format(toFmt)
}

export const localeConfigs = {
  vi: {
    relativeTime: {
      future: 'trong %s',
      past: '%s trước',
      s: 'vài giây',
      ss: '%d giây',
      m: '1 phút',
      mm: '%d phút',
      h: '1 giờ',
      hh: '%d giờ',
      d: '1 ngày',
      dd: '%d ngày',
      w: '1 tuần',
      ww: '%d tuần',
      M: '1 tháng',
      MM: '%d tháng',
      y: '1 năm',
      yy: '%d năm',
    },
  },
}

export const toRequestRange = (start, end, fmt = 'YYYY-MM-DD') => {
  return {
    start: toUtcString(start, fmt),
    end: toUtcString(end, fmt),
  }
}

export const toUtcString = (date, fmt = 'YYYY-MM-DD') =>
  moment.unix(date).utc().format(fmt)

export const toUtcDate = (date, fmt = 'YYYY-MM-DD') =>
  moment(date).utc().format(fmt)

export const toUtc = (date, fmt = 'YYYY-MM-DD') => {
  if (typeof date === 'number') return toUtcString(date, fmt)
  return toUtcDate(date, fmt)
}

export const getRange = (start, end) => {
  if (typeof start === 'number' && typeof end === 'number') {
    return moment.range(moment.unix(start), moment.unix(end))
  }
  return moment.range(moment(start), moment(end))
}

export const genLabelDate = (start, end, fmt = DEFAULT_FORMAT) => {
  return Array.from(moment.range(start, end).by('day')).map((m) =>
    m.format(fmt)
  )
}

export const genLabelHour = (fmt = 'HH:mm:SS') => {
  const start = new Date(2012, 2, 1)
  const end = new Date(2012, 2, 2)
  return Array.from(moment.range(start, end).by('hour'))
    .slice(0, 24)
    .map((m) => m.format(fmt))
}
