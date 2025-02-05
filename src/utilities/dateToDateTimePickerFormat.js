const dateToDateTimePickerFormat = (date) => {
  const month = date.getMonth() + 1
  const formattedMonth = `${month < 10 ? '0' : ''}${month}` // Leading 0 for months 1-9.
  const day = date.getDate()
  const formattedDay = `${day < 10 ? '0' : ''}${day}` // Leading 0 for days 1-9.
  const hours = date.getHours()
  const formattedHours = `${hours < 10 ? '0' : ''}${hours}` // Leading 0 for days 1-9.
  const minutes = date.getMinutes()
  const formattedMinutes = `${minutes < 10 ? '0' : ''}${minutes}` // Leading 0 for days 1-9.
  const formattedString = `${date.getFullYear()}-${formattedMonth}-${formattedDay}T${formattedHours}:${formattedMinutes}`

  return formattedString
}

export default dateToDateTimePickerFormat
