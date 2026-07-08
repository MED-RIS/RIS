export const obtenerParentesco = (codigoIdentificador: number | string, nombreParentesco?: string): string => {
  if (nombreParentesco && nombreParentesco.trim() !== "") {
    return nombreParentesco;
  }

  const cod = String(codigoIdentificador).trim();
  if (!cod || cod === "undefined" || cod === "null") {
    return "No especificado";
  }

  return `Beneficiario (Cod: ${cod})`;
};