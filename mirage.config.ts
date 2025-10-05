import { createServer, Server, Request } from 'miragejs'
import criteriasRoutes from './src/modules/criterias/mock/routes/criteriasRoutes'
import type { MockFlagReturn } from '@/utils/mockUtils'

export function makeServer(): Server | undefined {
  if (import.meta.env.MODE === 'development' && !(window as any).server) {
    const routes: MockFlagReturn[] = [...criteriasRoutes]

    ;(window as any).server = createServer({
      models: {},

      routes() {
        this.urlPrefix = 'http://localhost:8080'
        this.namespace = 'api'
        this.timing = 400

        routes.forEach((route) => {
          // @ts-expect-error: dynamic method assignment
          this[route.method](route.url, (_: any, request: Request) => route.result(request))
        })

        this.passthrough()
      },

      seeds() {},
    })

    return (window as any).server
  }
}
