import { HomeAlmacenVentas } from "../pages/HomeAlmacenVentas";
import { RouterAlmacenStockVentas } from "../pages/almacen/RouterAlmacenStockVentas";
import LayoutModulo from "./../../layout/LayoutModulo";

export const RouterVentas = [
  {
    path: "",
    element: <HomeAlmacenVentas />
  },
  {
    path: "stock-almacen",
    element: <LayoutModulo />,
    children: RouterAlmacenStockVentas
  }
];
