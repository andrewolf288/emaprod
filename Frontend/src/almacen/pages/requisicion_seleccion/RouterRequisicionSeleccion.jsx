import { SalidaStock } from "./SalidaStock";
import { EntradaStock } from "./EntradaStock";
import { ListRequisicionSeleccion } from "./ListRequisicionSeleccion";

export const RouterRequisicionSeleccion = [
  {
    path: "",
    element: <ListRequisicionSeleccion />,
  },
  {
    path: "salida-stock",
    element: <SalidaStock />,
  },
  {
    path: "entrada-stock",
    element: <EntradaStock />,
  },
];
