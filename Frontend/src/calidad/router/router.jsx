import { RouterAlmacenCalidad } from "../pages/almacen-calidad/RouterAlmacenCalidad";
import { RouterAtributoCalidad } from "../pages/atributos-calidad/RouterAtributoCalidad";
import { RouterRequirimientoSalidaCalidad } from "../pages/requerimiento-salida/RouterRequirimientoSalidaCalidad";
import LayoutModulo from "./../../layout/LayoutModulo";
import HomeCalidad from "./../pages/HomeCalidad";
import { RouterAlmacenEntradaStock } from "./../pages/entradasStock/RouterAlmacenEntradas";

export const RouterCalidad = [
  {
    path: "",
    element: <HomeCalidad />
  },
  {
    path: "entradas-stock",
    element: <LayoutModulo />,
    children: RouterAlmacenEntradaStock
  },
  {
    path: "atributos-calidad",
    element: <LayoutModulo />,
    children: RouterAtributoCalidad
  },
  {
    path: "almacen",
    element: <LayoutModulo />,
    children: RouterAlmacenCalidad
  },
  {
    path: "salida-requerimiento",
    element: <LayoutModulo />,
    children: RouterRequirimientoSalidaCalidad
  }
];
