import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../firebase.config'

const getProductByReference = async (reference) => {
  const docSnapshot = await getDoc(doc(db, 'products', reference))

  if (!docSnapshot.empty) {
    return docSnapshot.data()
  }

  return null
}

export default getProductByReference
