import React from 'react'
import { Outlet } from 'react-router-dom'

const LayoutNav = () => {
  return (
    <>
        <nav>Navbar</nav>
        <main>
            <Outlet />
        </main>
        <footer></footer>
    </>
    
  )
}

export default LayoutNav
