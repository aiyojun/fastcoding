const http = require('http')
const urlParser = require('url')
const serveStatic = require('serve-static')

class RestfulServer {
    constructor(listeners = [], staticPath = './public') {
        this.staticPath = staticPath
        for (let i = 0; i < listeners.length; i++) {
            const handler = listeners[i]
            const iMethod = handler.method
            const iUrl    = handler.url
            this.restfulHandlers.set(iUrl, {handler: listeners[i], method: iMethod.toLowerCase()})
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
            this._process(method, url, request, response, headers, parameters)
        })
    }

    _process(method, url, request, response, headers, parameters) {
        if (this.restfulHandlers.has(url) && this.restfulHandlers.get(url).method === method) {
            const handler = this.restfulHandlers.get(url).handler
            let body = []
            request.on('data', (chunk) => {
                body.push(chunk)
            })
            request.on('end', () => {
                body = Buffer.concat(body).toString('utf8')
                try {
                    const obj = handler.onSuccess({method: method, headers, parameters, data: body}, request, response, this)
                    if (obj === undefined || obj === null) {
                        return
                    }
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
        } else {
            const serve = serveStatic(this.staticPath)
            serve(request, response, function () {
                const err = `[Rest] server occur error, method: ${request.method.toLowerCase()}, url: ${request.url}!`
                console.info(err)
                response.statusCode = 200
                response.statusMessage = err
                response.end(err, 'utf8')
            });
        }
    }

    redirect(url, request, response) {
        console.info(`[rest] redirect ${request.url} => ${url}`)
        request.url = url
        const method = request.method.toLowerCase()
        const { headers } = request
        const parsedUrl = urlParser.parse(request.url, true)
        const query = parsedUrl.query
        const parameters = {}
        for (let k in query) {
            parameters[k] = query[k]
        }
        this._process(method, url, request, response, headers, parameters)
    }

    start(port) {
        console.info(`[rest] rest service listen on: ${port}`)
        this.server.listen(port)
    }

    errorHandler = (request, response) => {
        return 'error'
    }

    restfulHandlers = new Map
}

const restfulServer = new RestfulServer([
    {method: 'GET', url: '/version', onSuccess: () => {return {code: 200, version: "1.0"}}},
])
restfulServer.start({port: 8080, staticPath: './public'})
