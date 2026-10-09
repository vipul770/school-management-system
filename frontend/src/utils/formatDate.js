export const formatDate = (date) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date))
