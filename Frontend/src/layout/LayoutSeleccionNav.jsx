import React from "react";
import { Outlet } from "react-router-dom";
import NavSeleccion from "./../seleccion/components/NavSeleccion";

const LayoutSeleccionNav = () => {
  return (
    <>
      <NavSeleccion />
      <main>
        <Outlet />
      </main>
      <footer></footer>
    </>
  );
};

export default LayoutSeleccionNav;
