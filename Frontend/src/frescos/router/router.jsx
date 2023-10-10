import LayoutModulo from "./../../layout/LayoutModulo";
import { RouterMoliendaAlmacenStock } from "./../pages/almacen/RouterMoliendaAlmacenStock";
import HomeFrescos from "./../pages/HomeFrescos";
import { RouterFrescosRequisicion } from "./../pages/requisicion_frescos/RouterFrescosRequisicion";

export const RouterFrescos = [
  {
    path: "",
    element: <HomeFrescos />,
  },
  {
    path: "requisicion",
    element: <LayoutModulo />,
    children: RouterFrescosRequisicion,
  },
  {
    path: "almacen",
    element: <LayoutModulo />,
    children: RouterMoliendaAlmacenStock,
  },
];
