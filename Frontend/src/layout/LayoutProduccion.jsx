import React from "react";
import { Outlet } from "react-router-dom";
import NavProduccion from "./../produccion/components/NavProduccion";

const LayoutProduccionNav = () => {
  return (
    <>
      <NavProduccion />
      <main>
        <Outlet />
      </main>
      <footer></footer>
    </>
  );
};

export default LayoutProduccionNav;
