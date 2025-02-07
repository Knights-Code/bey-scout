import { addDoc, collection } from 'firebase/firestore'
import { db } from '../firebase.config'
import getSource from './getSource'

const getOrCreateSource = async (place) => {
  const { name } = place

  const existingSource = await getSource(name)

  if (existingSource) {
    return existingSource
  }

  // Source does not exist yet. Add to DB, and
  // return reference.
  const lat = place.geometry.location.lat()
  const lng = place.geometry.location.lng()

  const newSource = {
    name,
    location: place.formatted_address,
    geolocation: {
      lat,
      lng,
    },
  }

  const docRef = await addDoc(collection(db, 'sources'), newSource)

  return docRef.id
}

export default getOrCreateSource
