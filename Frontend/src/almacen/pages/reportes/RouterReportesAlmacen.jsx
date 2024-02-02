import { ReporteEntradas } from "./ReporteEntradas";
import { ListReportes } from "./ListReportes";
import { ReporteStockTotal } from "./ReporteStockTotal";
import { ReporteEntradaSalidaStock } from "./ReporteEntradaSalidaStock";
import { ReporteProductoFinalLotes } from "./ReporteProductoFinalLotes";

export const RouterReportesAlmacen = [
  {
    path: "",
    element: <ListReportes />
  },
  {
    path: "reporte-entrada-stock",
    element: <ReporteEntradas />
  },
  {
    path: "reporte-stock-total",
    element: <ReporteStockTotal />
  },
  {
    path: "reporte-entrada-salida-stock",
    element: <ReporteEntradaSalidaStock />
  },
  {
    path: "reporte-producto-final-lotes",
    element: <ReporteProductoFinalLotes />
  }
];
