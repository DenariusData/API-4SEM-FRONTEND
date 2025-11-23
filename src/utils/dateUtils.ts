export function convertDateToBRFormat(dateString: string): string {
  if (!dateString || typeof dateString !== 'string') {
    return ''
  }

  const parts = dateString.split('-')

  if (parts.length !== 3) {
    return ''
  }

  const [year, month, day] = parts

  if (!isValidDateComponent(year) || !isValidDateComponent(month) || !isValidDateComponent(day)) {
    return ''
  }

  return `${day}/${month}/${year}`
}

function isValidDateComponent(component: string): boolean {
  return /^\d+$/.test(component) && component.length > 0
}
