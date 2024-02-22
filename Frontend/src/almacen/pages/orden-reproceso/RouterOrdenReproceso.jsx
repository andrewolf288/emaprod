import { ListOrdenesReproceso } from "./ListOrdenesReproceso";
import { ViewDevolucionesOrdenReproceso } from "./ViewDevolucionesOrdenReproceso";
import { ViewOrdenReproceso } from "./ViewOrdenReproceso";

export const RouterOrdenReproceso = [
  {
    path: "",
    element: <ListOrdenesReproceso />
  },
  {
    path: "view/:id",
    element: <ViewOrdenReproceso />
  },
  {
    path: "viewDevolucion/:id",
    element: <ViewDevolucionesOrdenReproceso />
  }
];
