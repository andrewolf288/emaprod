import ListMateriaPrima from "./ListMateriaPrima";
import AgregarMateriaPrima from "./AgregarMateriaPrima";
import ActualizarMateriaPrima from "./ActualizarMateriaPrima";

export const RouterAlmacenMateriaPrima = [
  {
    path: "",
    element: <ListMateriaPrima />,
  },
  {
    path: "crear",
    element: <AgregarMateriaPrima />,
  },
  {
    path: "actualizar/:id",
    element: <ActualizarMateriaPrima />,
  },
];
