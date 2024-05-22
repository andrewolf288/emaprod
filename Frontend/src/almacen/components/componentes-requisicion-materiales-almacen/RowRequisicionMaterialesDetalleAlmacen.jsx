import React from 'react'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { mostrarMesYAnio } from '../../../utils/functions/FormatDate'
import { CustomDialogUpdateOperation } from '../../../components/CustomComponents/CustomDialogUpdateOperation'
import { CustomDialogDeleteOperation } from '../../../components/CustomComponents/CustomDialogDeleteOperation'
import { CustomDialogConfirmOperation } from '../../../components/CustomComponents/CustomDialogConfirmOperation'
import { BuscarLoteProductoFinal } from '../../../components/CommonComponents/buscadores/BuscarLoteProductoFinal'
import { BuscarLoteProduccion } from '../../../components/CommonComponents/buscadores/BuscarLoteProduccion'

export const RowRequisicionMaterialesDetalleAlmacen = ({
  detalle,
  onUpdateDetalleRequisicion,
  onDeleteDetalleRequisicion,
  onCreateSalida,
  onChangeLoteProduccion
}) => {
  const { idProdc, codLotProd, fecVenLotProd, esProFin } = detalle
  const parseLote = idProdc === null ? 'Sin lote' : `${codLotProd} - ${mostrarMesYAnio(fecVenLotProd)}`

  const auxChangeLoteProduccion = (index, data) => {
    onChangeLoteProduccion(detalle, data)
  }

  return (
    <TableRow>
      <TableCell>
        {parseLote}
        {esProFin === 1
          ? (<BuscarLoteProductoFinal
            dataDetalle={detalle}
            handleConfirm={auxChangeLoteProduccion}
          />)
          : (<BuscarLoteProduccion
            dataDetalle={detalle}
            handleConfirm={auxChangeLoteProduccion}
          />) }
        {/* <SearchCreationLoteProduccionDestino dataDetalle={detalle} handleConfirm={auxChangeLoteProduccion}/> */}
      </TableCell>
      <TableCell>{detalle.nomProd}</TableCell>
      <TableCell>
        <span
          className={
            detalle.fueCom === 0
              ? 'badge text-bg-danger p-2'
              : 'badge text-bg-success p-2'
          }
        >
          {detalle.fueCom === 0 ? 'Requerido' : 'Completado' }
        </span>
      </TableCell>
      <TableCell>{detalle.simMed}</TableCell>
      <TableCell align="center">{detalle.canReqMatDet}</TableCell>
      <TableCell>
        <div className="btn-toolbar d-flex justify-content-center">
          <CustomDialogUpdateOperation
            detalle={detalle}
            disabled={detalle.fueCom !== 0}
            onUpdateOperation={onUpdateDetalleRequisicion}
            formato={{
              nombre: 'nomProd',
              cantidad: 'canReqMatDet',
              medida: 'simMed'
            }}
          />
          <CustomDialogDeleteOperation
            detalle={detalle}
            disabled={detalle.fueCom !== 0}
            onDeleteOperation={onDeleteDetalleRequisicion}
            formato={{
              nombre: 'nomProd',
              cantidad: 'canReqMatDet',
              medida: 'simMed'
            }}
          />
          <CustomDialogConfirmOperation
            detalle={detalle}
            disabled={detalle.fueCom !== 0}
            onConfirmOperation={onCreateSalida}
            formato={{
              nombre: 'nomProd',
              cantidad: 'canReqMatDet',
              medida: 'simMed'
            }}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}
