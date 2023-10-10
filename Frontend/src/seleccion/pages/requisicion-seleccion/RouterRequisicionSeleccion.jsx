import { ListRequisicionSeleccion } from "./ListRequisicionSeleccion";
import { AgregarRequisicionSeleccion } from "./AgregarRequisicionSeleccion";
import { ActualizarRequisicionSeleccion } from "./ActualizarRequisicionSeleccion";

export const RouterRequisicionSeleccion = [
  {
    path: "",
    element: <ListRequisicionSeleccion />,
  },
  {
    path: "crear",
    element: <AgregarRequisicionSeleccion />,
  },
  {
    path: "actualizar/:id",
    element: <ActualizarRequisicionSeleccion />,
  },
];
