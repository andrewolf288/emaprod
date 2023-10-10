import ListEntradaStock from "./ListEntradaStock";
import AgregarEntradaStock from "./AgregarEntradaStock";
import { ViewEntradaStock } from "./ViewEntradaStock";
// import ActualizarEntradaStock from "./ActualizarEntradaStock";

export const RouterAlmacenEntradaStock = [
  {
    path: "",
    element: <ListEntradaStock />,
  },
  {
    path: "crear",
    element: <AgregarEntradaStock />,
  },
  // {
  //   path: "actualizar/:id",
  //   element: <ActualizarEntradaStock />,
  // },
  {
    path: "view/:id",
    element: <ViewEntradaStock />,
  },
];
