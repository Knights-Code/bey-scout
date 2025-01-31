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
import { collection, getDocs } from 'firebase/firestore'
import NewProduct from '../components/NewProduct'
import parseProducts from '../functions/parseProducts'
import componentInvalid from '../utilities/componentInvalid'
import Spinner from '../components/Spinner'
import { db } from '../firebase.config'
import productNameExists from '../utilities/productNameExists'

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
    const fetchProductsAndComponents = async () => {
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
            return dbComponents.push(doc.data())
          })
        )

        setExistingProducts(dbProducts)
        setExistingComponents(dbComponents)
      } catch (error) {
        toast.error('Unable to retrieve products and components from DB.')
        console.log(error)
      }

      setLoading(false)
    }

    fetchProductsAndComponents()
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

  const onSubmit = (e) => {
    e.preventDefault()

    // Form-scope validation.
    if (newProducts.some((newProduct) => newProduct.components.length === 0)) {
      toast.error(`One or more products have no components`)
      return
    }

    for (const productIndex in productErrors) {
      if (productErrors[productIndex]) {
        // A product field is invalid.
        toast.error('One or more products have errors')
        return
      }
    }

    for (const componentIndex in componentErrors) {
      if (componentErrors[componentIndex]) {
        // A component field is invalid.
        toast.error('One or more components have errors')
        return
      }
    }
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
