/**
 * Utility to check if a user is an authorized Super Admin / Platform Developer
 */

const DEFAULT_ADMIN_EMAILS = [
  'akachaiha@gmail.com',
]

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  
  const normalized = email.trim().toLowerCase()
  
  // Check default list
  if (DEFAULT_ADMIN_EMAILS.includes(normalized)) {
    return true
  }

  // Check optional environment variable list (comma separated)
  const envEmails = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
    : []

  return envEmails.includes(normalized)
}
