import {
  collection,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  getDoc,
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'

const fetchReports = async (productNames) => {
  try {
    // Get references for product names.
    const productData = await Promise.all(
      productNames.map(async (name) => {
        const q = query(collection(db, 'products'), where('name', '==', name))
        const productsSnapshot = await getDocs(q)

        if (!productsSnapshot.empty) {
          const doc = productsSnapshot.docs[0]
          return {
            productRef: doc.id,
            productName: doc.data().name,
          }
        }
      })
    )

    // Get all reports for each product.
    const reports = await Promise.all(
      productData.map(async (productDatum) => {
        const q = query(
          collection(db, 'reports'),
          where('productRef', '==', productDatum.productRef),
          orderBy('reportedAt', 'desc')
        )

        const reportsSnapshot = await getDocs(q)

        return {
          productName: productDatum.productName,
          reportSnapshots: reportsSnapshot.docs,
        }
      })
    )

    const results = []
    await Promise.all(
      reports.map(async (reportResult) => {
        const { productName, reportSnapshots } = reportResult

        for (const index in reportSnapshots) {
          const report = reportSnapshots[index]
          const { sourceRef, priceInCents, reportedAt } = report.data()

          const existingSourceResult = results.find(
            (result) => result.sourceRef === sourceRef
          )

          const listing = {
            priceInCents,
            reportedAt,
            productName,
          }

          if (existingSourceResult) {
            // Check if we have a listing for this product-source combo already.
            // As they're ordered most recent to least recent, we may already have
            // the only report we care about.
            const existingListing = existingSourceResult.listings.find(
              (listing) => listing.productName === productName
            )

            // Update existing.
            if (!existingListing) {
              existingSourceResult.listings.push(listing)
            }
          } else {
            // Instead of hydrating, just store sourceRef to hydrate later.
            results.push({
              sourceRef,
              sourceName: '',
              sourceGeolocation: {},
              listings: [listing],
            })
          }
        }
      })
    )

    await Promise.all(
      results.map(async (result) => {
        // Hydrate source and add it to results.
        const { sourceRef } = result

        const sourceDoc = await getDoc(doc(db, 'sources', sourceRef))
        const { name, geolocation } = sourceDoc.data()

        result.sourceName = name
        result.sourceGeolocation = geolocation
      })
    )

    return results
  } catch (error) {
    toast.error('Unable to fetch reports')
    console.log(error)
  }
}

export default fetchReports
