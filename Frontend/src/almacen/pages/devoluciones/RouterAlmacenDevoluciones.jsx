import { ListDevolucion } from "./ListDevolucion";
import { AgregarDevolucion } from "./AgregarDevolucion";

export const RouterAlmacenDevoluciones = [
  {
    path: "",
    element: <ListDevolucion />,
  },
  {
    path: "crear",
    element: <AgregarDevolucion />,
  },
];
