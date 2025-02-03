const countDaysBetween = (firstDate, secondDate) => {
  // Set times on both dates to midnight to avoid weird rounding.
  firstDate.setHours(0, 0, 0)
  secondDate.setHours(0, 0, 0)

  const oneDay = 24 * 60 * 60 * 1000 // hours*minutes*seconds*milliseconds

  return Math.round(Math.abs((firstDate - secondDate) / oneDay))
}

export default countDaysBetween
