import React from "react";
import { Outlet } from "react-router-dom";

const LayoutModulo = () => {
  return (
    <main>
      <Outlet />
    </main>
  );
};

export default LayoutModulo;
