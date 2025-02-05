import { Timestamp } from 'firebase/firestore'

const firebaseTimestamp = (timestamp) => {
  const date = new Date(timestamp)
  const epochSeconds = date.getTime() / 1000
  return new Timestamp(epochSeconds, 0)
}

export default firebaseTimestamp
