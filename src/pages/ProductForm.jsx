import { useState, useEffect } from 'react'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  ChakraProvider,
  Heading,
  IconButton,
  Textarea,
} from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
import { toast } from 'react-toastify'
import { addDoc, collection, getDocs } from 'firebase/firestore'
import NewProduct from '../components/NewProduct'
import parseProducts from '../functions/parseProducts'
import componentInvalid from '../utilities/componentInvalid'
import Spinner from '../components/Spinner'
import { db } from '../firebase.config'
import productNameExists from '../utilities/productNameExists'
import fetchProductsAndComponents from '../functions/fetchProductsAndComponents'

const ProductForm = () => {
  // TODO: Fetch existing products to avoid dupes.
  const newComponent = {
    name: '',
    alias: '',
    colour: '',
  }
  const newProduct = {
    name: '',
    components: [newComponent],
  }
  const [newProducts, setNewProducts] = useState([newProduct])
  const [textToParse, setTextToParse] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingProducts, setExistingProducts] = useState([])
  const [existingComponents, setExistingComponents] = useState([])
  const [productErrors, setProductErrors] = useState({})
  const [componentErrors, setComponentErrors] = useState({})

  useEffect(() => {
    fetchProductsAndComponents(
      setLoading,
      setExistingProducts,
      setExistingComponents
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return <Spinner />
  }

  const textToParseChanged = (e) => {
    setTextToParse(e.target.value)
  }

  const parseProductsFromText = () => {
    const parsedProducts = parseProducts(textToParse)
    console.log(parsedProducts)
    setNewProducts(parsedProducts)
  }

  const addAnotherProduct = () => {
    const emptyProduct = { ...newProduct }

    setNewProducts([...newProducts, emptyProduct])
  }

  const isInvalid = ({ field, value }) => {
    const errors = {
      name: undefined,
      alias: undefined,
      colour: undefined,
    }

    switch (field) {
      case 'PRODUCT_NAME':
        if (value === '') {
          errors.name = 'Product name cannot be blank'
        } else if (productNameExists(existingProducts, value)) {
          errors.name =
            'A product with this name already exists in the database'
        }
        break

      case 'COMPONENT_NAME':
        if (value === '') {
          errors.name = 'Component name cannot be blank'
        }
        // TODO: Component duplicate logic
        break

      case 'COMPONENT_ALIAS':
        break

      case 'COMPONENT_COLOUR':
        const { component, useExistingComponent } = value
        if (
          componentInvalid(
            component,
            useExistingComponent,
            newProducts,
            existingComponents
          )
        ) {
          errors.colour = 'Duplicate components require a unique colour'
        }

        break

      default:
        break
    }

    return errors
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    let errorOccurred = false
    setLoading(true)

    // Form-scope validation.
    if (newProducts.some((newProduct) => newProduct.components.length === 0)) {
      setLoading(false)
      toast.error(`One or more products have no components`)
      return
    }

    for (const productIndex in productErrors) {
      if (productErrors[productIndex]) {
        // A product field is invalid.
        setLoading(false)
        toast.error('One or more products have errors')
        return
      }
    }

    for (const componentIndex in componentErrors) {
      if (componentErrors[componentIndex]) {
        // A component field is invalid.
        setLoading(false)
        toast.error('One or more components have errors')
        return
      }
    }

    // Add to DB.
    // Create unique components, first.
    const formComponents = newProducts.flatMap((newProduct) => {
      return [...newProduct.components]
    })

    const allComponents = formComponents.concat(
      existingComponents.map((existingComponent) => {
        const { component: componentData, componentRef } = existingComponent
        return {
          name: componentData.name,
          alias: componentData.alias,
          colour: componentData.colour,
          componentRef: componentRef,
        }
      })
    )

    const uniqueComponents = []

    allComponents
      .filter((component) => component.componentRef)
      .forEach((componentWithRef) => {
        // Existing components always get a spot.
        uniqueComponents.push(componentWithRef)
      })

    allComponents.forEach((c) => {
      if (
        !uniqueComponents.some(
          (uc) => uc.name === c.name && uc.colour === c.colour
        )
      ) {
        return uniqueComponents.push(c)
      }
    })

    // Function that stores component in DB and returns
    // document reference for it as well as the component
    // itself.
    const storeComponent = async (component) => {
      const newComponentData = {
        name: component.name,
        alias: component.alias,
        colour: component.colour,
        imageUrl: '',
      }
      try {
        const docRef = await addDoc(
          collection(db, 'components'),
          newComponentData
        )
        return {
          componentRef: docRef.id,
          component: component,
        }
      } catch (error) {
        setLoading(false)
        toast.error('Failed to store component')
        console.log(error)
        errorOccurred = true
        return
      }
    }

    // New components are components that don't have a
    // component reference from the DB yet.
    const newComponents = uniqueComponents.filter(
      (component) => !component.componentRef
    )

    const storedComponents = await Promise.all(
      [...newComponents].map(storeComponent)
    ).catch((error) => {
      setLoading(false)
      toast.error('Failed to store component')
      console.log(error)
      return
    })

    if (errorOccurred) {
      return
    }

    // Create a collection with both newly-stored and
    // already-stored components with their references.
    const allStoredComponents = storedComponents.concat(
      [...existingComponents].map((existingComponent) => {
        return {
          componentRef: existingComponent.componentRef,
          component: existingComponent.component,
        }
      })
    )

    // Deep breath... now let's create new product data.
    await Promise.all(
      newProducts.map(async (newProduct) => {
        const newProductData = {
          name: newProduct.name,
          componentRefs: [],
        }

        // Find component references in stored components.
        newProductData.componentRefs = newProduct.components.map(
          (newProductComponent) => {
            const storedComponent = allStoredComponents
              .filter(
                (storedComponent) => typeof storedComponent !== 'undefined'
              )
              .find(
                (storedComponent) =>
                  storedComponent.component.name === newProductComponent.name &&
                  storedComponent.component.colour ===
                    newProductComponent.colour
              )

            if (!storedComponent) {
              setLoading(false)
              toast.error('Could not match component for product in DB')
              errorOccurred = true
              return
            }

            return storedComponent.componentRef
          }
        )

        // At this point we should (SHOULD) have an object with
        // product name and component references. 🤞
        try {
          await addDoc(collection(db, 'products'), newProductData)
        } catch (error) {
          setLoading(false)
          toast.error('Unable to store product')
          errorOccurred = true
          return
        }
      })
    )

    if (errorOccurred) {
      return
    }

    setLoading(false)
    toast.success('New product(s) successfully added to DB')
  }

  return (
    <ChakraProvider>
      <Box p={4}>
        <Heading>New Product Form</Heading>
        <Accordion allowToggle mt={4}>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box as='span' flex='1' textAlign='left'>
                  Parse from text
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Textarea
                placeholder='Enter product titles (one per line)'
                value={textToParse}
                onChange={textToParseChanged}
              />
              <Button onClick={parseProductsFromText} mt={3}>
                Parse
              </Button>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
        <form onSubmit={onSubmit}>
          {newProducts.map((product, index) => (
            <NewProduct
              key={index}
              index={index}
              product={product}
              newProducts={newProducts}
              setNewProducts={setNewProducts}
              isInvalid={isInvalid}
              setProductErrors={setProductErrors}
              setComponentErrors={setComponentErrors}
            />
          ))}
          <IconButton onClick={addAnotherProduct} icon={<AddIcon />} mt={3} />
          <Button mt={4} sx={{ width: '100%' }} type='submit'>
            Submit
          </Button>
        </form>
      </Box>
    </ChakraProvider>
  )
}

export default ProductForm
