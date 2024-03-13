import { ListOperacionDevolucionWithCalidad } from "./ListOperacionDevolucionWithCalidad";
import { ViewOperacionDevolucionCalidad } from "./ViewOperacionDevolucionCalidad";

export const RouterOperacionDevolucionCalidad = [
  {
    path: "",
    element: <ListOperacionDevolucionWithCalidad />
  },
  {
    path: "view/:idEntSto",
    element: <ViewOperacionDevolucionCalidad />
  },
  {
    path: "create/:idOpeDevCal",
    element: <ViewOperacionDevolucionCalidad />
  }
];
