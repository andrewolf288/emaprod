import { ViewLoteMolienda } from "./ViewLoteMolienda";
import { ListRequisicionesMolienda } from "./ListRequisicionesMolienda";
import { AgregarProductosLoteMolienda } from "./agregar_productos_molienda/AgregarProductosLoteMolienda";

export const RouterRequisicionMolienda = [
  {
    path: "",
    element: <ListRequisicionesMolienda />,
  },
  {
    path: "view/:idProdc/:idReq",
    element: <ViewLoteMolienda />,
  },
  {
    path: "agregar",
    element: <AgregarProductosLoteMolienda />,
  },
];
