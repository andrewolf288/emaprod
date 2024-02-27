import { ListReportes } from "./ListReportes";
import { ReporteStockTotal } from "./ReporteStockTotal";
import { ReporteEntradaSalidaStock } from "./ReporteEntradaSalidaStock";
import { ReporteProductoFinalLotes } from "./ReporteProductoFinalLotes";
import { ReporteEntradaMerma } from "./ReporteEntradaMerma";
import { ReporteTrazabilidadProductoFinal } from "./ReporteTrazabilidadProductoFinal";

export const RouterReportesAlmacen = [
  {
    path: "",
    element: <ListReportes />
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
  },
  {
    path: "reporte-entrada-merma",
    element: <ReporteEntradaMerma />
  },
  {
    path: "reporte-producto-final-stock",
    element: <ReporteTrazabilidadProductoFinal />
  }
];
