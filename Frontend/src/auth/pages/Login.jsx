import React, { useState } from "react";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { consultUser } from "./../helpers/consultUser";
import { useAuth } from "../../hooks/useAuth";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const Login = () => {
  // FUNCTION LOGIN
  const { login } = useAuth();

  // NAVEGACION
  const navigate = useNavigate();

  const [user, setuser] = useState({
    useUsu: "",
    pasUsu: "",
  });

  const { useUsu, pasUsu } = user;

  // CONTROLADOR DE FORMULARIO
  const handledForm = ({ target }) => {
    const { name, value } = target;
    setuser({
      ...user,
      [name]: value,
    });
  };

  // ESTADO PARA CONTROLAR EL FEEDBACK
  const [feedbackCreate, setfeedbackCreate] = useState(false);
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: "",
    feedback_description_error: "",
  });
  const { style_message, feedback_description_error } = feedbackMessages;

  // MANEJADORES DE FEEDBACK
  const handleClickFeeback = () => {
    setfeedbackCreate(true);
  };

  const handleCloseFeedback = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setfeedbackCreate(false);
  };

  // ESTADO PARA BOTON CREAR
  const [disableButton, setdisableButton] = useState(false);

  // LOGIN USUARIO
  const loginUser = async (user) => {
    const { message_error, description_error, result } = await consultUser(
      user
    );
    if (message_error.length === 0) {
      // FUNCION DE LOGEO
      login(result);
    } else {
      console.log("No se pudo logear al usuario");
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
    setdisableButton(false);
  };

  // SUBMIT DE LOGIN
  const submitLogin = (e) => {
    e.preventDefault();
    // COMPROBAMOS EL ENVIO DE DATA
    if (useUsu.length === 0 || pasUsu.length === 0) {
      // MANEJAMOS FORMULARIOS INCOMPLETOS
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: "Asegurese de llenar los datos requeridos",
      });
      handleClickFeeback();
    } else {
      setdisableButton(true);
      loginUser(user);
    }
  };

  return (
    <>
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="container">
          <div className="row d-flex justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="border border-3 border-primary"></div>
              <div className="card bg-white shadow-lg">
                <div className="card-body p-5">
                  <form className="mb-3 mt-md-4">
                    <h2 className="fw-bold mb-2 text-uppercase ">Login</h2>
                    <p className=" mb-5">
                      Por favor ingresa tu usuario y contraseña!
                    </p>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label ">
                        Username
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={useUsu}
                        name="useUsu"
                        onChange={handledForm}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label ">
                        Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        value={pasUsu}
                        name="pasUsu"
                        onChange={handledForm}
                      />
                    </div>
                    <div className="d-grid">
                      <button
                        onClick={(e) => submitLogin(e)}
                        className="btn btn-outline-dark"
                        type="submit"
                      >
                        Login
                      </button>
                    </div>
                  </form>
                  <div>
                    <p className="mb-0  text-center">
                      ¿Quieres regresar al Home?{" "}
                      <Link to={"/"} className="text-primary fw-bold">
                        Home
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* FEEDBACK AGREGAR MATERIA PRIMA */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={feedbackCreate}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={style_message}
          sx={{ width: "100%" }}
        >
          {feedback_description_error}
        </Alert>
      </Snackbar>
    </>
  );
};
