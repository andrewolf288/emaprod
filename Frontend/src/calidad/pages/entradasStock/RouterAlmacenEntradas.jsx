import ListEntradaStock from "./ListEntradaStock";
import { ViewEntradaStock } from "./ViewEntradaStock";
// import ActualizarEntradaStock from "./ActualizarEntradaStock";

export const RouterAlmacenEntradaStock = [
  {
    path: "",
    element: <ListEntradaStock />,
  },
  {
    path: "view/:id",
    element: <ViewEntradaStock />,
  },
];
