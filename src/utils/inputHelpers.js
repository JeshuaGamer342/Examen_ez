/**
 * inputHelpers.js — Utilidades reutilizables para inputs
 *
 * Uso:
 *   import { toTitleCase, onlyLetters, onlyPositiveInt } from '../utils/inputHelpers'
 */

/**
 * Capitalización automática tipo "Nombre Apellido"
 * Convierte "jorGe ramirez" → "Jorge Ramirez"
 */
export function toTitleCase(value) {
  return value
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]/g, '') // solo letras, espacios, guiones y apóstrofes
    .replace(/\s+/g, ' ')                           // espacios múltiples → uno
    .replace(/\b\w/g, c => c.toUpperCase())         // primera letra de cada palabra en mayúscula
}

/**
 * Handler para inputs de nombre — bloquea números y capitaliza automáticamente
 */
export function handleNameInput(e, setter, errorSetter, fieldName) {
  const raw   = e.target.value
  const clean = toTitleCase(raw)
  setter(clean)
  if (errorSetter && fieldName) errorSetter(prev => ({ ...prev, [fieldName]: '' }))
}

/**
 * Handler para inputs de cantidad — solo enteros positivos (sin 0, sin negativos)
 */
export function handlePositiveInt(e, setter) {
  const val = e.target.value.replace(/[^0-9]/g, '')  // solo dígitos
  if (val === '' || Number(val) > 0) setter(val)       // vacío permitido mientras escribe
}

/**
 * Validaciones comunes
 */
export const validators = {
  name: (value) => {
    if (!value.trim())                        return 'El nombre es requerido'
    if (value.trim().length < 3)              return 'Mínimo 3 caracteres'
    if (/\d/.test(value))                     return 'El nombre no puede contener números'
    return ''
  },
  email: (value) => {
    if (!value.trim())                        return 'El correo es requerido'
    if (!/\S+@\S+\.\S+/.test(value))         return 'Correo inválido'
    return ''
  },
  positiveNumber: (value, label = 'El valor') => {
    if (!value || value === '')               return `${label} es requerido`
    if (Number(value) <= 0)                   return `${label} debe ser mayor a 0`
    return ''
  },
}
