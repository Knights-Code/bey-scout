import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Scout from './pages/Scout'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Scout />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
