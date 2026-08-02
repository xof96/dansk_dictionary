export type DictionaryErrorCode =
  'NETWORK' | 'TIMEOUT' | 'RATE_LIMIT' | 'INVALID_RESPONSE' | 'NOT_FOUND' | 'STORAGE';

export class DictionaryError extends Error {
  constructor(
    public readonly code: DictionaryErrorCode,
    message: string,
    public readonly retryable: boolean,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'DictionaryError';
  }
}
