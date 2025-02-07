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
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { LatLng, LatLngBounds } from 'leaflet'
import ProductInput from '../components/ProductInput'
import countDaysBetween from '../utilities/countDaysBetween'
import moneyFormat from '../utilities/moneyFormat'
import getSource from '../functions/getSource'
import getProductByReference from '../functions/getProductByReference'
import { Alert } from '@mui/material'

const NewReportForm = () => {
  const [loading, setLoading] = useState(false)
  const [searchCandidates, setSearchCandidates] = useState([])
  const [formData, setFormData] = useState({
    listings: [{ productName: '', price: 0 }],
    timestamp: dateToDateTimePickerFormat(new Date()),
  })
  const [locationText, setLocationText] = useState('')
  const [place, setPlace] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [relevantAlerts, setRelevantAlerts] = useState([])

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

  // Warn user when report for selected location exists for the day already.
  useEffect(() => {
    const checkForReports = async () => {
      if (!place) {
        setAlerts([])
        return
      }

      try {
        const reportSourceRef = await getSource(place.name)

        if (!reportSourceRef) {
          // This place doesn't exist in DB, which means
          // it has never been reported before.
          setAlerts([])
          return
        }

        const reportsForSourceQuery = query(
          collection(db, 'reports'),
          where('sourceRef', '==', reportSourceRef),
          orderBy('reportedAt', 'desc')
        )
        const querySnapshot = await getDocs(reportsForSourceQuery)

        if (querySnapshot.empty) {
          // No reports for this source at all. Unlikely,
          // but we'll check anyway.
          setAlerts([])
          return
        }

        const reportsForSameDay = querySnapshot.docs.filter((reportDoc) => {
          const { reportedAt } = reportDoc.data()
          const currentReportDate = new Date(timestamp)

          const reportDate = new Date(reportedAt.seconds * 1000)
          const daysBetween = countDaysBetween(currentReportDate, reportDate)

          return daysBetween === 0
        })

        if (reportsForSameDay.length === 0) {
          setAlerts([])
          return
        }

        const reportAlerts = await Promise.all(
          reportsForSameDay.map(async (report) => {
            const { productRef, priceInCents } = report.data()
            const product = await getProductByReference(productRef)

            return { product: product.name, priceInCents: priceInCents }
          })
        )

        toast.warn(
          'Products have already been reported for this location for the selected date'
        )
        setAlerts(reportAlerts)
      } catch (error) {
        console.log(error)
      }
    }

    checkForReports()
  }, [timestamp, place])

  // Show alerts pertinent to product information user is reporting.
  useEffect(() => {
    const newRelevantAlerts = alerts.filter((alert) =>
      listings.some(
        (listing) =>
          listing.productName === alert.product &&
          listing.price == alert.priceInCents / 100
      )
    )

    setRelevantAlerts(newRelevantAlerts)
  }, [alerts, formData])

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

    if (relevantAlerts.length > 0) {
      // User trying to submit duplicate reports.
      return
    }

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

          {relevantAlerts.map((alert, index) => (
            <Alert sx={{ marginTop: '1rem' }} severity='error' key={index}>
              {alert.product} already reported at {place.name} on selected date
              for {moneyFormat(alert.priceInCents)}.
            </Alert>
          ))}

          <button
            className='primaryButton button submitButton'
            type='submit'
            disabled={relevantAlerts.length > 0}
          >
            Submit
          </button>
        </form>
      </main>
    </div>
  )
}

export default NewReportForm
