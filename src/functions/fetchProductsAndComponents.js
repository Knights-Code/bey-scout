import { collection, getDocs } from 'firebase/firestore'
import { toast } from 'react-toastify'
import { db } from '../firebase.config'

const fetchProductsAndComponents = async (
  setLoading,
  setProducts,
  setComponents
) => {
  setLoading(true)

  const dbProducts = []
  const dbComponents = []

  try {
    // Get existing products and save them to state.
    await getDocs(collection(db, 'products')).then((snapshot) =>
      snapshot.forEach((doc) => {
        return dbProducts.push(doc.data())
      })
    )

    // Get existing components and save them to state.
    await getDocs(collection(db, 'components')).then((snapshot) =>
      snapshot.forEach((doc) => {
        // We need references for existing components
        // in case of new products that use them.
        return dbComponents.push({
          componentRef: doc.id,
          component: doc.data(),
        })
      })
    )
  } catch (error) {
    toast.error('Unable to retrieve products and components from DB.')
    console.log(error)
  }

  setLoading(false)

  setProducts(dbProducts)
  setComponents(dbComponents)

  return {
    products: dbProducts,
    components: dbComponents,
  }
}

export default fetchProductsAndComponents
