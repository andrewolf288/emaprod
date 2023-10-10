import { Navigate, useOutlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import NavProduccion from "./../produccion/components/NavProduccion";

export const ProtectedLayoutProduccion = () => {
  // OBTENEMOS INFORMACION DEL LOCALSTORAGE
  const { user } = useAuth();
  const outlet = useOutlet();

  if (!user) {
    return <Navigate to={"/login"} />;
  } else {
    const { idAre } = user;
    //console.log(user)
    if (idAre !== 4) {
      return <Navigate to={"/login"} />;
    }
  }
  return (
    <>
      <NavProduccion />
      <main>{outlet}</main>
      <footer></footer>;
    </>
  );
};
