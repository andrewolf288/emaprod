import React from "react";
import Button from "@mui/material/Button";
import * as FileSaver from "file-saver";
//import * as XLSX from "xlsx";
import * as XLSX from 'xlsx-js-style';

import { Tooltip } from "@mui/material";

const ExportExcel = ({ exelData }) => {


  exelData.map((row)=>{
    row.codProd = row.codEntSto.slice(0, 6) 
    delete row.id;
  })

  
 /**
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
  */

  function parseInt(val){
    val = parseFloat(val).toFixed(3)
    return val
  }
  const exportExcel = async () => {

    exelData.sort(function (a, b) {
      if (a.nomProd < b.nomProd) {
        return -1;
      }
      if (a.nomProd > b.nomProd) {
        return 1;
      }
      return 0;
    });
    var kardex = []
    var saldo = 0

    exelData = exelData.reverse()

  exelData.map((entrada, index)=>{
    //console.log(saldo, entrada.canTotEnt, Math.abs(parseFloat(parseFloat(saldo).toFixed(3)) + parseFloat(parseFloat(entrada.canTotEnt).toFixed(3))))

   
    saldo = Math.abs(parseFloat(parseFloat(saldo).toFixed(3)) + parseFloat(parseFloat(entrada.canTotEnt).toFixed(3))) 


    kardex.push({
      "DOCUMENTO":"COMPRA",
      "CODIGO PRODUCTO":entrada.codProd,
      "CODIGO ENTRADA":entrada.codEntSto,
      "NOMBRE":entrada.nomProd,
      "PROVEDOR":entrada.nomProv,
      "FECHA":entrada.fecEntSto,
      "ENTRADAS": parseInt(entrada.canTotEnt),
      "SALIDAS": "0.000",
      "SALDO":saldo.toFixed(3),
    })
    if(entrada.salidasProduccion?.length){

      entrada.salidasProduccion.map((salida)=>{
        //console.log(saldo ,salida.canSalStoReq, parseFloat(saldo) - parseFloat(salida.canSalStoReq))
        saldo = Math.abs(parseFloat(parseFloat(saldo).toFixed(3)) - parseFloat(parseFloat(salida.canSalStoReq).toFixed(3)))
        kardex.push({
          "DOCUMENTO":salida.numop,
          "CODIGO PRODUCTO":entrada.codProd,
          "CODIGO ENTRADA":"",
          "NOMBRE":salida.nomProd,
          "PROVEDOR":"",
          "FECHA":salida.fecSalStoReq,
          "ENTRADAS": "0.000",
          "SALIDAS": parseInt(salida.canSalStoReq),
          "SALDO" :saldo.toFixed(3)
        })
      })
    }

    if(entrada.devoluciones?.length){

      entrada.devoluciones.map((dev)=>{
        //console.log(saldo ,dev.canProdDevTra, parseFloat(saldo) - parseFloat(dev.canProdDevTra))
        saldo = Math.abs(parseFloat(parseFloat(saldo).toFixed(3)) + parseFloat(parseFloat(dev.canProdDevTra).toFixed(3)))
        kardex.push({
          "DOCUMENTO":"DEVOLUCION",
          "CODIGO PRODUCTO":entrada.codProd,
          "CODIGO ENTRADA":"",
          "NOMBRE":dev.nomProd,
          "PROVEDOR":"",
          "FECHA":dev.fecCreProdDevTra,
          "ENTRADAS": parseInt(dev.canProdDevTra),
          "SALIDAS": "0.000",
          "SALDO" :saldo.toFixed(3)
        })
      })
    }

    if(entrada.salidasSeleccion?.length){

      entrada.salidasSeleccion.map((salida)=>{
        //console.log(saldo ,salida.canSalStoReq, parseFloat(saldo) - parseFloat(salida.canSalStoReq))
        saldo = Math.abs(parseFloat(parseFloat(saldo).toFixed(3)) - parseFloat(parseFloat(salida.canSalStoReqSel).toFixed(3)))
        kardex.push({
          "DOCUMENTO":salida.numop,
          "CODIGO PRODUCTO":salida.codProd2,
          "CODIGO ENTRADA":"",
          "NOMBRE":salida.nomProd,
          "PROVEDOR":"",
          "FECHA":salida.fecSalStoReqSel,
          "ENTRADAS": "0.000",
          "SALIDAS": parseInt(salida.canSalStoReqSel),
          "SALDO" :saldo.toFixed(3)
        })
      })
    }

    var sss = exelData[index + 1]
    if(sss && sss.nomProd !=  entrada.nomProd){
      saldo = 0
    }

  })

  kardex = kardex.reverse()

  //console.log(exelData)
  //console.log(kardex)

  //return

  

    const workbook = XLSX.utils.book_new();
    var worksheet = XLSX.utils.json_to_sheet(kardex);
    for (const key in worksheet) {
      if(key.startsWith("F") || key.startsWith("G") || key.startsWith("H") || key.startsWith("I")   ){
       worksheet[key].s = { alignment: { horizontal: "right" } } 
      }
  }

  const colNames = ["A1", "B1", "C1","D1","E1","F1","G1","H1","I1"];
    for (const itm of colNames) {
      if (worksheet[itm]) {
        worksheet[itm].s = {
          fill: { fgColor: { rgb: '26a5e9' } },
          font: { color: { rgb: 'FFFFFF' } },
        };
      }
    }

    //return
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1", true);
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
