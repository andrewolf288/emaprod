import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { TextField } from '@mui/material'
// import Checkbox from '@mui/material/Checkbox'
import { Link } from 'react-router-dom'
import VisibilityIcon from '@mui/icons-material/Visibility'
import IconButton from '@mui/material/IconButton'
import { CustomFilterDateRange } from '../../../components/CustomComponents/CustomFilterDateRange'
import { useCreateEntradaStock } from '../../hooks/entrada-stock/useCreateEntradaStock'
import { CustomLoading } from '../../../components/CustomComponents/CustomLoading'
import { FilterAllProductosDynamic } from '../../../components/ReferencialesFilters/Producto/FilterAllProductosDynamic'
import { FilterProveedorDynamic } from '../../../components/ReferencialesFilters/Proveedor/FilterProveedorDynamic'
import { FilterAlmacenDynamic } from '../../../components/ReferencialesFilters/Almacen/FilterAlmacenDynamic'

const ListEntradaStock = () => {
  const
    {
      loading,
      dateState,
      handleStartDateChange,
      handleEndDateChange,
      dataEntSto,
      filterInputs,
      onChangeProducto,
      onChangeProveedor,
      onChangeAlmacen,
      handleFormFilter,
      cleanFilter
    } = useCreateEntradaStock()

  return (
    <>
      <div className="container-fluid">
        <div className="row d-flex mt-4">
          <CustomFilterDateRange
            dateState={dateState}
            handleStartDateChange={handleStartDateChange}
            handleEndDateChange={handleEndDateChange}
          />
          <div className="col-6 d-flex justify-content-between align-items-center">
            <button
              className='btn btn-secondary col-2 me-4'
              onClick={cleanFilter}
            >
              Borrar filtro
            </button>
            <div className="col-3 me-4">
              <Link
                to={'crear'}
                className="btn btn-primary"
              >
                Crear entrada
              </Link>
            </div>
          </div>
        </div>
        {/* TABLA DE RESULTADOS */}
        <div
          className="mt-4"
          style={{
            overflow: 'auto',
            float: 'left'
          }}
        >
          <Paper>
            <TableContainer>
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
                    <TableCell align="left" width={160}>
                      <b>Cod Lote</b>
                    </TableCell>
                    <TableCell
                      align="left"
                      width={360}
                      sx={{
                        minWidth: 300
                      }}
                    >
                      <b>Producto</b>
                      <FilterAllProductosDynamic
                        onNewInput={onChangeProducto}
                        defaultValue={filterInputs.idProd}
                      />
                    </TableCell>
                    <TableCell
                      align="left"
                      width={160}
                      sx={{
                        minWidth: 200
                      }}
                    >
                      <b>Proveedor</b>
                      <FilterProveedorDynamic
                        onNewInput={onChangeProveedor}
                        defaultValue={filterInputs.idProv}
                      />
                    </TableCell>
                    <TableCell
                      align="left"
                      width={140}
                      sx={{
                        minWidth: 200
                      }}
                    >
                      <b>Almacen</b>
                      <FilterAlmacenDynamic
                        onNewInput={onChangeAlmacen}
                        defaultValue={filterInputs.idAlm}
                      />
                    </TableCell>
                    <TableCell align="left" width={80}>
                      <b>Codigo</b>
                      <TextField
                        onChange={handleFormFilter}
                        size="small"
                        value={filterInputs.codEntSto}
                        name="codEntSto"
                        autoComplete="off"
                        InputProps={{
                          style: {
                            color: 'black',
                            background: 'white'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        minWidth: 160
                      }}
                    >
                      <b>Doc.</b>
                      <TextField
                        onChange={handleFormFilter}
                        size="small"
                        value={filterInputs.docEntSto}
                        name="docEntSto"
                        autoComplete="off"
                        InputProps={{
                          style: {
                            color: 'black',
                            background: 'white'
                          }
                        }}
                      />
                    </TableCell>

                    <TableCell
                      align="left"
                      sx={{
                        minWidth: 160
                      }}
                    >
                      <b>Orden Compra</b>
                      <TextField
                        onChange={handleFormFilter}
                        size="small"
                        value={filterInputs.ordCom}
                        name="ordCom"
                        autoComplete="off"
                        InputProps={{
                          style: {
                            color: 'black',
                            background: 'white'
                          }
                        }}
                      />
                    </TableCell>

                    <TableCell
                      align="left"
                      sx={{
                        minWidth: 160
                      }}
                    >
                      <b>Guia Remisión</b>
                      <TextField
                        name="guiRem"
                        onChange={handleFormFilter}
                        size="small"
                        value={filterInputs.guiRem}
                        autoComplete="off"
                        InputProps={{
                          style: {
                            color: 'black',
                            background: 'white'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" width={50}>
                      <b>Ingresado</b>
                      <TextField
                        onChange={handleFormFilter}
                        type="number"
                        size="small"
                        name="canTotEnt"
                        value={filterInputs.canTotEnt}
                        InputProps={{
                          style: {
                            color: 'black',
                            background: 'white'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" width={50}>
                      <b>Variacion</b>
                    </TableCell>
                    <TableCell align="left" width={50}>
                      <b>Disponible</b>
                      <TextField
                        onChange={handleFormFilter}
                        type="number"
                        size="small"
                        name="canTotDis"
                        value={filterInputs.canTotDis}
                        InputProps={{
                          style: {
                            color: 'black',
                            background: 'white'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" width={50}>
                      <b>Merma</b>
                      <TextField
                        onChange={handleFormFilter}
                        type="number"
                        size="small"
                        name="merTot"
                        value={filterInputs.merTot}
                        InputProps={{
                          style: {
                            color: 'black',
                            background: 'white'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" width={160}>
                      <b>Fecha entrada</b>
                    </TableCell>
                    <TableCell align="left" width={160}>
                      <b>Fecha vencimiento</b>
                    </TableCell>
                    <TableCell align="center" width={50}>
                      <b>Acciones</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataEntSto
                    .map((row, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {row.codLot}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {row.nomProd}
                        </TableCell>
                        <TableCell align="left">{row.nomProv}</TableCell>
                        <TableCell align="left">{row.nomAlm}</TableCell>
                        <TableCell align="left">{row.codEntSto}</TableCell>
                        <TableCell align="left">{row.docEntSto}</TableCell>
                        <TableCell align="left">{row.ordCom}</TableCell>
                        <TableCell align="left">{row.guiRem}</TableCell>
                        <TableCell align="left">{row.canTotEnt}</TableCell>
                        <TableCell align="left">{row.canVar}</TableCell>
                        <TableCell align="left">{row.canTotDis}</TableCell>
                        <TableCell align="left">{row.merTot}</TableCell>
                        <TableCell align="left">{row.fecEntSto}</TableCell>
                        <TableCell align="left">{row.fecVenEntSto}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => {
                              window.open(
                                `/almacen/entradas-stock/view/${row.idEntStock}`,
                                '_blank'
                              )
                            }}
                          >
                            <VisibilityIcon fontSize="large" color="primary" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>
      </div>
      {/* LOADING DIALOG */}
      <CustomLoading
        open={loading}
      />
    </>
  )
}

export default ListEntradaStock
