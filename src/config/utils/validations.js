export const validarObligatorio = (valor) => {
  return typeof valor === 'string' && valor.trim().length > 0;
};

export const validarCorreo = (correo) => {
  if (typeof correo !== 'string') {
    return false;
  }

  const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return formatoCorreo.test(correo.trim());
};

export const validarContrasena = (contrasena) => {
  if (typeof contrasena !== 'string') {
    return false;
  }

  const tieneLongitudMinima = contrasena.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(contrasena);
  const tieneMinuscula = /[a-z]/.test(contrasena);
  const tieneNumero = /[0-9]/.test(contrasena);
  const tieneEspecial = /[^A-Za-z0-9\s]/.test(contrasena);

  return (
    tieneLongitudMinima &&
    tieneMayuscula &&
    tieneMinuscula &&
    tieneNumero &&
    tieneEspecial
  );
};

export const coincidenContrasenas = (contrasena,confirmacion) => {
  return (
    typeof contrasena === 'string' &&
    typeof confirmacion === 'string' &&
    contrasena === confirmacion
  );
};