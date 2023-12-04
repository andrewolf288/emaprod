import React from "react";
import { ListRetornoVenta } from "./ListRetornoVenta";
import { ViewRetornoVenta } from "./ViewRetornoVenta";

export const RouterRetornoVenta = [
  {
    path: "",
    element: <ListRetornoVenta />,
  },
  {
    path: "view/:idRetornoVenta",
    element: <ViewRetornoVenta />,
  },
];
