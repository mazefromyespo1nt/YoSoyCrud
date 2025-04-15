import React, { useState } from "react";
import "../estilos_login.css";
import config from "../config.json"; 

const LoginModal: React.FC = () => {
  const [step, setStep] = useState<"login" | "password" | "resetPassword" | "register" | "registerPassword" | "verifyCode">("login");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // validar email con expresión regular
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|mx|es|info|co.uk|us|ar|br|cl|pe|uy)$/;
    return emailRegex.test(email);
  };

  // registopr: Crear usuario y enviar código de verificación
  const handleRegister = async () => {
    if (!validateEmail(email)) {
      setEmailError("Por favor, ingresa un correo válido.");
      return;
    }

    setIsLoading(true);
    const response = await fetch(config.SERVER_REGISTRO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nombre: "Usuario" })
    });

    const data = await response.json();
    setIsLoading(false);

    if (data.success) {
      setStep("verifyCode"); // si el registro es exitoso, pasar al modal 6
    } else {
      setEmailError(data.message || "Error en el registro.");
    }
  };

  // verificacion Comprobar el código ingresado
  const handleVerifyCode = async () => {
    setIsLoading(true);
    const response = await fetch(config.SERVER_VALIDAR_CODIGO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, codigo: verificationCode })
    });

    const data = await response.json();
    setIsLoading(false);

    if (data.success) {
      alert("✅ Cuenta verificada con éxito. Ahora puedes iniciar sesión.");
      setStep("login"); // redirigir a login después de la verificación
    } else {
      alert(data.message || "❌ Código incorrecto. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="modal fade" id="loginModal" tabIndex={-1} aria-labelledby="loginModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="loginModalLabel">
              {step === "login"
                ? "Iniciar sesión para descargar"
                : step === "password"
                ? "Introduce tu contraseña"
                : step === "resetPassword"
                ? "Restablece tu contraseña"
                : step === "register"
                ? "Crear una cuenta"
                : step === "verifyCode"
                ? "Consulta tu bandeja de entrada"
                : "Crea tu cuenta"}
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>

          <div className="modal-body">
            {/* Modal 1: inciiar sersion */}
            {step === "login" && (
              <>
                <input
                  type="email"
                  className={`form-control mb-3 ${emailError ? "is-invalid" : ""}`}
                  placeholder="Dirección de correo electrónico*"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  onBlur={() => {
                    if (!validateEmail(email)) {
                      setEmailError("Por favor, ingresa un correo válido.");
                    }
                  }}
                />
                {emailError && <div className="invalid-feedback">{emailError}</div>}

                <button className="btn btn-primary w-100 mb-2" onClick={() => setStep("password")} disabled={!email || !!emailError}>
                  Continuar
                </button>
                <p className="text-center">
                  ¿No tienes cuenta? <a href="#" onClick={() => setStep("register")}>Regístrate</a>
                </p>
                <hr />
                {/* Botones de Google y Facebook */}
                <button className="btn btn-social w-100 mb-2 d-flex align-items-center">
                  <img src="/assets/google.svg" alt="Google" className="me-2" />
                  Continuar con Google
                </button>
                <button className="btn btn-social w-100 d-flex align-items-center">
                  <img src="/assets/facebook.svg" alt="Facebook" className="me-2" />
                  Continuar con Facebook
                </button>
              </>
            )}

            {/* Modal 4 registrarse */}
            {step === "register" && (
              <>
                <input
                  type="email"
                  className={`form-control mb-3 ${emailError ? "is-invalid" : ""}`}
                  placeholder="Dirección de correo electrónico*"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  onBlur={() => {
                    if (!validateEmail(email)) {
                      setEmailError("Por favor, ingresa un correo válido.");
                    }
                  }}
                />
                {emailError && <div className="invalid-feedback">{emailError}</div>}

                <button className="btn btn-primary w-100 mb-2" onClick={() => setStep("registerPassword")} disabled={!email || !!emailError}>
                  Continuar
                </button>
                <hr />
                <button className="btn btn-social w-100 mb-2 d-flex align-items-center">
                  <img src="/assets/google.svg" alt="Google" className="me-2" />
                  Continuar con Google
                </button>
                <button className="btn btn-social w-100 d-flex align-items-center">
                  <img src="/assets/facebook.svg" alt="Facebook" className="me-2" />
                  Continuar con Facebook
                </button>
              </>
            )}

            {/* MODAL 5 crear contraseña*/}
            {step === "registerPassword" && (
              <>
                <input type="email" className="form-control mb-3" value={email} readOnly />

                <div className="input-group mb-3">
                  <input type={showPassword ? "text" : "password"} className="form-control" placeholder="Contraseña*" onChange={(e) => setPassword(e.target.value)} />
                  <button className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>

                <button className="btn btn-primary w-100 mb-2" onClick={handleRegister} disabled={isLoading}>
                  {isLoading ? "Registrando..." : "Continuar"}
                </button>
              </>
            )}

            {/* MODAL 6 verficicacion de codigo */}
            {step === "verifyCode" && (
              <>
                <p className="text-center">Introduce el código de verificación enviado a <strong>{email}</strong>.</p>
                <input type="text" className="form-control mb-3" placeholder="Código de verificación" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />

                <button className="btn btn-primary w-100 mb-2" onClick={handleVerifyCode} disabled={isLoading}>
                  {isLoading ? "Verificando..." : "Continuar"}
                </button>

                <p className="text-center">
                  <a href="#" onClick={() => console.log("Reenviar código")}>Reenviar correo electrónico</a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
