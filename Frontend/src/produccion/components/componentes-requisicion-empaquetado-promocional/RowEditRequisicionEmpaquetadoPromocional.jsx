import { IconButton, TableCell, TableRow, TextField } from '@mui/material'
import React, { useState } from 'react'
import { mostrarMesYAnio } from '../../../utils/functions/FormatDate'
import { SearchCreationLoteProduccion } from '../../../components/CommonComponents/LoteProduccion/SearchCreationLoteProduccion'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'

export const RowEditRequisicionEmpaquetadoPromocional = (
  {
    item,
    onEdit,
    onDelete,
    onAddLoteProduccion,
    onRemoveLoteProduccion
  }
) => {
  const [disabledInput, setdisabledInput] = useState(true)
  const { codLotProd, fecVenLotProd, idProdc } = item
  const textInfoLote = codLotProd.length === 0 && fecVenLotProd.length === 0 ? 'FIFO' : `${codLotProd} - ${mostrarMesYAnio(fecVenLotProd)}`

  const auxAddLoteProduccion = (index, result) => {
    onAddLoteProduccion(item.idProdt, result)
  }

  return (
    <TableRow>
      <TableCell>{item.codProd2}</TableCell>
      <TableCell>{item.desCla}</TableCell>
      {item.esMatReq === 0 &&
      <TableCell>
        <span className='me-2'>{textInfoLote}</span>
        {
          idProdc === null
            ? (
              <SearchCreationLoteProduccion
                dataDetalle={item}
                handleConfirm={auxAddLoteProduccion}/>
            )
            : (
              <IconButton
                color="error"
                onClick={() => { onRemoveLoteProduccion(item.idProdt) }}
              >
                <CancelRoundedIcon fontSize="large" />
              </IconButton>
            )
        }
      </TableCell>
      }
      <TableCell>{item.nomProd}</TableCell>
      <TableCell align='center'>{item.canReqEmpPromUnd}</TableCell>
      <TableCell>
        <div className="d-inline-flex align-items-center">
          <TextField
            size="small"
            onChange={(e) => {
              onEdit(e, item.idProdt)
            }}
            type="number"
            name="inputCantidad"
            value={item.canReqEmpPromDet}
            disabled={disabledInput}
          />
          <label className="ms-2">{item.simMed}</label>
        </div></TableCell>
      <TableCell>
        <div className="btn-toolbar d-flex justify-content-center">
          <button
            onClick={() => {
              setdisabledInput(!disabledInput)
            }}
            className="btn btn-warning me-2"
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
              onDelete(item.idProdt)
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
