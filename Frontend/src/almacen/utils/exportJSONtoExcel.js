import * as XLSX from "xlsx";

export const exportJSONtoExcel = (data, headers, columnWidths, fileName) => {
  // Crear una hoja de cálculo
  const ws = XLSX.utils.json_to_sheet(data);

  // Agregar la fila 1 con encabezados
  XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 0 });

  // Inicializar el objeto "!cols" si no está definido
  if (!ws["!cols"]) {
    ws["!cols"] = [];
  }

  // Definir el ancho de las columnas
  if (columnWidths && columnWidths.length > 0) {
    for (let i = 0; i < columnWidths.length; i++) {
      ws["!cols"][i] = { wch: columnWidths[i] };
    }
  }

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();

  // Crear el libro y guardar el archivo Excel
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${fileName}_${formattedDate}.xlsx`);
};
