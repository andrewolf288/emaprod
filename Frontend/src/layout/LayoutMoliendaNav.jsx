import React from 'react'
import { Outlet } from 'react-router-dom'
import NavMolienda from '../molienda/components/NavMolienda'

const LayoutMoliendaNav = () => {
  return (
    <>
        <NavMolienda/>
        <main>
            <Outlet />
        </main>
        <footer></footer>
    </>
    
  )
}

export default LayoutMoliendaNav