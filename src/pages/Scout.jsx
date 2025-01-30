import { useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import { TextField } from '@mui/material'
import { MapContainer, TileLayer } from 'react-leaflet'
import useSearchCandidates from '../hooks/useSearchCandidates'
import fetchReports from '../functions/fetchReports'
import Spinner from '../components/Spinner'
import centerLocation from '../utilities/centerLocation'
import ChangeView from '../components/ChangeView'
import ReportMarker from '../components/ReportMarker'

function Scout() {
  const [loading, setLoading] = useState(false)
  const [searchFor, setSearchFor] = useState('')
  const [reports, setReports] = useState([])
  const [centerMapLocation, setCenterMapLocation] = useState({ lat: 0, lng: 0 })
  const [markerLocations, setMarkerLocations] = useState([])

  // Get full list of unique product and component names.
  const searchCandidates = useSearchCandidates()

  const onMutate = (e, newValue) => {
    e.preventDefault()
    setSearchFor(newValue)

    const searchForReports = async (productOrComponent) => {
      setLoading(true)

      // Fetch reports.
      const reportsResult = await fetchReports(productOrComponent)
      setReports(reportsResult)

      if (reportsResult.length > 0) {
        const reportLocations = reportsResult.map(
          (report) => report.source.geolocation
        )

        // Update marker locations.
        setMarkerLocations(reportLocations)

        // Calculate center location for map.
        setCenterMapLocation(centerLocation(reportLocations))
        setLoading(false)
      }
    }

    searchForReports(newValue)
  }

  if (loading) return <Spinner />

  return (
    <div className='pageContainer'>
      <h1>Bey Scout</h1>
      <div className='lookupContainer'>
        <Autocomplete
          disablePortal
          options={searchCandidates}
          value={searchFor}
          onChange={onMutate}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...params} label='Product or Component' />
          )}
        />
      </div>

      {reports.length > 0 && (
        <div className='leafletContainer'>
          <MapContainer
            style={{ height: '100%', width: '100%' }}
            center={[centerMapLocation.lat, centerMapLocation.lng]}
            scrollWheelZoom={true}
            zoomControl={false}
          >
            <ChangeView
              center={centerMapLocation}
              locations={markerLocations}
            />

            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
            />

            {reports.map((report) => (
              <ReportMarker key={report.id} report={report} />
            ))}
          </MapContainer>
        </div>
      )}

      {reports.length === 0 && <p>No results found.</p>}
    </div>
  )
}

export default Scout
