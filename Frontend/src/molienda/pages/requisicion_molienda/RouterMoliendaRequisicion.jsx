import { AgregarRequisicionMolienda } from "./AgregarRequisicionMolienda";
import { ListRequisicionesMolienda } from "./ListRequisicionesMolienda";
export const RouterMoliendaRequisicion = [
  {
    path: "",
    element: <ListRequisicionesMolienda />,
  },
  {
    path: "crear",
    element: <AgregarRequisicionMolienda />,
  },
];
