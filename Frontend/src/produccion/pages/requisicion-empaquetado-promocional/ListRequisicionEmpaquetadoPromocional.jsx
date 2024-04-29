import React from 'react'
import { useRequisicionesEmpaquetadoPromocional } from '../../hooks/requisicion-empaquetado-promocional/useRequisicionesEmpaquetadoPromocional.'
import { Link } from 'react-router-dom'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { RowRequisicionEmpaquetadoPromocional } from '../../components/componentes-requisicion-empaquetado-promocional/RowRequisicionEmpaquetadoPromocional'
import { CustomLoading } from '../../../components/CustomComponents/CustomLoading'
import { CustomFilterDateRange } from '../../../components/CustomComponents/CustomFilterDateRange'

export const ListRequisicionEmpaquetadoPromocional = () => {
  const {
    requisicionesEmpaquetadoPromocional,
    exportPDFRequisicionTransformacion,
    loading,
    dateState,
    handleEndDateChange,
    handleStartDateChange
  } = useRequisicionesEmpaquetadoPromocional()

  return (
    <>
      <div className="container-fluid">
        <div className="row d-flex mt-4">
          {/* custom filter date */}
          <CustomFilterDateRange
            dateState={dateState}
            handleStartDateChange={handleStartDateChange}
            handleEndDateChange={handleEndDateChange}
          />
          {/* seccion de creación de requisición */}
          <div className="col-6 d-flex justify-content-end align-items-center">
            <div className="row me-4">
              <Link
                to={'crear'}
                className="btn btn-primary"
              >
                Crear requisición
              </Link>
            </div>
          </div>
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
                <TableCell align="left" width={120} sx={{ fontWeight: 'bold' }}>
                  Correlativo
                </TableCell>
                <TableCell align="left" width={200} sx={{ fontWeight: 'bold' }}>
                  Producto
                </TableCell>
                <TableCell align="center" width={30} sx={{ fontWeight: 'bold' }}>
                  Medida
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
                requisicionesEmpaquetadoPromocional.map((item) => (
                  <RowRequisicionEmpaquetadoPromocional
                    key={item.id}
                    item={item}
                    exportPDFRequisicionTransformacion={exportPDFRequisicionTransformacion}
                  />
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <CustomLoading open={loading}/>
    </>
  )
}
