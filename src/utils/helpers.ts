export const obtenerCodigoBeneficiarioTexto = (codigoIdentificador: number | string, nombreTexto?: string): string => {
  if (nombreTexto && nombreTexto.trim() !== "") {
    return nombreTexto;
  }

  const cod = String(codigoIdentificador).trim();
  if (!cod || cod === "undefined" || cod === "null") {
    return "No especificado";
  }

  return `Cod: ${cod}`;
};