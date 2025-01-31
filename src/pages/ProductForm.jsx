import { useState } from 'react'
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
import NewProduct from '../components/NewProduct'
import parseProducts from '../functions/parseProducts'
import { toast } from 'react-toastify'
import componentInvalid from '../utilities/componentInvalid'

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

          // TODO: Proper duplicate check
        } else if (value === 'Arrow Wizard 4-80B Starter Pack') {
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
        if (componentInvalid(component, useExistingComponent, newProducts)) {
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
    newProducts.forEach((newProduct, index) => {
      if (newProduct.components.length === 0) {
        toast.error(`Product ${index + 1} has no components`)
        return
      }
    })

    console.log(newProducts)
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
