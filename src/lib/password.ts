import bcrypt from "bcryptjs";

/**
 * Normaliza la contraseña antes de compararla o guardarla.
 * Se recorta el espacio en blanco de los extremos (al copiar y pegar se cuela con
 * mucha facilidad y dejaría a la persona fuera del panel sin explicación alguna)
 * y se unifica la forma Unicode, de modo que los caracteres escritos de dos
 * maneras distintas —por ejemplo paréntesis de ancho completo— coincidan.
 */
export function normalizePassword(password: string) {
  return password.normalize("NFKC").trim();
}

export function hashPassword(password: string) {
  return bcrypt.hashSync(normalizePassword(password), 10);
}

export function verifyPassword(password: string, hash: string) {
  const candidate = normalizePassword(password);
  if (bcrypt.compareSync(candidate, hash)) return true;
  // Compatibilidad con contraseñas guardadas antes de normalizar.
  return password !== candidate && bcrypt.compareSync(password, hash);
}
