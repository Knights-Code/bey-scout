const dayCountToColour = (dayCount) => {
  if (dayCount < 7) {
    return 'green'
  }

  if (dayCount < 14) {
    return 'gold'
  }

  return 'red'
}

export default dayCountToColour
