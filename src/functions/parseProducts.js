const bitNames = {
  B: 'Ball',
  F: 'Flat',
  N: 'Needle',
  T: 'Taper',
  HN: 'High Needle',
  P: 'Point',
  A: 'Accel',
  DB: 'Disk Ball',
  S: 'Spike',
  LF: 'Low Flat',
  GP: 'Gear Point',
  GN: 'Gear Needle',
  GB: 'Gear Ball',
  HT: 'High Taper',
  O: 'Orb',
  Q: 'Quake',
  R: 'Rush',
  GF: 'Gear Flat',
  C: 'Cyclone',
}

const PARSE_EXPRESSION =
  /(?:and )?(\w+(?:-\w+)?(?: \w+)?)+ ([0-9]+)-([0-9]+)([A-Z]+)/g

const parseProducts = (text) => {
  const lines = text.split(/\r?\n/)

  const parsedProducts = lines.map((line) => {
    const productName = line
    let newProduct = {
      name: productName,
      components: [],
    }
    console.log(`Parsing product '${productName}...'`)

    // And now the actual parsing. 😫
    const matches = [...line.matchAll(PARSE_EXPRESSION)]

    matches.forEach((match) => {
      // Each match is a combo, e.g. Keel Shark 3-60LF.
      // We'll assume for now that the groups will be ordered
      // blade, ratchet count, ratchet height, bit.
      console.log(`Parsing ${match}`)

      let blade = {
        name: '',
        alias: '',
        colour: '',
      }
      let ratchet = {
        name: '',
        alias: '',
        colour: '',
      }
      let bit = {
        name: '',
        alias: '',
        colour: '',
      }

      match.forEach((group, index) => {
        switch (index) {
          case 0:
            // Skip first group because it contains the
            // full string for the match for some stupid reason.
            break

          case 1:
            // Blade name.
            blade.name = group
            break

          case 2:
            // Ratchet count.
            ratchet.name = group
            break

          case 3:
            //Ratchet height.
            ratchet.name += `-${group}`
            break

          case 4:
            // Bit.
            bit.name = bitNames[group]
            bit.alias = group
            break

          default:
            break
        }
      })

      newProduct.components = [...newProduct.components, blade, ratchet, bit]
    })

    return newProduct
  })

  return parsedProducts
}

export default parseProducts
