import alertRoutes from '@/modules/alerts/mock/routes/alertRoutes'
import indicatorsRoutes from '@/modules/indicators/mock/routes/indicatorsRoutes'
import sjcGeojsonJson from '@/modules/home/mock/routes/sjcGeoJsonRoutes'
import { createServer, Server, Request } from 'miragejs'
import type { MockFlagReturn } from '@/utils/mockUtils'
import userRoutes from '@/modules/users/mock/routes/userRoutes'
import problemRoutes from '@/modules/problems/mock/routes/problemRoutes'
import protocolRoutes from '@/modules/protocols/mock/routes/protocolRoutes'

export function makeServer(): Server | undefined {
  if (import.meta.env.MODE === 'development' && !(window as any).server) {
    const routes: MockFlagReturn[] = [
      ...alertRoutes,
      ...indicatorsRoutes,
      ...problemRoutes,
      ...protocolRoutes,
      ...sjcGeojsonJson,
      ...userRoutes,
    ]

    ;(window as any).server = createServer({
      models: {},

      routes() {
        this.urlPrefix = 'http://localhost:8080'
        this.namespace = ''
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
