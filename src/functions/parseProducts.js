const bitNames = {
  A: 'Accel',
  B: 'Ball',
  C: 'Cyclone',
  D: 'Dot',
  E: 'Elevate',
  F: 'Flat',
  H: 'Hexa',
  K: 'Kick',
  N: 'Needle',
  O: 'Orb',
  P: 'Point',
  Q: 'Quake',
  R: 'Rush',
  S: 'Spike',
  T: 'Taper',
  U: 'Unite',
  V: 'Vortex',
  W: 'Wedge',
  DB: 'Disk Ball',
  FB: 'Free Ball',
  GB: 'Gear Ball',
  GF: 'Gear Flat',
  GN: 'Gear Needle',
  GP: 'Gear Point',
  HN: 'High Needle',
  HT: 'High Taper',
  LF: 'Low Flat',
  LO: 'Low Orb',
  MN: 'Metal Needle',
  TP: 'Trans Point',
}

const assistBladeNames = {
  B: 'Bumper',
  R: 'Round',
  S: 'Slash',
  T: 'Turn',
}

const PARSE_EXPRESSION =
  /(?:and )?(\w+(?:-\w+)?(?: \w+)?)+ ([A-Z]*)([0-9]+)-([0-9]+)([A-Z]+)/g

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

      // Not all matches will have an assist blade.
      let assistBlade

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
            // Assist blade.
            if (group) {
              assistBlade = {
                name: assistBladeNames[group],
                alias: group,
                colour: '',
              }
            }

          case 3:
            // Ratchet count.
            ratchet.name = group
            break

          case 4:
            //Ratchet height.
            ratchet.name += `-${group}`
            break

          case 5:
            // Bit.
            bit.name = bitNames[group]
            bit.alias = group
            break

          default:
            break
        }
      })

      if (assistBlade) {
        newProduct.components = [
          ...newProduct.components,
          blade,
          assistBlade,
          ratchet,
          bit,
        ]
      } else {
        newProduct.components = [...newProduct.components, blade, ratchet, bit]
      }
    })

    return newProduct
  })

  return parsedProducts
}

export default parseProducts
