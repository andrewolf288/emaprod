import { ViewLoteFrescos } from "./ViewLoteFrescos";
import { ListRequisicionesFrescos } from "./ListRequisicionesFrescos";
import { AgregarProductosLoteFrescos } from "./agregar_producto_frescos/AgregarProductosLoteFrescos";

export const RouterRequisicionFrescos = [
  {
    path: "",
    element: <ListRequisicionesFrescos />,
  },
  {
    path: "view/:idProdc/:idReq",
    element: <ViewLoteFrescos />,
  },
  {
    path: "agregar",
    element: <AgregarProductosLoteFrescos />,
  },
];
