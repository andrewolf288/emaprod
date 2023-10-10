import { ListFormulas } from "./ListFormulas";
import { AgregarFormula } from "./AgregarFormula";
import { ActualizarFormula } from "./ActualizarFormula";

export const RouterMoliendaFormula = [
  {
    path: "",
    element: <ListFormulas />,
  },
  {
    path: "crear",
    element: <AgregarFormula />,
  },
  {
    path: "actualizar/:idFor",
    element: <ActualizarFormula />,
  },
];
