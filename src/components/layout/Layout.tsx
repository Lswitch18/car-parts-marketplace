import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  const location = useLocation()
  const isMessagesPage = location.pathname === '/messages'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 md:pt-24">
        <Outlet />
      </main>
      {!isMessagesPage && <Footer />}
    </div>
  )
}