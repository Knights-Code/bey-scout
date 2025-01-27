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
          lat: -34.914705,
          lng: 138.565836,
        },
      },
      timestamp: '27 January 2025 at 14:33:53 UTC+10:30',
    },
  ]
}

export default fetchReports
