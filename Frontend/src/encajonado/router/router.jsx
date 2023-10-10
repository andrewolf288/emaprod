import LayoutModulo from "./../../layout/LayoutModulo";
import { RouterEncajonadoAlmacenStock } from "./../pages/almacen/RouterEncajonadoAlmacenStock";
import { RouterEncajonadoRequisicion } from "../pages/requisicion_encajonado/RouterEncajonadoRequisicion";
import HomeEncajonado from "./../pages/HomeEncajonado";

export const RouterEncajonado = [
  {
    path: "",
    element: <HomeEncajonado />,
  },
  {
    path: "requisicion",
    element: <LayoutModulo />,
    children: RouterEncajonadoRequisicion,
  },
  {
    path: "almacen",
    element: <LayoutModulo />,
    children: RouterEncajonadoAlmacenStock,
  },
];
