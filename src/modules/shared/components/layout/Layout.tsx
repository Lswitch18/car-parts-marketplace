import { Outlet, useLocation } from 'react-router'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  const location = useLocation()
  
  const showFooter = 
    location.pathname === '/' ||
    location.pathname === '/catalog' ||
    location.pathname === '/parts' ||
    location.pathname === '/cars' ||
    location.pathname === '/auctions' ||
    location.pathname.startsWith('/product/')

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 md:pt-24">
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  )
}