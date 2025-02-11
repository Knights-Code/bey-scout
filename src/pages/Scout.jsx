import { useEffect, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import { TextField } from '@mui/material'
import { MapContainer, TileLayer } from 'react-leaflet'
import fetchReports from '../functions/fetchReports'
import Spinner from '../components/Spinner'
import centerLocation from '../utilities/centerLocation'
import ChangeView from '../components/ChangeView'
import ReportMarker from '../components/ReportMarker'
import fetchProductsAndComponents from '../functions/fetchProductsAndComponents'

function Scout() {
  const [loading, setLoading] = useState(false)
  const [searchCandidates, setSearchCandidates] = useState([])
  const [products, setProducts] = useState([])
  const [components, setComponents] = useState([])
  const [searchFor, setSearchFor] = useState('')
  const [reports, setReports] = useState([])
  const [searchConducted, setSearchConducted] = useState(false)
  const [centerMapLocation, setCenterMapLocation] = useState({ lat: 0, lng: 0 })
  const [markerLocations, setMarkerLocations] = useState([])

  useEffect(() => {
    const fetchAndSetSearchCandidates = async () => {
      const { products: dbProducts, components: dbComponents } =
        await fetchProductsAndComponents(
          setLoading,
          () => {},
          () => {}
        )

      const candidates = []

      dbProducts.forEach((product) => {
        candidates.push(product.name)
      })

      dbComponents.forEach((payload) => {
        const dbComponentName = payload.component.name
        if (!candidates.some((candidate) => candidate === dbComponentName)) {
          candidates.push(dbComponentName)
        }
      })

      // Sort by string length.
      candidates.sort((a, b) => {
        return a.length - b.length
      })

      setProducts(dbProducts)
      setComponents(dbComponents)
      setSearchCandidates(candidates)
    }

    fetchAndSetSearchCandidates()
  }, [])

  const onMutate = async (e, newValue) => {
    e.preventDefault()
    setSearchFor(newValue)

    const searchForReports = async (productOrComponent) => {
      const productNames = []
      const product = products.find(
        (product) => product.name === productOrComponent
      )

      if (product) {
        productNames.push(product.name)
      } else {
        // This means the search term is a component,
        // not a product. Find all products that contain
        // the component.
        const componentRefs = components
          .filter((payload) => payload.component.name === productOrComponent)
          .map((payload) => payload.componentRef)

        const relevantProductNames = products
          .filter((product) =>
            product.componentRefs.some((componentRef) =>
              componentRefs.some((ref) => ref === componentRef)
            )
          )
          .map((product) => product.name)

        productNames.push(...relevantProductNames)
      }

      setLoading(true)

      // Fetch reports.
      const reportsResult = await fetchReports(productNames)

      setReports(reportsResult)

      if (reportsResult && reportsResult.length > 0) {
        const reportLocations = reportsResult.map(
          (report) => report.sourceGeolocation
        )

        // Update marker locations.
        setMarkerLocations(reportLocations)

        // Calculate center location for map.
        setCenterMapLocation(centerLocation(reportLocations))
      }

      setLoading(false)
    }

    await searchForReports(newValue)
    setSearchConducted(true)
  }

  if (loading) return <Spinner />

  return (
    <div className='scoutPageContainer'>
      <div className='scoutContent'>
        <h1 className='pageHeader'>Bey Scout</h1>
        <p className='lookupLabel'>Product or Part</p>
        <div className='lookupContainer'>
          <Autocomplete
            className='body'
            disablePortal
            options={searchCandidates}
            value={searchFor}
            onChange={onMutate}
            sx={{
              width: 300,
              fontFamily: 'Zain, sans-serif',
              fontWeight: '900',
              color: '#000000',
              backgroundColor: '#ffffff',
              margin: 0,
              boxSizing: 'border-box',
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </div>

        {reports?.length > 0 && (
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

              {reports.map((report, index) => (
                <ReportMarker key={index} report={report} />
              ))}
            </MapContainer>
          </div>
        )}

        {searchConducted && reports?.length === 0 && <p>No results found.</p>}
      </div>
    </div>
  )
}

export default Scout
