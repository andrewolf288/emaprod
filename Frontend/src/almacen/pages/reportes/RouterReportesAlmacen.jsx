import { ReporteEntradas } from "./entradas/ReporteEntradas";
import { ListReportes } from "./ListReportes";

export const RouterReportesAlmacen = [
  {
    path: "",
    element: <ListReportes />,
  },
  {
    path: "entradas-stock",
    element: <ReporteEntradas />,
  },
];
