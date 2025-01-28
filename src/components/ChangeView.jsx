import { latLngBounds } from 'leaflet'
import { useMap } from 'react-leaflet'

// Component to place inside a <MapContainer /> that
// automatically adjusts map center and map zoom when
// the marker locations change.
const ChangeView = ({ center, locations }) => {
  const map = useMap()

  map.setView({ lat: center.lat, lng: center.lng })

  let locationBounds = latLngBounds([])
  locations.forEach((location) => {
    locationBounds.extend([location.lat, location.lng])
  })

  locationBounds.isValid() && map.fitBounds(locationBounds)
  return null
}

export default ChangeView
