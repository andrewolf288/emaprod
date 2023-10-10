import { RouterMoliendaFormula } from "../pages/formulas/RouterMoliendaFormula";
import LayoutModulo from "./../../layout/LayoutModulo";
import { HomeProduccion } from "./../pages/HomeProduccion";
import { RouterProduccionLote } from "./../pages/produccion_lote/RouterProduccionLote";
import { RouterFormulaPorProducto } from "./../pages/formulas_por_productos/RouterFormulaPorProducto";
//import { RouterAlmacenLoteProduccion } from "../pages/lote_produccion/RouterAlmacenLoteProduccion";
export const RouterProduccion = [
  {
    path: "",
    element: <HomeProduccion />,
  },
  {
    path: "produccion-lote",
    element: <LayoutModulo />,
    children: RouterProduccionLote,
  },
  {
    path: "formula",
    element: <LayoutModulo />,
    children: RouterMoliendaFormula,
  },
  {
    path: "formula-producto",
    element: <LayoutModulo />,
    children: RouterFormulaPorProducto,
  },
   
];
