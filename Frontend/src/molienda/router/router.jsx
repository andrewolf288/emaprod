import HomeMolienda from "./../pages/HomeMolienda";
import { RouterMoliendaRequisicion } from "./../pages/requisicion_molienda/RouterMoliendaRequisicion";
import LayoutModulo from "./../../layout/LayoutModulo";
import { RouterMoliendaAlmacenStock } from "./../pages/almacen/RouterMoliendaAlmacenStock";

export const RouterMolienda = [
  {
    path: "",
    element: <HomeMolienda />,
  },
  {
    path: "requisicion",
    element: <LayoutModulo />,
    children: RouterMoliendaRequisicion,
  },
  {
    path: "almacen",
    element: <LayoutModulo />,
    children: RouterMoliendaAlmacenStock,
  },
];
