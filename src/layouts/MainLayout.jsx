import { Outlet } from 'react-router'
import Navbar from '../components/Shared/Navbar/Navbar'
import Footer from '../components/Shared/Footer/Footer'
const MainLayout = () => {
  return (
    <div className="bg-base-200 text-base-content">
      <Navbar />
      <div className="min-h-[calc(100vh-48px)]">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

export default MainLayout
