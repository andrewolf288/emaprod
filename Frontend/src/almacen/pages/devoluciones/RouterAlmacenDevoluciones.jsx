import { ListDevolucion } from "./ListDevolucion";
import { AgregarDevolucionV2 } from "./AgregarDevolucionV2";
import { RequisicionDevoluciones } from "./RequisicionDevoluciones";

export const RouterAlmacenDevoluciones = [
  {
    path: "",
    element: <ListDevolucion />,
  },
  {
    path: "crear",
    element: <AgregarDevolucionV2 />,
  },
  {
    path: "atender-requisiciones",
    element: <RequisicionDevoluciones />,
  },
];
