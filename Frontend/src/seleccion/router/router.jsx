import { RouterRequisicionSeleccion } from "./../pages/requisicion-seleccion/RouterRequisicionSeleccion";
import LayoutModulo from "./../../layout/LayoutModulo";
import HomeSeleccion from "./../pages/HomeSeleccion";

export const RouterSeleccion = [
  {
    path: "",
    element: <HomeSeleccion />,
  },
  {
    path: "requisicion",
    element: <LayoutModulo />,
    children: RouterRequisicionSeleccion,
  },
];
