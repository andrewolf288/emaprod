import { ListRequisicionesEnvasado } from "./ListRequisicionesEnvasado";
import { AgregarRequisicionEnvasado } from "./AgregarRequisicionEnvasado";
export const RouterEnvasadoRequisicion = [
  {
    path: "",
    element: <ListRequisicionesEnvasado />,
  },
  {
    path: "crear",
    element: <AgregarRequisicionEnvasado />,
  },
];
