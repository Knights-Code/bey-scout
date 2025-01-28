const fetchReports = async (productOrComponent) => {
  // TODO: Query reports collection in Firebase.
  return [
    {
      id: 'blag',
      priceInCents: 2500,
      product: {
        name: 'Arrow Wizard 4-80B Starter Pack',
      },
      source: {
        name: 'Big W Brickworks',
        geolocation: {
          lat: -34.913561035265566,
          lng: 138.56436750560871,
        },
      },
      timestamp: '27 January 2025 at 14:33:53 UTC+10:30',
    },
    {
      id: 'bleg',
      priceInCents: 1900,
      product: {
        name: 'Arrow Wizard 4-80B Starter Pack',
      },
      source: {
        name: 'Target Sefton Park',
        geolocation: {
          lat: -34.87685841243745,
          lng: 138.6030919225819,
        },
      },
      timestamp: '21 January 2025 at 14:33:53 UTC+10:30',
    },
  ]
}

export default fetchReports
