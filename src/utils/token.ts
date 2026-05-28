export const tiposUsuario = (): string => {
  const localStr = localStorage.getItem('usuario');
  const session = localStr ? JSON.parse(localStr) : null;
  return session && session.user ? String(session.user.role) : '';
};

export function getAuthHeaders() {
  const localStr = localStorage.getItem('usuario');
  const session = localStr ? JSON.parse(localStr) : null;
  const token = session?.token;

  if (token) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  } else {
    return {
      'Content-Type': 'application/json',
    };
  }
}
