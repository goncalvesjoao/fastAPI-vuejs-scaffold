export const getNow = () => new Date()
export const getOneWeekAgo = () => new Date(getNow().getTime() - 7 * 24 * 60 * 60 * 1000)
export const getOneMonthAgo = () => new Date(getNow().getTime() - 30 * 24 * 60 * 60 * 1000)
export const getYesterday = () => {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date
}

export function isToday(date: Date): boolean {
  const today = getNow()

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

export function isYesterday(date: Date): boolean {
  const yesterday = getYesterday()

  return (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  )
}

export function isOneWeekAgo(date: Date): boolean {
  return date >= getOneWeekAgo()
}

export function isOneMonthAgo(date: Date): boolean {
  return date >= getOneMonthAgo()
}
