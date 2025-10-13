export const LEVELS_ENUM = {
  1: 'Excelente',
  2: 'Bom',
  3: 'Intermediário',
  4: 'Ruim',
  5: 'Péssimo',
} as const

export type LevelKey = keyof typeof LEVELS_ENUM
export type LevelValue = (typeof LEVELS_ENUM)[LevelKey]

export interface SelectedLevel {
  value: LevelKey
  name: LevelValue
}
