const componentInvalid = (
  component,
  useExistingComponent,
  newProducts,
  existingComponents
) => {
  // If user specified this is supposed to be the same
  // component as another one, we can ignore validation.
  if (useExistingComponent) {
    return false
  }

  // Check if component exists already.
  let matchCount = 0
  newProducts.forEach((product) => {
    product.components.forEach((c) => {
      if (c.name === component.name && c.colour === component.colour) {
        matchCount++
      }
    })
  })

  existingComponents.forEach((c) => {
    if (c.name === component.name && c.colour === component.colour) {
      matchCount++
    }
  })

  if (matchCount > 1) {
    // The components collection will always include the
    // component we're validating, so there needs to be more
    // than one match to indicate duplicates.
    return true
  }

  return false
}

export default componentInvalid
