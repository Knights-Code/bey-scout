import { useEffect } from 'react'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  IconButton,
  Input,
} from '@chakra-ui/react'
import NewComponent from './NewComponent'
import { AddIcon } from '@chakra-ui/icons'

const NewProduct = ({
  product,
  newProducts,
  setNewProducts,
  index: productIndex,
  isInvalid,
  setProductErrors,
  setComponentErrors,
}) => {
  const { name, components } = product
  const { name: nameError } = isInvalid({
    field: 'PRODUCT_NAME',
    value: name,
    productIndex,
  })

  useEffect(() => {
    setProductErrors((prevState) => ({
      ...prevState,
      [productIndex]: nameError,
    }))
  }, [nameError, productIndex])

  const handleInputChange = (e) => {
    let data = [...newProducts]

    data[productIndex][e.target.id] = e.target.value

    setNewProducts(data)
  }

  const addAnotherComponent = () => {
    const addedComponent = {
      name: '',
      alias: '',
      colour: '',
    }

    let data = [...newProducts]

    let productData = data[productIndex]

    productData.components = [...productData.components, addedComponent]

    setNewProducts(data)
  }

  return (
    <>
      <Heading as='h2' size='lg' mt={4}>{`Product ${
        productIndex + 1
      }`}</Heading>
      <FormControl mt={4} isInvalid={nameError} isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          id='name'
          type='text'
          placeholder='Product name'
          value={name}
          onChange={handleInputChange}
        />
        <FormErrorMessage>{nameError}</FormErrorMessage>
      </FormControl>

      {components.length === 0 && (
        <Alert status='error' mt={4}>
          <AlertIcon />
          <AlertDescription>
            Products must contain at least one component.
          </AlertDescription>
        </Alert>
      )}
      <Accordion allowToggle mt={4}>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as='span' flex='1' textAlign='left'>
                Components
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            {components.map((component, index) => (
              <NewComponent
                key={index}
                productIndex={productIndex}
                component={component}
                newProducts={newProducts}
                setNewProducts={setNewProducts}
                index={index}
                isInvalid={isInvalid}
                setComponentErrors={setComponentErrors}
              />
            ))}
            <IconButton
              onClick={addAnotherComponent}
              icon={<AddIcon />}
              mt={3}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  )
}

export default NewProduct
