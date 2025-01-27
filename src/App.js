import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Scout from './pages/Scout'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Scout />} />
          <Route path='/sign-in' element={<SignIn />} />
          <Route path='/sign-up' element={<SignUp />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
