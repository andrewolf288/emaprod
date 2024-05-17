import React, { useState } from 'react'
import { IconButton, TableCell, TableRow, TextField } from '@mui/material'
import { mostrarMesYAnio } from '../../../utils/functions/FormatDate'
import { BuscarEntradasStock } from '../../../components/CommonComponents/buscadores/BuscarEntradasStock'
import { ViewDetalleEntradasStock } from '../../../components/CommonComponents/buscadores/ViewDetalleEntradasStock'
import CancelIcon from '@mui/icons-material/Cancel'
import { BuscarLoteProductoFinal } from '../../../components/CommonComponents/buscadores/BuscarLoteProductoFinal'

export const RowEditTransferenciaAlmacenDetalle = (
  {
    detalle,
    onEdit,
    onDelete,
    onQuitarReferenciaLoteProduccion,
    onQuitarReferenciaEntrada,
    onAgregarReferenciaEntrada,
    onAgregarReferenciaLoteProduccion,
    idAlmacen
  }
) => {
  const { esProFin, codLotProd, fecVenLotProd, idProdc, detEntSto } = detalle
  const [disabledInput, setdisabledInput] = useState(true)

  const textReferenciaEntrada = detEntSto.length !== 0 ? '' : 'No asignado'
  const textReferenciaLoteProduccion = idProdc
    ? `${codLotProd} - ${mostrarMesYAnio(fecVenLotProd)}`
    : 'No asignado'

  return (
    <TableRow>
      <TableCell>
        {
          esProFin === 1
            ? <>
              <span className='me-2'>{textReferenciaLoteProduccion}</span>
              {
                idProdc
                  ? (
                    <IconButton onClick={() => onQuitarReferenciaLoteProduccion(detalle.idProdt)}>
                      <CancelIcon color='error'/>
                    </IconButton>
                  )
                  : (
                    <BuscarLoteProductoFinal
                      dataDetalle={detalle}
                      handleConfirm={onAgregarReferenciaLoteProduccion}
                    />
                  )
              }
            </>
            : <>
              {
                detEntSto.length === 0
                  ? (
                    <>
                      <span className='me-2'>{textReferenciaEntrada}</span>
                      <BuscarEntradasStock
                        detalle={detalle}
                        idAlmacen={idAlmacen}
                        handleConfirm={onAgregarReferenciaEntrada}
                      />
                    </>
                  )
                  : (
                    <>
                      <IconButton onClick={() => onQuitarReferenciaEntrada(detalle.idProdt)}>
                        <CancelIcon color='error'/>
                      </IconButton>
                      <ViewDetalleEntradasStock dataEntradas={detEntSto} detalle={detalle}/>
                    </>
                  )
              }
            </>
        }
      </TableCell>
      <TableCell>
        {detalle.codProd2}
      </TableCell>
      <TableCell>
        {detalle.desCla}
      </TableCell>
      <TableCell>
        {detalle.nomProd}
      </TableCell>
      <TableCell>
        <div className='d-flex align-items-center'>
          <TextField
            size="small"
            onChange={(e) => {
              onEdit(e, detalle)
            }}
            type="number"
            name="inputCantidad"
            value={detalle.canMatPriFor}
            disabled={disabledInput}
          />
          <label className="ms-2">{detalle.simMed}</label>
        </div>
      </TableCell>
      <TableCell align="left">
        <div className="btn-toolbar">
          <button
            onClick={() => {
              setdisabledInput(!disabledInput)
            }}
            className="btn btn-success me-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-pencil-fill"
              viewBox="0 0 16 16"
            >
              <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
            </svg>
          </button>
          <button
            onClick={() => {
              onDelete(detalle)
            }}
            className="btn btn-danger"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-trash-fill"
              viewBox="0 0 16 16"
            >
              <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
            </svg>
          </button>
        </div>
      </TableCell>
    </TableRow>
  )
}
