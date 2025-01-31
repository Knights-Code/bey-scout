import { useState, useEffect } from 'react'
import {
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
} from '@chakra-ui/react'

const NewComponent = ({
  productIndex,
  component,
  newProducts,
  setNewProducts,
  index,
  isInvalid,
  setComponentErrors,
}) => {
  const [useExistingComponent, setUseExistingComponent] = useState(false)

  const { name, alias, colour } = component
  const { name: nameError } = isInvalid({
    field: 'COMPONENT_NAME',
    value: name,
  })
  const { alias: aliasError } = isInvalid({
    field: 'COMPONENT_ALIAS',
    value: alias,
  })
  const { colour: colourError } = isInvalid({
    field: 'COMPONENT_COLOUR',
    value: { component: component, useExistingComponent: useExistingComponent },
  })

  useEffect(() => {
    setComponentErrors((prevState) => ({
      ...prevState,
      [index]: nameError || aliasError || colourError,
    }))
  }, [nameError, aliasError, colourError, index])

  const handleInputChange = (e) => {
    let data = [...newProducts]

    data[productIndex].components[index][e.target.id] = e.target.value

    setNewProducts(data)
  }

  return (
    <>
      <Heading as='h3' size='md' mt={4}>{`Component ${index + 1}`}</Heading>
      <Checkbox
        isChecked={useExistingComponent}
        onChange={(e) => setUseExistingComponent((prevState) => !prevState)}
        mt={4}
      >
        Use existing component
      </Checkbox>
      <HStack>
        <FormControl mt={4} isInvalid={nameError} isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            id='name'
            type='text'
            placeholder='Component name'
            value={name}
            onChange={handleInputChange}
          />
          <FormErrorMessage>{nameError}</FormErrorMessage>
        </FormControl>

        <FormControl mt={4} isInvalid={aliasError}>
          <FormLabel>Alias</FormLabel>
          <Input
            id='alias'
            type='text'
            placeholder='Component alias'
            value={alias}
            onChange={handleInputChange}
          />
          <FormErrorMessage>{aliasError}</FormErrorMessage>
        </FormControl>

        <FormControl mt={4} isInvalid={colourError}>
          <FormLabel>Colour</FormLabel>
          <Input
            id='colour'
            type='text'
            placeholder='Component colour'
            value={colour}
            onChange={handleInputChange}
          />
          <FormErrorMessage>{colourError}</FormErrorMessage>
        </FormControl>
      </HStack>
    </>
  )
}

export default NewComponent
