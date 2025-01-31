const productNameExists = (existingProducts, productName) => {
  if (!existingProducts || existingProducts.length === 0) {
    return false
  }

  return existingProducts.some(
    (existingProduct) => existingProduct.name === productName
  )
}

export default productNameExists
