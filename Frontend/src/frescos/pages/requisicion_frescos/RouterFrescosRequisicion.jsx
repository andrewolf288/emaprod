import { ListRequisicionesFrescos } from "./ListRequisicionesFrescos";
import { AgregarRequisicionFrescos } from "./AgregarRequisicionFrescos";
export const RouterFrescosRequisicion = [
  {
    path: "",
    element: <ListRequisicionesFrescos />,
  },
  {
    path: "crear",
    element: <AgregarRequisicionFrescos />,
  },
];
