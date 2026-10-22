export const PROTECTED: readonly RegExp[] = [
  /(^|\/)\.env(\.|$)/,
  /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/,
]

export const protectedReason = (path: string) =>
  PROTECTED.some(pattern => pattern.test(path)) ? `${path} is protected: edit it by hand or turn the guard off` : null

export const shortCommand = (command: string, max = 40) => {
  const line = command.trim().split('\n')[0] ?? ''
  return line.length > max ? `${line.slice(0, max - 1)}…` : line
}

export type Toggle = 'on' | 'off' | 'show' | 'invalid'

export const parseToggle = (args: string): Toggle => {
  const arg = args.trim().toLowerCase()
  if (arg === '') return 'show'
  return arg === 'on' || arg === 'off' ? arg : 'invalid'
}
