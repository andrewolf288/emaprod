import React from 'react'
import Button from '@mui/material/Button'
import * as XLSX from 'xlsx-js-style'

const ExportExcel = ({ exelData }) => {
  exelData.forEach((row) => {
    row.codProd = row.codEntSto.slice(0, 6)
    delete row.id
  })

  function parseInt (val) {
    val = parseFloat(val).toFixed(3)
    return val
  }
  const exportExcel = async () => {
    exelData.sort(function (a, b) {
      if (a.nomProd < b.nomProd) {
        return -1
      }
      if (a.nomProd > b.nomProd) {
        return 1
      }
      return 0
    })
    let kardex = []
    let saldo = 0

    exelData = exelData.reverse()

    exelData.forEach((entrada, index) => {
      saldo = Math.abs(parseFloat(parseFloat(saldo).toFixed(3)) + parseFloat(parseFloat(entrada.canTotEnt).toFixed(3)))

      kardex.push({
        DOCUMENTO: 'COMPRA',
        'CODIGO PRODUCTO': entrada.codProd,
        'CODIGO ENTRADA': entrada.codEntSto,
        NOMBRE: entrada.nomProd,
        PROVEDOR: entrada.nomProv,
        FECHA: entrada.fecEntSto,
        ENTRADAS: parseInt(entrada.canTotEnt),
        SALIDAS: '0.000',
        SALDO: saldo.toFixed(3)
      })
      if (entrada.salidasProduccion?.length) {
        entrada.salidasProduccion.forEach((salida) => {
        // console.log(saldo ,salida.canSalStoReq, parseFloat(saldo) - parseFloat(salida.canSalStoReq))
          saldo = Math.abs(parseFloat(parseFloat(saldo).toFixed(3)) - parseFloat(parseFloat(salida.canSalStoReq).toFixed(3)))
          kardex.push({
            DOCUMENTO: salida.numop,
            'CODIGO PRODUCTO': entrada.codProd,
            'CODIGO ENTRADA': '',
            NOMBRE: salida.nomProd,
            PROVEDOR: '',
            FECHA: salida.fecSalStoReq,
            ENTRADAS: '0.000',
            SALIDAS: parseInt(salida.canSalStoReq),
            SALDO: saldo.toFixed(3)
          })
        })
      }

      if (entrada.devoluciones?.length) {
        entrada.devoluciones.forEach((dev) => {
        // console.log(saldo ,dev.canProdDevTra, parseFloat(saldo) - parseFloat(dev.canProdDevTra))
          saldo = Math.abs(parseFloat(parseFloat(saldo).toFixed(3)) + parseFloat(parseFloat(dev.canProdDevTra).toFixed(3)))
          kardex.push({
            DOCUMENTO: 'DEVOLUCION',
            'CODIGO PRODUCTO': entrada.codProd,
            'CODIGO ENTRADA': '',
            NOMBRE: dev.nomProd,
            PROVEDOR: '',
            FECHA: dev.fecCreProdDevTra,
            ENTRADAS: parseInt(dev.canProdDevTra),
            SALIDAS: '0.000',
            SALDO: saldo.toFixed(3)
          })
        })
      }

      if (entrada.salidasSeleccion?.length) {
        entrada.salidasSeleccion.forEach((salida) => {
        // console.log(saldo ,salida.canSalStoReq, parseFloat(saldo) - parseFloat(salida.canSalStoReq))
          saldo = Math.abs(parseFloat(parseFloat(saldo).toFixed(3)) - parseFloat(parseFloat(salida.canSalStoReqSel).toFixed(3)))
          kardex.push({
            DOCUMENTO: salida.numop,
            'CODIGO PRODUCTO': salida.codProd2,
            'CODIGO ENTRADA': '',
            NOMBRE: salida.nomProd,
            PROVEDOR: '',
            FECHA: salida.fecSalStoReqSel,
            ENTRADAS: '0.000',
            SALIDAS: parseInt(salida.canSalStoReqSel),
            SALDO: saldo.toFixed(3)
          })
        })
      }

      const sss = exelData[index + 1]
      if (sss && sss.nomProd != entrada.nomProd) {
        saldo = 0
      }
    })

    kardex = kardex.reverse()

    // console.log(exelData)
    // console.log(kardex)

    // return

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(kardex)
    for (const key in worksheet) {
      if (key.startsWith('F') || key.startsWith('G') || key.startsWith('H') || key.startsWith('I')) {
        worksheet[key].s = { alignment: { horizontal: 'right' } }
      }
    }

    const colNames = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1']
    for (const itm of colNames) {
      if (worksheet[itm]) {
        worksheet[itm].s = {
          fill: { fgColor: { rgb: '26a5e9' } },
          font: { color: { rgb: 'FFFFFF' } }
        }
      }
    }

    // return
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1', true)
    XLSX.writeFile(workbook, 'DataSheet.xlsx')
  }
  return (
    <>
      <Button
        variant="contained"
        size="small"
        sx={{ width: 150, margin: 0.5, cursor: 'pointer' }}
        onClick={(e) => exportExcel()}
      >
        Export excel
      </Button>
    </>
  )
}
export default ExportExcel
