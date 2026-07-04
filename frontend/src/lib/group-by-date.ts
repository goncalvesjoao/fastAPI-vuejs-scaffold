import { isOneMonthAgo, isOneWeekAgo, isToday, isYesterday } from '@/lib'

export type GrouppedCollectionType<T> = {
  key: string
  collection: T[]
}

export function groupByDate<T>(
  records: T[],
  getDate: (record: T) => Date,
  locale = 'en',
): Array<GrouppedCollectionType<T>> {
  const todayCollection: T[] = []
  const yesterdayCollection: T[] = []
  const lastWeekCollection: T[] = []
  const lastMonthCollection: T[] = []
  const olderGroup: Record<string, T[]> = {}

  records.forEach((record) => {
    const recordDate = getDate(record)

    if (isToday(recordDate)) {
      todayCollection.push(record)
    } else if (isYesterday(recordDate)) {
      yesterdayCollection.push(record)
    } else if (isOneWeekAgo(recordDate)) {
      lastWeekCollection.push(record)
    } else if (isOneMonthAgo(recordDate)) {
      lastMonthCollection.push(record)
    } else {
      const monthYear = recordDate.toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
        month: 'long',
        year: 'numeric',
      })
      if (!olderGroup[monthYear]) {
        olderGroup[monthYear] = []
      }
      olderGroup[monthYear].push(record)
    }
  })

  const groups: GrouppedCollectionType<T>[] = []

  if (todayCollection.length) groups.push({ key: 'today', collection: todayCollection })
  if (yesterdayCollection.length) groups.push({ key: 'yesterday', collection: yesterdayCollection })
  if (lastWeekCollection.length) groups.push({ key: 'lastWeek', collection: lastWeekCollection })
  if (lastMonthCollection.length) groups.push({ key: 'lastMonth', collection: lastMonthCollection })

  const sortedOlderGroupEntries = Object.entries(olderGroup).sort(([a], [b]) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })
  sortedOlderGroupEntries.forEach(([monthYear, recordsForMonth]) => {
    groups.push({ key: monthYear, collection: recordsForMonth })
  })

  return groups
}
