import sys
import urllib
import base64


# url decode/encode
def encode_url(url: str):
    return urllib.parse.quote(url, safe=string.printable)


def decode_url(url: str):
    return urllib.parse.unquote(url)


# to base64
def encode_base64(x: str):
    return base64.b64encode(x.encode())


# base64 to utf8
def decode_base64(x: bytes):
    return base64.b64decode(x).decode()


def parse_argv():
    argv = sys.argv
    parser = argparse.ArgumentParser(usage="{} [options]".format(argv[0]))
    parser.add_argument('-p', '--port', type=str, default='8080', help='Port of service')
    parser.add_argument('-P', '--path', type=str, default='.', help='Static files path')
    return parser.parse_args()