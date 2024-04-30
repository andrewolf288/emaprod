import React from 'react'
import { useRequisicionesEmpaquetadoPromocionalAlmacen } from '../../hooks/requisicion-emapaquetado-promocional/useRequisicionesEmpaquetadoPromocionalAlmacen'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { RowRequisicionEmpaquetadoPromocionalAlmacen } from '../../components/componentes-requisicion-empaquetado-promocional/RowRequisicionEmpaquetadoPromocionalAlmacen'
import { CustomFilterDateRange } from '../../../components/CustomComponents/CustomFilterDateRange'
import { CustomLoading } from '../../../components/CustomComponents/CustomLoading'

export const ListRequisicionEmpaquetadoPromocionalAlmacen = () => {
  const {
    requisicionesEmpaquetadoPromocional,
    loading,
    dateState,
    handleStartDateChange,
    handleEndDateChange
  } = useRequisicionesEmpaquetadoPromocionalAlmacen()

  return (
    <>
      <div className="container-fluid">
        <div className="row d-flex mt-4">
          <CustomFilterDateRange
            dateState={dateState}
            handleStartDateChange={handleStartDateChange}
            handleEndDateChange={handleEndDateChange}
          />
        </div>
        {/* TABLA DE CONTENIDO */}
        <TableContainer component={Paper} className='mt-4'>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow
                sx={{
                  '& th': {
                    color: 'rgba(96, 96, 96)',
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                <TableCell align="left" width={100} sx={{ fontWeight: 'bold' }}>
                  Correlativo
                </TableCell>
                <TableCell align="left" width={40} sx={{ fontWeight: 'bold' }}>
                  Estado
                </TableCell>
                <TableCell align="center" width={40} sx={{ fontWeight: 'bold' }}>
                  Ingresos
                </TableCell>
                <TableCell align="left" width={200} sx={{ fontWeight: 'bold' }}>
                  Producto
                </TableCell>
                <TableCell align="center" width={70} sx={{ fontWeight: 'bold' }}>
                  Cantidad
                </TableCell>
                <TableCell align="center" width={70} sx={{ fontWeight: 'bold' }}>
                  Fecha creación
                </TableCell>
                <TableCell align="center" width={70} sx={{ fontWeight: 'bold' }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                requisicionesEmpaquetadoPromocional.map((element) => (
                  <RowRequisicionEmpaquetadoPromocionalAlmacen
                    key={element.id}
                    item={element} />
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      {/* DIALOG DE LOADING */}
      <CustomLoading
        open={loading}
      />
    </>
  )
}
