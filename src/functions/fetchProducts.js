import { collection, getDocs } from 'firebase/firestore'
import { toast } from 'react-toastify'
import { db } from '../firebase.config'

const fetchProducts = async (setLoading) => {
  setLoading(true)

  const dbProducts = []

  try {
    // Get products.
    await getDocs(collection(db, 'products')).then((snapshot) =>
      snapshot.forEach((doc) => {
        const { name } = doc.data()
        return dbProducts.push(name)
      })
    )
  } catch (error) {
    toast.error('Unable to retrieve products from DB.')
    console.log(error)
  }

  setLoading(false)

  return dbProducts
}

export default fetchProducts
