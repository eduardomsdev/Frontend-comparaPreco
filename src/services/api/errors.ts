import { ErrorResponseSchema } from '../../schemas/api';

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'MALFORMED_REQUEST'
  | 'INVALID_PARAMETER'
  | 'UNAUTHORIZED'
  | 'INVALID_CREDENTIALS'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'EMAIL_ALREADY_EXISTS'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Erro normalizado a partir do formato padrão de erro do backend
 * (ver GlobalExceptionHandler / ErrorResponse). Toda chamada de API deve
 * lançar este tipo — as telas nunca leem o erro cru do axios.
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: Record<string, string>;

  constructor(code: ApiErrorCode, status: number, message: string, details?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  /**
   * Só UNAUTHORIZED (token ausente/inválido/expirado) deve derrubar a sessão global.
   * INVALID_CREDENTIALS é erro de login (usuário ainda não está autenticado) e deve
   * ser tratado como erro de formulário, não como logout.
   */
  get isSessionExpired(): boolean {
    return this.code === 'UNAUTHORIZED';
  }
}

const FRIENDLY_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  NETWORK_ERROR: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
  INTERNAL_ERROR: 'Algo deu errado no servidor. Tente novamente em instantes.',
  UNKNOWN_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
};

export function friendlyMessage(error: ApiError): string {
  return FRIENDLY_MESSAGES[error.code] ?? error.message;
}

/** Converte qualquer erro (axios, parsing, rede) em um ApiError normalizado. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  const maybeAxiosError = error as {
    response?: { status: number; data: unknown };
    request?: unknown;
    message?: string;
  };

  if (maybeAxiosError?.response) {
    const { status, data } = maybeAxiosError.response;
    const parsed = ErrorResponseSchema.safeParse(data);

    if (parsed.success) {
      return new ApiError(parsed.data.error as ApiErrorCode, status, parsed.data.message, parsed.data.details);
    }

    return new ApiError('UNKNOWN_ERROR', status, 'Ocorreu um erro inesperado. Tente novamente.');
  }

  if (maybeAxiosError?.request) {
    return new ApiError('NETWORK_ERROR', 0, 'Não foi possível conectar ao servidor.');
  }

  return new ApiError('UNKNOWN_ERROR', 0, maybeAxiosError?.message ?? 'Ocorreu um erro inesperado.');
}
