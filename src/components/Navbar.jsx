import { EditIcon, SearchIcon } from '@chakra-ui/icons'
import { ChakraProvider } from '@chakra-ui/react'
import { useLocation, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const pathMatchRoute = (route) => {
    if (route === location.pathname) {
      return true
    }
  }

  return (
    <ChakraProvider>
      <footer className='navbar'>
        <nav className='navbarNav'>
          <ul className='navbarListItems'>
            <li className='navbarListItem' onClick={() => navigate('/')}>
              <SearchIcon
                fill={pathMatchRoute('/') ? '#2c2c2c' : '#8f8f8f'}
                width='36px'
                height='36px'
              />
              <p
                className={
                  pathMatchRoute('/')
                    ? 'navbarListItemNameActive'
                    : 'navbarListItemName'
                }
              >
                Scout
              </p>
            </li>
            <li
              className='navbarListItem'
              onClick={() => navigate('/new-report')}
            >
              <EditIcon
                fill={pathMatchRoute('/new-report') ? '#2c2c2c' : '#8f8f8f'}
                width='36px'
                height='36px'
              />
              <p
                className={
                  pathMatchRoute('/new-report')
                    ? 'navbarListItemNameActive'
                    : 'navbarListItemName'
                }
              >
                Report
              </p>
            </li>
          </ul>
        </nav>
      </footer>
    </ChakraProvider>
  )
}

export default Navbar
