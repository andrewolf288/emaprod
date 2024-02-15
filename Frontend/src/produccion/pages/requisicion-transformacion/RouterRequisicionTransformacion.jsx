import React from "react";
import { ListRequisicionTransformacion } from "./ListRequisicionTransformacion";
import { CreateRequisicionTransformacion } from "./CreateRequisicionTransformacion";

export const RouterRequisicionTransformacion = [
  {
    path: "",
    element: <ListRequisicionTransformacion />
  },
  {
    path: "crear",
    element: <CreateRequisicionTransformacion />
  }
];
