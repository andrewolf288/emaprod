import { ListDevolucion } from "./ListDevolucion";
import { AgregarDevolucionV2 } from "./AgregarDevolucionV2";

export const RouterAlmacenDevoluciones = [
  {
    path: "",
    element: <ListDevolucion />,
  },
  {
    path: "crear",
    element: <AgregarDevolucionV2 />,
  },
];
