import { collection, getDocs, where, query } from 'firebase/firestore'
import { db } from '../firebase.config'

const getSource = async (sourceName) => {
  const q = query(collection(db, 'sources'), where('name', '==', sourceName))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    return null
  }

  // Source exists, return reference.
  const ref = querySnapshot.docs[0].id
  return ref
}

export default getSource
