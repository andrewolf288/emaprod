import { ListRequisicionesEncajonado } from "./ListRequisicionesEncajonado";
import { AgregarRequisicionEncajonado } from "./AgregarRequisicionEncajonado";
export const RouterEncajonadoRequisicion = [
  {
    path: "",
    element: <ListRequisicionesEncajonado />,
  },
  {
    path: "crear",
    element: <AgregarRequisicionEncajonado />,
  },
];
