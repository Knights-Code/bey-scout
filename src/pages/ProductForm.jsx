import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Box,
  ChakraProvider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  IconButton,
  Input,
} from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
import NewProduct from '../components/NewProduct'

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

  const addAnotherProduct = () => {
    const emptyProduct = { ...newProduct }

    setNewProducts([...newProducts, emptyProduct])
    /* const addedProduct = { ...newProduct }
    setFormData((prevState) => ({
      ...prevState,
      products: [...formData.products, addedProduct],
    })) */
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
        if (value === '') {
          errors.colour = 'Component colour cannot be blank'
        }
        break

      default:
        break
    }

    return errors
  }

  return (
    <ChakraProvider>
      <Box p={4}>
        <Heading>New Product Form</Heading>
        <form>
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
        </form>
      </Box>
    </ChakraProvider>
  )
}

export default ProductForm
