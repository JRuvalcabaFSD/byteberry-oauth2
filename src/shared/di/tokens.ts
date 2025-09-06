export const TOKENS = {
  Config: Symbol.for('Config'),
  Logger: Symbol.for('Logger'),
} as const;

export type Token = (typeof TOKENS)[keyof typeof TOKENS];
