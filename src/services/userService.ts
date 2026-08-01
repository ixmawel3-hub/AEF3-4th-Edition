import usuariosData from '../data/usuarios.json'

type RegisteredUser = {
  email: string
  role?: 'teacher' | 'student'
  livros?: string[]
}

// Returns a RegisteredUser if found. Supports two legacy formats:
// - array of strings (emails) -> treated as students (no explicit role)
// - array of objects { email, role?, livros? }
export const findUserByEmail = (email: string): RegisteredUser | undefined => {
  const normalizedEmail = email.trim().toLowerCase()
  const users: any = usuariosData.usuarios
  if (!users) return undefined

  // array of objects
  if (users.length && typeof users[0] === 'object') {
    const u = (users as any[]).find((user) => (user.email || '').toLowerCase() === normalizedEmail)
    return u as RegisteredUser | undefined
  }

  // legacy: array of emails (strings)
  const found = (users as string[]).find((u) => typeof u === 'string' && u.toLowerCase() === normalizedEmail)
  if (found) return { email: found, role: 'student', livros: [] }
  return undefined
}
