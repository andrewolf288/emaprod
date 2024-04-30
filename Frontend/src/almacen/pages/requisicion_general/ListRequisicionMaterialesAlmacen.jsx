import React from 'react'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useRequisicionMaterialesAlmacen } from '../../hooks/requisicion-materiales/useRequisicionMaterialesAlmacen'
import { RowRequisicionesGeneralMaterialesAlmacen } from '../../components/componentes-requisicion-materiales-almacen/RowRequisicionesGeneralMaterialesAlmacen'
import { CustomFilterDateRange } from '../../../components/CustomComponents/CustomFilterDateRange'
import { CustomLoading } from '../../../components/CustomComponents/CustomLoading'

export const ListRequisicionMaterialesAlmacen = () => {
  const {
    requisicionMateriales,
    loading,
    dateState,
    handleStartDateChange,
    handleEndDateChange
  } = useRequisicionMaterialesAlmacen()

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
                <TableCell align="left" width={50}>
                  <strong>Código requisición</strong>
                </TableCell>
                <TableCell align="center" width={100}>
                  <strong>Estado Requisición</strong>
                </TableCell>
                <TableCell align="center" width={100}>
                  <strong>Devoluciones</strong>
                </TableCell>
                <TableCell align="center" width={200}>
                  <strong>Motivo requisición</strong>
                </TableCell>
                <TableCell align="center" width={70}>
                  <strong>Área</strong>
                </TableCell>
                <TableCell align="center" width={50}>
                  <strong>Fecha requerimiento</strong>
                </TableCell>
                <TableCell align="center" width={150}>
                  <strong>Acciones</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                requisicionMateriales.map((item) => (
                  <RowRequisicionesGeneralMaterialesAlmacen key={item.id}
                    item={item}
                  />
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <CustomLoading
        open={loading}
      />
    </>
  )
}
