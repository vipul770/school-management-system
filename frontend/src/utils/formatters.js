export const formatCurrency=(value,currency='USD')=>new Intl.NumberFormat(undefined,{style:'currency',currency}).format(Number(value||0))
export const formatDate=(value)=>value?new Intl.DateTimeFormat(undefined,{dateStyle:'medium'}).format(new Date(value)):'—'
export const formatPercent=(value)=>`${Math.round(Number(value||0))}%`
