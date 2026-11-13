// Único punto de autenticación. Hoy devuelve un invitado anónimo.
//
// Para añadir login más adelante (JWT/OAuth), solo hay que cambiar esta función:
// leer el token (cabecera, cookie o ?token=), verificarlo y devolver
//   { id: <id estable>, nick: <apodo verificado o null>, role: 'user' }
// o lanzar/devolver null para rechazar la conexión (el Worker responde 401).
// Si devuelves `nick`, el servidor lo usa e ignora el apodo que envíe el cliente.
export async function authenticate(request, env) {
  return { id: crypto.randomUUID(), nick: null, role: 'guest' }
}
