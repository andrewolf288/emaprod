import ListProveedor from "./ListProveedor";
import AgregarProveedor from "./AgregarProveedor";
import ActualizarProveedor from "./ActualizarProveedor";

export const RouterAlmacenProveedor = [
  {
    path: "",
    element: <ListProveedor />,
  },
  {
    path: "crear",
    element: <AgregarProveedor />,
  },
  {
    path: "actualizar/:id",
    element: <ActualizarProveedor />,
  },
];
