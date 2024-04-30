import React from 'react'
import { useRequisicionGeneralMateriales } from '../../hooks/requisicion-general-materiales/useRequisicionGeneralMateriales'
import { Link } from 'react-router-dom'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { RowRequisicionGeneralMateriales } from '../../components/requisicion-materiales/RowRequisicionGeneralMateriales'
import { CustomFilterDateRange } from '../../../components/CustomComponents/CustomFilterDateRange'
import { CustomLoading } from '../../../components/CustomComponents/CustomLoading'

export const ListRequisicionGeneralMateriales = () => {
  const {
    requisicionMateriales,
    generatePDFRequisicionMateriales,
    loading,
    dateState,
    handleStartDateChange,
    handleEndDateChange
  } = useRequisicionGeneralMateriales()

  return (
    <>
      <div className="container-fluid">
        <div className="row d-flex mt-4">
          <CustomFilterDateRange
            dateState={dateState}
            handleStartDateChange={handleStartDateChange}
            handleEndDateChange={handleEndDateChange}
          />
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
                <TableCell align="left" width={50}>
                  <b>Código requisición</b>
                </TableCell>
                <TableCell align="center" width={100}>
                  <b>Estado</b>
                </TableCell>
                <TableCell align="center" width={200}>
                  <b>Motivo requisición</b>
                </TableCell>
                <TableCell align="center" width={70}>
                  <b>Área</b>
                </TableCell>
                <TableCell align="center" width={50}>
                  <b>Fecha requerimiento</b>
                </TableCell>
                <TableCell align="left" width={150}>
                  <b>Acciones</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                requisicionMateriales.map((item) => (
                  <RowRequisicionGeneralMateriales key={item.id}
                    item={item}
                    onGeneratePDF={generatePDFRequisicionMateriales}
                  />
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      {/* LOADING */}
      <CustomLoading
        open={loading}
      />
    </>
  )
}
