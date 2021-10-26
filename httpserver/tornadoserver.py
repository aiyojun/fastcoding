import json
from tornado.web import Application, StaticFileHandler, RequestHandler
from tornado.ioloop import IOLoop
from tornado.httpserver import HTTPServer


def verify(template: dict, request: dict):
    for key, val in template.items():
        if key not in request:
            return False
        if isinstance(val, dict):
            if not isinstance(request[key], dict):
                return False
            return verify(val, request[key])
    return True


class DownloadHandler(RequestHandler):
    def get(self):
        rsrc = self.get_query_argument('filename')
        self.redirect("/" + rsrc)


class JsonRestHandler(RequestHandler):
    def post(self):
        req = json.loads(self.request.body.decode(encoding='UTF-8'))
        resp = {
            'code': 200,
            'message': 'request success!'
        }
        return self.write(resp)


class Service:
    _port = 8080
    _service_name = "general service"
    _version = "v0.1"

    def __init__(self, **kwargs):
        self._port = kwargs['port'] if 'port' in kwargs else self._port
        self._service_name = kwargs['service_name'] if 'service_name' in kwargs else self._service_name
        self._version = kwargs['version'] if 'version' in kwargs else self._version

    def start(self, urls: list, pth: str):
        HTTPServer(Application(urls, static_path=pth)).listen(self._port)
        IOLoop.current().start()


def main():
    pth = "www"
    urls = [
        (r"/download", DownloadHandler),
        (r"/restful/api", JsonRestHandler),
        (r'^/(.*?)$', StaticFileHandler, {"path": pth, "default_filename": "index.html"},),
    ]
    http = Service(port=8081, service_name="FTP Service", version="v0.1")
    http.start(urls, pth)


if __name__ == '__main__':
    main()
