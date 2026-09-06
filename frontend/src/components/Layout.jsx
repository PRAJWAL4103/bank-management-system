import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import './Layout.css'

export default function Layout() {
  return (
    <div className="app-shell">
      {/* Decorative glow orbs */}
      <div className="glow-orb orb-1" />
      <div className="glow-orb orb-2" />

      <Navbar />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
