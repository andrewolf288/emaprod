import { ListOrdenesIrradiacion } from "./ListOrdenesIrradiacion";
import { ViewIngresoOrdenIrradiacion } from "./ViewIngresoOrdenIrradiacion";
import { ViewSalidaOrdenIrradiacion } from "./ViewSalidaOrdenIrradiacion";

export const RouterOrdenIrradiacion = [
  {
    path: "",
    element: <ListOrdenesIrradiacion />
  },
  {
    path: "viewSalida/:id",
    element: <ViewSalidaOrdenIrradiacion />
  },
  {
    path: "viewIngreso/:id",
    element: <ViewIngresoOrdenIrradiacion />
  }
];
