import { Response } from 'miragejs'

interface SpecificError {
  status: number
  message: string
}

interface APIFailureWrapperParams<T = any> {
  content: T
  errorMessage?: string
  specificError?: SpecificError
  failureRate?: number
}

export function APIFailureWrapper<T = any>({
  content,
  errorMessage = 'Erro genérico',
  specificError = {} as SpecificError,
  failureRate = 0,
}: APIFailureWrapperParams<T>): T | Response {
  const chance = Math.floor(Math.random() * 100)
  if (failureRate > chance) {
    if (Object.keys(specificError).length) {
      return new Response(
        specificError.status,
        { 'Content-Type': 'application/json' },
        {
          code: specificError.status,
          key: specificError.message,
          context: {
            message: specificError.message,
            additionalInfo: 'Detalhes adicionais do contexto',
          },
        },
      )
    } else {
      return new Response(
        400,
        { 'Content-Type': 'application/json' },
        {
          code: 400,
          key: errorMessage,
          context: {
            message: errorMessage,
            additionalInfo: 'Detalhes adicionais do contexto',
          },
        },
      )
    }
  }
  return content
}

interface MockFlagParams {
  method: string
  result: Function
  url?: string
}

export interface MockFlagReturn {
  method: string
  result: Function
  url?: string
}

export function mockFlag(params: MockFlagParams, state: string = 'on'): MockFlagReturn {
  if (state === 'on') {
    return params
  }
  return { method: params.method, url: '', result: params.result }
}
