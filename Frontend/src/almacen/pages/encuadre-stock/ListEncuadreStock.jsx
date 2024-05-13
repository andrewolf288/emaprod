import React from 'react'
import { useOperacionEncuadreStock } from '../../hooks/encuadre-stock/useOperacionEncuadreStock'
import { CustomFilterDateRange } from '../../../components/CustomComponents/CustomFilterDateRange'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { CustomLoading } from '../../../components/CustomComponents/CustomLoading'
import { RowOperacionEncuadreStock } from '../../components/componentes-encuadre/RowOperacionEncuadreStock'

export const ListEncuadreStock = () => {
  const {
    dateState,
    handleEndDateChange,
    handleStartDateChange,
    loading,
    operacionesEncuadreStock
  } = useOperacionEncuadreStock()
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
                <TableCell align="left" width={15} sx={{ fontWeight: 'bold' }}>
                  #
                </TableCell>
                <TableCell align="left" width={40} sx={{ fontWeight: 'bold' }}>
                  Código almacén
                </TableCell>
                <TableCell align="center" width={70} sx={{ fontWeight: 'bold' }}>
                  Nombre almacén
                </TableCell>
                <TableCell align="left" width={100} sx={{ fontWeight: 'bold' }}>
                  Fecha operación
                </TableCell>
                <TableCell align="center" width={70} sx={{ fontWeight: 'bold' }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                operacionesEncuadreStock.map((element, index) => (
                  <RowOperacionEncuadreStock
                    key={element.id}
                    item={element}
                    index = {index}
                  />
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
