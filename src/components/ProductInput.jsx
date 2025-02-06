import { Autocomplete, TextField } from '@mui/material'

const ProductInput = ({
  listing,
  index,
  searchCandidates,
  formData,
  setFormData,
}) => {
  const { productName, price } = listing
  let productLabel = 'Product'
  let priceLabel = 'Price'

  if (index > 0) {
    const productNumber = index + 1
    productLabel = `Product ${productNumber}`
    priceLabel = `Price for ${productLabel}`
  }

  const onChange = (e, newValue) => {
    let data = { ...formData }

    if (e.target.id.startsWith('productName')) {
      data.listings[index].productName = newValue
    }

    if (e.target.id === 'price') {
      data.listings[index].price = e.target.value
    }

    setFormData(data)
  }

  return (
    <>
      <label className='formLabel'>{productLabel}</label>
      <Autocomplete
        id='productName'
        className='formInputProductName'
        disablePortal
        options={searchCandidates}
        value={productName}
        onChange={onChange}
        sx={{
          width: 300,
          fontFamily: 'Zain, sans-serif',
          fontWeight: '900',
          color: '#000000',
          backgroundColor: '#ffffff',
          margin: 0,
          boxSizing: 'border-box',
        }}
        renderInput={(params) => <TextField {...params} />}
      />

      <label className='formLabel'>{priceLabel}</label>
      <div className='formPriceDiv'>
        <p className='formPriceText'>$</p>
        <input
          type='number'
          className='formInputSmall'
          id='price'
          value={price}
          onChange={onChange}
        />
      </div>
    </>
  )
}

export default ProductInput
