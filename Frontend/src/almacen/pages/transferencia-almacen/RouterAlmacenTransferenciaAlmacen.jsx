import { AgregarTransferenciaAlmacen } from "./AgregarTransferenciaAlmacen";
import { ListTransferenciaAlmancen } from "./ListTransferenciaAlmancen";

export const RouterAlmacenTransferenciaAlmacen = [
  {
    path: "",
    element: <ListTransferenciaAlmancen />,
  },
  {
    path: "crear",
    element: <AgregarTransferenciaAlmacen />,
  },
];
