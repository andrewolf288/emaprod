import { RouterMoliendaFormula } from "../pages/formulas/RouterMoliendaFormula";
import LayoutModulo from "./../../layout/LayoutModulo";
import { HomeProduccion } from "./../pages/HomeProduccion";
import { RouterProduccionLote } from "./../pages/produccion_lote/RouterProduccionLote";
import { RouterFormulaPorProducto } from "./../pages/formulas_por_productos/RouterFormulaPorProducto";
import { RouterRequisicionMateriales } from "../pages/requisicion-materiales/RouterRequisicionMateriales";

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
  {
    path: "requisicion-materiales",
    element: <LayoutModulo />,
    children: RouterRequisicionMateriales,
  },
];
