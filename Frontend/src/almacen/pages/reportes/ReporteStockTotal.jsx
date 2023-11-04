import React, { useState } from "react";
import { exportJSONtoExcel } from "../../utils/exportJSONtoExcel";
import { FilterProductosDynamic } from "../../../components/ReferencialesFilters/Producto/FilterProductosDynamic";
import { getReporteStockTotal } from "../../helpers/reportes/getReporteStockTotal";

export const ReporteStockTotal = () => {
  const [producto, setproducto] = useState(0);
  const handledMateriPrima = ({ id }) => {
    setproducto(id);
  };

  // ENVIAMOS LA DATA DE LOS FILTERS PARA FILTRAR LA DATA
  const submitDataFilterToExcel = async () => {
    const { message_error, description_error, result } =
      await getReporteStockTotal(producto);
    console.log(result);
    if (message_error.length === 0) {
      const { data, header, columnWidths } = result;
      exportExcel(data, header, columnWidths, "reporte-stock-total");
    } else {
      console.log(description_error);
    }
  };

  //FUNCION PARA EXPORTAR EN EXCEL
  const exportExcel = (dataJSON, header, columnWidths, fileName) => {
    exportJSONtoExcel(dataJSON, header, columnWidths, fileName);
  };
  return (
    <>
      <div className="container-fluid mx-3">
        <div className="row mt-3">
          <div className="col-6">
            {/* filter */}
            <label className="form-label">Materia prima</label>
            <FilterProductosDynamic
              onNewInput={handledMateriPrima}
              defaultValue={producto}
            />
          </div>
        </div>
        {/* opciones de formato de reporte */}
        <div className="row d-flex flex-row justify-content-center mt-4">
          <p className="text-bg-light p-3 fs-4 fw-bold">
            Formatos para exportar
          </p>
          <div className="col-1">
            <button
              onClick={submitDataFilterToExcel}
              className="btn btn-success"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-file-earmark-excel-fill"
                viewBox="0 0 16 16"
              >
                <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM5.884 6.68 8 9.219l2.116-2.54a.5.5 0 1 1 .768.641L8.651 10l2.233 2.68a.5.5 0 0 1-.768.64L8 10.781l-2.116 2.54a.5.5 0 0 1-.768-.641L7.349 10 5.116 7.32a.5.5 0 1 1 .768-.64z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
