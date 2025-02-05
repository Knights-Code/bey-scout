const countDaysBetween = (firstDate, secondDate) => {
  // Create copies to work with.
  const firstDateCopy = new Date(firstDate)
  const secondDateCopy = new Date(secondDate)

  // Set times on both dates to midnight to avoid weird rounding.
  firstDateCopy.setHours(0, 0, 0)
  secondDateCopy.setHours(0, 0, 0)

  const oneDay = 24 * 60 * 60 * 1000 // hours*minutes*seconds*milliseconds

  return Math.round(Math.abs((firstDateCopy - secondDateCopy) / oneDay))
}

export default countDaysBetween
