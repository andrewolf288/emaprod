import { ActualizarFormulaEmpaquetadoPromocional } from './ActualizarFormulaEmpaquetadoPromocional'
import { AgregarFormulaEmpaquetadoPromocional } from './AgregarFormulaEmpaquetadoPromocional'
import { ListFormulaEmpaquetadoPromocional } from './ListFormulaEmpaquetadoPromocional'

export const RouterFormulaEmpaquetadoPromocional = [
  {
    path: '',
    element: <ListFormulaEmpaquetadoPromocional />
  },
  {
    path: 'crear',
    element: <AgregarFormulaEmpaquetadoPromocional />
  },
  {
    path: 'actualizar/:idForEmpProm',
    element: <ActualizarFormulaEmpaquetadoPromocional />
  }
]
