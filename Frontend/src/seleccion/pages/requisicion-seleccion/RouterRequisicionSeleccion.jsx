import { ListRequisicionSeleccion } from "./ListRequisicionSeleccion";
import { AgregarRequisicionSeleccion } from "./AgregarRequisicionSeleccion";

export const RouterRequisicionSeleccion = [
  {
    path: "",
    element: <ListRequisicionSeleccion />,
  },
  {
    path: "crear",
    element: <AgregarRequisicionSeleccion />,
  },
];
