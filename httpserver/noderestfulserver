const http = require('http')
const urlParser = require('url')
const serveStatic = require('serve-static')

class RestfulServer {
    constructor(listeners = [], staticPath = './public') {
        for (let i = 0; i < listeners.length; i++) {
            this.restfulHandlers.push(listeners[i])
        }
        this.server = http.createServer((request, response) => {
            const method = request.method.toLowerCase()
            const { headers } = request
            const parsedUrl = urlParser.parse(request.url, true)
            const url   = request.url.split('?')[0]
            const query = parsedUrl.query
            const parameters = {}
            for (let k in query) {
                parameters[k] = query[k]
            }

            console.info(`[Rest] http request, method ${method}, path ${url} `)
            for (let i = 0; i < this.restfulHandlers.length; i++) {
                const handler = this.restfulHandlers[i]
                const iMethod = handler.method
                const iUrl    = handler.url
                if (iMethod.toLowerCase() === method && iUrl === url) {
                    let body = []
                    request.on('data', (chunk) => {
                        body.push(chunk)
                    })
                    request.on('end', () => {
                        body = Buffer.concat(body).toString('utf8')
                        try {
                            const obj = handler.onSuccess({method: method, headers, parameters, data: body})
                            if (typeof obj === 'object') {
                                response.end(JSON.stringify(obj), 'utf8')
                            } else if (typeof obj === 'string') {
                                response.end(obj, 'utf8')
                            } else {
                                response.statusCode = 500
                                response.statusMessage = `typeof return ${typeof obj}`
                                response.end()
                            }
                        } catch (e) {
                            response.statusCode = 500
                            response.statusMessage = `internal error: ${e.message}`
                            response.end()
                        }
                    })
                    return
                }
            }
            const serve = serveStatic(staticPath)
            serve(request, response, function () {
                const err = `[Rest] server occur error, method: ${request.method.toLowerCase()}, url: ${request.url}!`
                console.info(err)
                response.statusCode = 200
                response.statusMessage = err
                response.end(err, 'utf8')
            });
        })
    }

    start({port, staticPath}) {
        this.server.listen(port, staticPath)
    }

    errorHandler = (request, response) => {
        return 'error'
    }

    restfulHandlers = []
}

const restfulServer = new RestfulServer([
    {method: 'GET', url: '/version', onSuccess: () => {return {code: 200, version: "1.0"}}},
])
restfulServer.start({port: 8080, staticPath: './public'})
