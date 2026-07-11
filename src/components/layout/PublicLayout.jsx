import { Outlet } from 'react-router-dom'
import PublicNavbar from './PublicNavbar'
import Footer from './Footer'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
