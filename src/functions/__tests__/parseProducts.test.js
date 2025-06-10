import parseProducts from '../parseProducts'

describe('parseProducts', () => {
  it('parses single simple product line', () => {
    const productText = 'Buster Dran 5-70DB'

    const results = parseProducts(productText)

    expect(results.length).toBe(1)

    const product = results[0]
    expect(product.name).toBe(productText)

    const components = product.components
    expect(components.length).toBe(3)

    const blade = components[0]
    expect(blade.name).toBe('Buster Dran')

    const ratchet = components[1]
    expect(ratchet.name).toBe('5-70')

    const bit = components[2]
    expect(bit.name).toBe('Disk Ball')
    expect(bit.alias).toBe('DB')
  })

  it('parses multiple products', () => {
    const productText = 'Buster Dran 5-70DB\r\nArrow Wizard 4-80B'

    const results = parseProducts(productText)

    expect(results.length).toBe(2)

    const firstProduct = results[0]
    expect(firstProduct.name).toBe('Buster Dran 5-70DB')

    const firstProductComponents = firstProduct.components
    expect(firstProductComponents.length).toBe(3)

    const firstProductBlade = firstProductComponents[0]
    expect(firstProductBlade.name).toBe('Buster Dran')

    const firstProductRatchet = firstProductComponents[1]
    expect(firstProductRatchet.name).toBe('5-70')

    const firstProductBit = firstProductComponents[2]
    expect(firstProductBit.name).toBe('Disk Ball')
    expect(firstProductBit.alias).toBe('DB')

    const secondProduct = results[1]
    expect(secondProduct.name).toBe('Arrow Wizard 4-80B')

    const secondProductComponents = secondProduct.components
    expect(secondProductComponents.length).toBe(3)

    const secondProductBlade = secondProductComponents[0]
    expect(secondProductBlade.name).toBe('Arrow Wizard')

    const secondProductRatchet = secondProductComponents[1]
    expect(secondProductRatchet.name).toBe('4-80')

    const secondProductBit = secondProductComponents[2]
    expect(secondProductBit.name).toBe('Ball')
    expect(secondProductBit.alias).toBe('B')
  })

  it('parses products with multiple Beyblade combos', () => {
    const productText = 'Beat Tyranno 4-70Q and Knife Shinobi 4-80HN Dual Pack'

    const results = parseProducts(productText)
    expect(results.length).toBe(1)

    const product = results[0]
    expect(product.name).toBe(productText)
    expect(product.components.length).toBe(6)

    expect(product.components[0].name).toBe('Beat Tyranno')
    expect(product.components[1].name).toBe('4-70')
    expect(product.components[2].name).toBe('Quake')
    expect(product.components[2].alias).toBe('Q')

    expect(product.components[3].name).toBe('Knife Shinobi')
    expect(product.components[4].name).toBe('4-80')
    expect(product.components[5].name).toBe('High Needle')
    expect(product.components[5].alias).toBe('HN')
  })

  it('parses custom line products', () => {
    const productText = 'Dark Perseus B6-80W'

    const results = parseProducts(productText)

    expect(results.length).toBe(1)

    const product = results[0]
    expect(product.name).toBe(productText)

    const components = product.components
    expect(components.length).toBe(4)

    const blade = components[0]
    expect(blade.name).toBe('Dark Perseus')

    const assistBlade = components[1]
    expect(assistBlade.name).toBe('Bumper')
    expect(assistBlade.alias).toBe('B')

    const ratchet = components[2]
    expect(ratchet.name).toBe('6-80')

    const bit = components[3]
    expect(bit.name).toBe('Wedge')
    expect(bit.alias).toBe('W')
  })
})
