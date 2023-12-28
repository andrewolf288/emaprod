import { ListEntradaStockCalidad } from "./ListEntradaStockCalidad";
import { ViewEntradaStockCalidad } from "./ViewEntradaStockCalidad";
// import ActualizarEntradaStock from "./ActualizarEntradaStock";

export const RouterAlmacenEntradaStock = [
  {
    path: "",
    element: <ListEntradaStockCalidad />
  },
  {
    path: "view/:idEntSto",
    element: <ViewEntradaStockCalidad />
  }
];
