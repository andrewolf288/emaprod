import React from "react";
import { ListSalidaVenta } from "./ListSalidaVenta";
import { ViewSalidaVenta } from "./ViewSalidaVenta";

export const RouterSalidaVenta = [
  {
    path: "",
    element: <ListSalidaVenta />,
  },
  {
    path: "view/:idSalidaVenta",
    element: <ViewSalidaVenta />,
  },
];
