import LayoutModulo from "./../../layout/LayoutModulo";
import HomeCalidad from "./../pages/HomeCalidad";
import { RouterAlmacenEntradaStock } from "./../pages/entradasStock/RouterAlmacenEntradas";

export const RouterCalidad = [
  {
    path: "",
    element: <HomeCalidad />,
  },
  {
    path: "entradas-stock",
    element: <LayoutModulo />,
    children: RouterAlmacenEntradaStock,
  },
];
