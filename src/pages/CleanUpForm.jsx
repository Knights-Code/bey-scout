import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore'
import { toast } from 'react-toastify'
import { db } from '../firebase.config'
import fetchProductsAndComponents from '../functions/fetchProductsAndComponents'
import Spinner from '../components/Spinner'

const CleanUpForm = () => {
  const [components, setComponents] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const setLooseComponents = async () => {
      // Get all products and components references.
      const { products: dbProducts, components: dbComponents } =
        await fetchProductsAndComponents(
          setLoading,
          () => {},
          () => {}
        )

      // Iterate over all products and their component
      // references, removing them from the collection of
      // all component references.
      const looseComponents = dbComponents.filter(
        (dbComponent) =>
          !dbProducts.some((product) =>
            product.componentRefs.some(
              (componentRef) => componentRef === dbComponent.componentRef
            )
          )
      )

      console.log(looseComponents)
      setComponents(looseComponents)
    }

    setLooseComponents()
  }, [])

  const deleteLooseComponents = async () => {
    setLoading(true)
    const componentsToDelete = components.length

    try {
      await Promise.all(
        components.map(async (component) => {
          await deleteDoc(doc(db, 'components', component.componentRef))
        })
      )
    } catch (error) {
      setLoading(false)
      toast.error('Unable to delete component')
      console.log(error)
      return
    }

    toast.success(`Successfully deleted ${componentsToDelete} components`)
    setLoading(false)
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div>
      <main>
        <h1>Clean-Up Form</h1>
        <button
          disabled={!components || components.length === 0}
          onClick={deleteLooseComponents}
        >
          Delete Loose Components
        </button>
        <ul>
          {components &&
            components.length > 0 &&
            components.map((component) => (
              <li key={component.componentRef}>
                <h3>Reference</h3>
                <p>{component.componentRef}</p>
                <h3>Name</h3>
                <p>{component.component.name}</p>
                <h3>Colour</h3>
                <p>{component.component.colour}</p>
              </li>
            ))}
        </ul>
      </main>
    </div>
  )
}

export default CleanUpForm
