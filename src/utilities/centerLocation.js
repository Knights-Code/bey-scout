// Calculate average latitude and longitude for a collection of locations.
const centerLocation = (locations) => {
  if (!locations || locations.length < 1) {
    return null
  }

  const lats = locations.map((location) => {
    return location.lat
  })
  const lngs = locations.map((location) => {
    return location.lng
  })

  const sumLats = lats.reduce(
    (accumulator, currentValue) => accumulator + currentValue
  )
  const sumLngs = lngs.reduce(
    (accumulator, currentValue) => accumulator + currentValue
  )

  return {
    lat: sumLats / lats.length, // Average latitude.
    lng: sumLngs / lngs.length, // Average longitude.
  }
}

export default centerLocation
