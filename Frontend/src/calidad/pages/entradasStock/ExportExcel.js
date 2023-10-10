import React from "react";
import Button from "@mui/material/Button";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { Tooltip } from "@mui/material";

const ExportExcel = ({ exelData }) => {


  exelData.map((row)=>{
    row.codProd = row.codEntSto.slice(0, 6) 
    delete row.id;
  })

  exelData = exelData.map((item)=>({
    FECHA:item.fecEntSto,
    PRODUCTO:item.nomProd,
    "CODIGO DE PRODUCTO":item.codEntSto,
    "PRESENTACION DEL PRODUCTO":item.prestProdt,
    "CERTIFICADO DE CALIDAD":item.certCal ? "C":"",
    LOTE:item.lotProv,
    "FECHA DE PRODUCCION":item.fecProduccion,
    "FECHA DE VENCIMIENTO":item.fecVenEntSto,
    "% HUMEDAD":item.humedad,
    "RESPONSABLE DE LA EVALUCACION":item.resbEval,
    "OBSERVACIONES":item.obsEnt,
  }))

  const exportExcel = async () => {
    const workbook = XLSX.utils.book_new();
    var worksheet = XLSX.utils.json_to_sheet(exelData, { origin: 1 });
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "DataSheet.xlsx");
  };
  return (
    <>
      <Button
        variant="contained"
        size="small"
        sx={{ width: 150, margin: 0.5, cursor: "pointer" }}
        onClick={(e) => exportExcel()}
      >
        Export excel
      </Button>
    </>
  );
};
export default ExportExcel;
