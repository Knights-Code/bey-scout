import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Scout from './pages/Scout'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ProductForm from './pages/ProductForm'
import { ToastContainer } from 'react-toastify'
import CleanUpForm from './pages/CleanUpForm'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Scout />} />
          <Route path='/sign-in' element={<SignIn />} />
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/new-product-form' element={<ProductForm />} />
          <Route path='/clean-up-form' element={<CleanUpForm />} />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  )
}

export default App
