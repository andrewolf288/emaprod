import { ListAgregacion } from "./ListAgregacion";
import { AgregarAgregacionV2 } from "./AgregarAgregacionV2";
import { RequisicionAgregaciones } from "./RequisicionAgregaciones";

export const RouterAlmacenAgregaciones = [
  {
    path: "",
    element: <ListAgregacion />,
  },
  {
    path: "crear",
    element: <AgregarAgregacionV2 />,
  },
  {
    path: "atender-requisiciones",
    element: <RequisicionAgregaciones />,
  },
];
