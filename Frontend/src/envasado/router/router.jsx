import LayoutModulo from "./../../layout/LayoutModulo";
import HomeEnvasado from "./../pages/HomeEnvasado";
import { RouterEnvasadoRequisicion } from "./../pages/requisicion_envasado/RouterEnvasadoRequisicion";
import { RouterEnvasadoAlmacenStock } from "./../pages/almacen/RouterEnvasadoAlmacenStock";

export const RouterEnvasado = [
  {
    path: "",
    element: <HomeEnvasado />,
  },
  {
    path: "requisicion",
    element: <LayoutModulo />,
    children: RouterEnvasadoRequisicion,
  },
  {
    path: "almacen",
    element: <LayoutModulo />,
    children: RouterEnvasadoAlmacenStock,
  },
];
