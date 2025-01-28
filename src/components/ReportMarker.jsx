import { Marker, Popup } from 'react-leaflet'
import moneyFormat from '../utilities/moneyFormat'

const ReportMarker = ({ report }) => {
  const { source, product, priceInCents } = report
  const { geolocation } = source

  return (
    <Marker position={[geolocation.lat, geolocation.lng]}>
      <Popup>
        <h3>{source.name}</h3>
        <p>
          {product.name} - {moneyFormat(priceInCents)}
        </p>
      </Popup>
    </Marker>
  )
}

export default ReportMarker
