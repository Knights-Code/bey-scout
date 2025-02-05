import { useState, useEffect } from 'react'
import { Autocomplete as ProductComplete, TextField } from '@mui/material'
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

const NewReportForm = () => {
  const [loading, setLoading] = useState(false)
  const [searchCandidates, setSearchCandidates] = useState([])
  const [formData, setFormData] = useState({
    productName: '',
    price: 0,
    timestamp: dateToDateTimePickerFormat(new Date()),
  })
  const [locationText, setLocationText] = useState('')
  const [place, setPlace] = useState(null)

  const { productName, price, timestamp } = formData

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

  const onMutate = (e, newValue) => {
    if (e.target.id.startsWith('productName')) {
      setFormData((prevState) => ({
        ...prevState,
        productName: newValue,
      }))
    } else if (e.target.id === 'timestamp') {
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

  if (loading) {
    return <Spinner />
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    // Validate form.
    if (!productName) {
      toast.error('Please select a product')
      return
    }

    if (locationText === '' || !place?.name) {
      toast.error('Please enter a valid location')
      return
    }

    // TODO: Enforce sources being within SA.
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

    if (price <= 0) {
      toast.error('Please enter a valid price')
      return
    }

    setLoading(true)

    try {
      // Get product ref.
      const productRef = await getProduct(productName)

      // Get source ref.
      const sourceRef = await getOrCreateSource(place)

      if (productRef === '' || !sourceRef || sourceRef === '') {
        toast.error('Failed to submit report. Please try again')
      }

      const reportData = {
        priceInCents: price * 100,
        productRef,
        sourceRef,
        reportedAt: firebaseTimestamp(formData.timestamp),
      }

      await addDoc(collection(db, 'reports'), reportData)

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

          <label className='formLabel'>Product</label>
          <ProductComplete
            id='productName'
            className='formInputProductName'
            disablePortal
            options={searchCandidates}
            value={productName}
            onChange={onMutate}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} />}
          />

          <label htmlFor='' className='formLabel'>
            Price
          </label>
          <div className='formPriceDiv'>
            <p className='formPriceText'>$</p>
            <input
              type='number'
              className='formInputSmall'
              id='price'
              value={price}
              onChange={onMutate}
            />
          </div>

          <label className='formLabel'>Location</label>
          <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
            <PlaceAutocomplete
              onPlaceSelect={setPlace}
              onTextChange={onLocationTextChange}
            />
          </APIProvider>

          <button className='primaryButton button submitButton' type='submit'>
            Submit Report
          </button>
        </form>
      </main>
    </div>
  )
}

export default NewReportForm
