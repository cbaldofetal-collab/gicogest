/**
 * Funções de autenticação e hash de senha
 */

/**
 * Gera hash SHA-256 de uma string
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Valida se a senha corresponde ao hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Valida formato de senha alfanumérica
 * Mínimo 6 caracteres, letras e números
 */
export function validatePasswordFormat(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'A senha deve ter no mínimo 6 caracteres',
    };
  }

  if (!/^[a-zA-Z0-9]+$/.test(password)) {
    return {
      isValid: false,
      message: 'A senha deve conter apenas letras e números (alfanumérica)',
    };
  }

  if (!/[a-zA-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'A senha deve conter pelo menos uma letra',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'A senha deve conter pelo menos um número',
    };
  }

  return { isValid: true };
}

/**
 * Valida formato do nome
 */
export function validateName(name: string): {
  isValid: boolean;
  message?: string;
} {
  if (name.trim().length < 2) {
    return {
      isValid: false,
      message: 'O nome deve ter no mínimo 2 caracteres',
    };
  }

  if (name.trim().length > 50) {
    return {
      isValid: false,
      message: 'O nome deve ter no máximo 50 caracteres',
    };
  }

  return { isValid: true };
}

/**
 * Valida formato de email
 */
export function validateEmail(email: string): {
  isValid: boolean;
  message?: string;
} {
  if (!email.trim()) {
    return {
      isValid: false,
      message: 'O email é obrigatório',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      message: 'Digite um email válido',
    };
  }

  return { isValid: true };
}

