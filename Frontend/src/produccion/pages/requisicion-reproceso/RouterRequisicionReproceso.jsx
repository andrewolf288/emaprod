import React from "react";
import { ListRequisicionReproceso } from "./ListRequisicionReproceso";
import { CreateRequisicionReproceso } from "./CreateRequisicionReproceso";

export const RouterRequisicionReproceso = [
  {
    path: "",
    element: <ListRequisicionReproceso />
  },
  {
    path: "crear",
    element: <CreateRequisicionReproceso />
  }
];
