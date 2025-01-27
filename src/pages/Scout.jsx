import { useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import { TextField } from '@mui/material'
import useSearchCandidates from '../hooks/useSearchCandidates'
import fetchReports from '../functions/fetchReports'
import Spinner from '../components/Spinner'
import moneyFormat from '../utilities/moneyFormat'

function Scout() {
  const [loading, setLoading] = useState(false)
  const [searchFor, setSearchFor] = useState('')
  const [reports, setReports] = useState([])
  // Get full list of unique product and component names.
  const searchCandidates = useSearchCandidates()

  console.log(searchCandidates)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Fetch and display reports.
    const reportsResult = await fetchReports(searchFor)

    setReports(reportsResult)

    setLoading(false)
  }

  const onMutate = (e, newValue) => {
    setSearchFor(newValue)
  }

  if (loading) return <Spinner />

  return (
    <div className='pageContainer'>
      <h1>Bey Scout</h1>
      <form onSubmit={onSubmit}>
        <div className='lookupContainer'>
          <Autocomplete
            disablePortal
            options={searchCandidates}
            value={searchFor}
            onChange={onMutate}
            sx={{ width: 300 }}
            renderInput={(params) => (
              <TextField {...params} label='Product or Component' />
            )}
          />
        </div>
      </form>

      {reports.length > 0 && (
        <ul>
          {reports.map((report) => (
            <li key={report.id}>
              <h3>Product</h3>
              <p>{report.product.name}</p>
              <h3>Price</h3>
              <p>{moneyFormat(report.priceInCents)}</p>
              <h3>Location</h3>
              <p>{report.source.name}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
{
  /* <input
              type='text'
              className='formInput'
              id='searchFor'
              onChange={onMutate}
            /> */
}
export default Scout
