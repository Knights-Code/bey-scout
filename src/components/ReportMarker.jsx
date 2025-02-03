import { useState } from 'react'
import { Marker, Popup } from 'react-leaflet'
import moneyFormat from '../utilities/moneyFormat'
import countDaysBetween from '../utilities/countDaysBetween'
import markerIcon from '../functions/markerIcon'
import dayCountToColour from '../utilities/dayCountToColour'

const ReportMarker = ({ report }) => {
  const { sourceName, sourceGeolocation: geolocation, listings } = report
  const now = new Date(Date.now())

  const mostRecentReport = listings.sort((listingA, listingB) => {
    return listingB.reportedAt - listingA.reportedAt
  })[0]

  const daysSinceMostRecentReport = countDaysBetween(
    now,
    new Date(mostRecentReport.reportedAt.seconds * 1000)
  )

  const markerColour = dayCountToColour(daysSinceMostRecentReport)

  const reportedAt = (timestamp) => {
    const reportDate = new Date(timestamp.seconds * 1000)

    const daysBetween = countDaysBetween(now, reportDate)
    let reportString = ''

    if (daysBetween === 0) {
      reportString = `reported today at ${reportDate.getTime()}`
    } else if (daysBetween === 1) {
      reportString = `reported yesterday`
    } else if (daysBetween < 7) {
      reportString = `reported ${daysBetween} days ago`
    } else if (daysBetween < 14) {
      reportString = `reported last week`
    } else {
      reportString = `reported over two weeks ago`
    }

    return reportString
  }

  return (
    <Marker
      position={[geolocation.lat, geolocation.lng]}
      icon={markerIcon(markerColour)}
    >
      <Popup>
        <h3>{sourceName}</h3>
        {listings.map((listing, index) => (
          <p key={index}>
            {listing.productName} - {moneyFormat(listing.priceInCents)},
            {' ' + reportedAt(listing.reportedAt)}
          </p>
        ))}
      </Popup>
    </Marker>
  )
}

export default ReportMarker
