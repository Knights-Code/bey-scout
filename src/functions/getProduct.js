import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase.config'

const getProduct = async (productName) => {
  const q = query(collection(db, 'products'), where('name', '==', productName))

  const querySnapshot = await getDocs(q)

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id
  }

  return ''
}

export default getProduct
