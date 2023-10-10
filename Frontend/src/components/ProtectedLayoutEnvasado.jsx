import { Navigate, useOutlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import NavEnvasado from "./../envasado/components/NavEnvasado";

export const ProtectedLayoutEnvasado = () => {
  // OBTENEMOS INFORMACION DEL LOCALSTORAGE
  const { user } = useAuth();
  const outlet = useOutlet();
  if (!user) {
    return <Navigate to={"/login"} />;
  } else {
    const { idAre } = user;
    if (idAre !== 5) {
      return <Navigate to={"/login"} />;
    }
  }
  return (
    <>
      <NavEnvasado />
      <main>{outlet}</main>
      <footer></footer>;
    </>
  );
};
