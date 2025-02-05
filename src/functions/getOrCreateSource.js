import { addDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase.config'

const getOrCreateSource = async (place) => {
  const { name } = place

  const q = query(collection(db, 'sources'), where('name', '==', name))
  const querySnapshot = await getDocs(q)

  if (!querySnapshot.empty) {
    // Source exists, return reference.
    const ref = querySnapshot.docs[0].id
    return ref
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
