import { useState, useEffect } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import { toast } from 'react-toastify'
import fetchProducts from '../functions/fetchProducts'
import Spinner from '../components/Spinner'
import dateToDateTimePickerFormat from '../utilities/dateToDateTimePickerFormat'
import PlaceAutocomplete from '../components/PlaceAutocomplete'
import getOrCreateSource from '../functions/getOrCreateSource'
import getProduct from '../functions/getProduct'
import firebaseTimestamp from '../utilities/firebaseTimestamp'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../firebase.config'
import { LatLng, LatLngBounds } from 'leaflet'
import ProductInput from '../components/ProductInput'

const NewReportForm = () => {
  const [loading, setLoading] = useState(false)
  const [searchCandidates, setSearchCandidates] = useState([])
  const [formData, setFormData] = useState({
    listings: [{ productName: '', price: 0 }],
    timestamp: dateToDateTimePickerFormat(new Date()),
  })
  const [locationText, setLocationText] = useState('')
  const [place, setPlace] = useState(null)

  const { listings, timestamp } = formData

  useEffect(() => {
    const fetchAndSetSearchCandidates = async () => {
      const products = await fetchProducts(setLoading)
      const candidates = []

      products.forEach((productName) => {
        candidates.push(productName)
      })

      setSearchCandidates(candidates)
    }

    fetchAndSetSearchCandidates()
  }, [])

  const onMutate = (e) => {
    if (e.target.id === 'timestamp') {
      setFormData((prevState) => ({
        ...prevState,
        timestamp: dateToDateTimePickerFormat(new Date(e.target.value)),
      }))
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: e.target.value,
      }))
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    // Validate form.
    if (listings.some((listing) => !listing.productName)) {
      toast.error('Please select a product')
      return
    }

    if (listings.some((listing) => listing.price <= 0)) {
      toast.error('Please enter a valid price')
      return
    }

    if (locationText === '' || !place?.name) {
      toast.error('Please enter a valid location')
      return
    }

    const southWest = new LatLng(-37.82025109430261, 128.89262007972326)
    const northEast = new LatLng(-25.993094462179293, 140.99459280784657)
    const placeCoordinates = new LatLng(
      place.geometry.location.lat(),
      place.geometry.location.lng()
    )
    const southAustraliaBounds = new LatLngBounds(southWest, northEast)

    if (!southAustraliaBounds.contains(placeCoordinates)) {
      toast.error(
        'Locations outside South Australia are not being accepted at this time. Thank you for your understanding. 🙏'
      )
      return
    }

    setLoading(true)

    try {
      // Get source ref.
      const sourceRef = await getOrCreateSource(place)

      const reports = []
      await Promise.all(
        listings.map(async (listing) => {
          // Get product ref.
          const productRef = await getProduct(listing.productName)

          reports.push({
            productRef,
            sourceRef,
            reportedAt: firebaseTimestamp(formData.timestamp),
            priceInCents: listing.price * 100,
          })
        })
      )

      if (
        listings.some((listing) => listing.productRef === '') ||
        !sourceRef ||
        sourceRef === ''
      ) {
        toast.error('Failed to submit report. Please try again')
        return
      }

      await Promise.all(
        reports.map(async (reportData) => {
          await addDoc(collection(db, 'reports'), reportData)
        })
      )

      setLoading(false)
      toast.success('Report successfully submitted')
    } catch (error) {
      setLoading(false)
      toast.error('Unable to submit report')
      console.log(error)
    }
  }

  const onLocationTextChange = (e) => {
    setLocationText(e.target.value)
    setPlace(null)
  }

  const onProductDelete = (index) => {
    let data = { ...formData }
    data.listings.splice(index, 1)
    setFormData(data)
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className='pageContainer'>
      <header>
        <h1 className='pageHeader'>Make a Report</h1>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label className='formLabel'>Date and Time</label>
          <input
            id='timestamp'
            type='datetime-local'
            className='formInput'
            value={timestamp}
            onChange={onMutate}
            required
          />

          <label className='formLabel'>Location</label>
          <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
            <PlaceAutocomplete
              onPlaceSelect={setPlace}
              onTextChange={onLocationTextChange}
            />
          </APIProvider>

          <hr />

          {listings.map((listing, index) => (
            <ProductInput
              key={index}
              index={index}
              listing={listing}
              searchCandidates={searchCandidates}
              formData={formData}
              setFormData={setFormData}
              onDelete={onProductDelete}
            />
          ))}

          <button
            className='button addProductButton'
            type='button'
            onClick={() =>
              setFormData((prevState) => {
                let data = { ...prevState }
                data.listings = [...listings, { productName: '', price: 0 }]
                return data
              })
            }
          >
            Add Product
          </button>

          <button className='primaryButton button submitButton' type='submit'>
            Submit
          </button>
        </form>
      </main>
    </div>
  )
}

export default NewReportForm
