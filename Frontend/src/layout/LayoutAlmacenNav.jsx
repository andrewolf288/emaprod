import React from 'react'
import { Outlet } from 'react-router-dom'
import NavAlmacen from '../almacen/components/NavAlmacen'

const LayoutAlmacenNav = () => {
  return (
    <>
        <NavAlmacen/>
        <main>
            <Outlet />
        </main>
        <footer></footer>
    </>
    
  )
}

export default LayoutAlmacenNav