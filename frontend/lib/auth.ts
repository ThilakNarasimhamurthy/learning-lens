// Dummy authentication system
export type UserRole = 'teacher' | 'student'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

// Simulated user storage (demo students for full teacher dashboard)
const users: User[] = [
  { id: 't1', email: 'teacher@demo.com', name: 'Ms. Johnson', role: 'teacher' },
  { id: 's1', email: 'student1@demo.com', name: 'Alex Chen', role: 'student' },
  { id: 's2', email: 'student2@demo.com', name: 'Jordan Smith', role: 'student' },
  { id: 's3', email: 'student3@demo.com', name: 'Sam Rivera', role: 'student' },
  { id: 's4', email: 'student4@demo.com', name: 'Taylor Kim', role: 'student' },
]

export function login(email: string, password: string): User | null {
  // Dummy auth - any password works
  const user = users.find(u => u.email === email)
  if (user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user))
    }
    return user
  }
  return null
}

export function register(email: string, name: string, role: UserRole): User {
  const newUser: User = {
    id: `${role[0]}${users.length + 1}`,
    email,
    name,
    role
  }
  users.push(newUser)
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentUser', JSON.stringify(newUser))
  }
  return newUser
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('currentUser')
  return stored ? JSON.parse(stored) : null
}

export function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id)
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser')
  }
}
