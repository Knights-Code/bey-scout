import { useEffect, useState, useRef } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'

const PlaceAutocomplete = ({ onPlaceSelect, onTextChange }) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState(null)
  const inputRef = useRef(null)
  const places = useMapsLibrary('places')

  useEffect(() => {
    if (!places || !inputRef.current) return

    const options = {
      fields: ['geometry', 'name', 'formatted_address'],
    }

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options))
  }, [places])

  useEffect(() => {
    if (!placeAutocomplete) return

    placeAutocomplete.addListener('place_changed', () => {
      const selectedPlace = placeAutocomplete.getPlace()
      onPlaceSelect(selectedPlace)
    })
  }, [onPlaceSelect, placeAutocomplete])

  return (
    <div>
      <input className='formInput' ref={inputRef} onChange={onTextChange} />
    </div>
  )
}

export default PlaceAutocomplete
