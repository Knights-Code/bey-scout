import { EditIcon, SearchIcon } from '@chakra-ui/icons'
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
    <footer className='navbar'>
      <nav className='navbarNav'>
        <ul className='navbarListItems'>
          <li className='navbarListItem' onClick={() => navigate('/')}>
            <SearchIcon
              color={pathMatchRoute('/') ? '#a2ff1f' : '#a2ff1f9e'}
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
              color={pathMatchRoute('/new-report') ? '#a2ff1f' : '#a2ff1f9e'}
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
  )
}

export default Navbar
