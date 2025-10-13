import alertsRoutes from '@/modules/alerts/mock/routes/alertRoutes'
import indicatorsRoutes from '@/modules/indicators/mock/routes/indicatorsRoutes'
import sjcGeojsonJson from '@/modules/home/mock/routes/sjcGeoJsonRoutes'
import { createServer, Server, Request } from 'miragejs'
import type { MockFlagReturn } from '@/utils/mockUtils'

export function makeServer(): Server | undefined {
  if (import.meta.env.MODE === 'development' && !(window as any).server) {
    const routes: MockFlagReturn[] = [...alertsRoutes, ...indicatorsRoutes, ...sjcGeojsonJson]

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
