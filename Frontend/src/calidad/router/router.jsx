import { RouterAlmacenCalidad } from "../pages/almacen-calidad/RouterAlmacenCalidad";
import { RouterAtributoCalidad } from "../pages/atributos-calidad/RouterAtributoCalidad";
import { RouterOperacionDevolucionCalidad } from "../pages/operacion-reproceso-calidad/RouterOperacionDevolucionCalidad";
import { RouterReportesCalidad } from "../pages/reportes/RouterReportesCalidad";
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
  },
  {
    path: "reportes-calidad",
    element: <LayoutModulo />,
    children: RouterReportesCalidad
  },
  {
    path: "operacion-devolucion",
    element: <LayoutModulo />,
    children: RouterOperacionDevolucionCalidad
  }
];
