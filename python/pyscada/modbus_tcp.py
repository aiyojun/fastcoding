import json
import re
import sys
import argparse
from pymodbus.client import ModbusTcpClient
from pymodbus.framer import Framer
import modbus


def get_commandline():
    parser = argparse.ArgumentParser(description="Modbus TCP client")
    parser.add_argument('commands', nargs='+', help='commands')
    parser.add_argument('-i', '--ip', type=str, default="127.0.0.1", help='modbus server ip address')
    parser.add_argument('-p', '--port', type=int, default=502, required=False, help='modbus server port')
    parser.add_argument('-f', '--frame', type=str, default="binary", choices=['binary', 'ascii'], required=False,
                        help='frame format of communication protocol')
    return parser.parse_args(sys.argv[1:])


def get_default(reg: str, raw: str, default):
    r = re.search(reg, raw)
    return r.group(0) if r else default


if __name__ == '__main__':
    args = get_commandline()
    cli = ModbusTcpClient(args.ip, args.port, framer=Framer.ASCII if args.frame == 'ascii' else Framer.BINARY)
    cli.connect()
    tasks = []
    for cmd in args.commands:
        try:
            device = re.match(r'^[MD][0-9]+', cmd)
            if not device:
                raise Exception(f"invalid device type {cmd}, only support M-/D-")
            device = device[0]
            _cmd = cmd[len(device):]
            if _cmd == '':
                tasks.append({"command": cmd, "taskType": "read", "dataType": "short", "device": device,
                              "value": modbus.read_short(cli, device)})
            elif re.match(r'^@bool(ean)?$', _cmd):
                tasks.append({"command": cmd, "taskType": "read", "dataType": "bool", "device": device,
                              "value": modbus.read_boolean(cli, device)})
            elif re.match(r'^@short$', _cmd):
                tasks.append({"command": cmd, "taskType": "read", "dataType": "short", "device": device,
                              "value": modbus.read_short(cli, device)})
            elif re.match(r'^@int(eger)?$', _cmd):
                tasks.append({"command": cmd, "taskType": "read", "dataType": "int", "device": device,
                              "value": modbus.read_int(cli, device)})
            elif re.match(r'^@float$', _cmd):
                tasks.append({"command": cmd, "taskType": "read", "dataType": "float", "device": device,
                              "value": modbus.read_float(cli, device)})
            elif re.match(r'^@double$', _cmd):
                tasks.append({"command": cmd, "taskType": "read", "dataType": "double", "device": device,
                              "value": modbus.read_double(cli, device)})
            elif re.match(r'^@asciiL[0-9]+$', _cmd):
                size = int(get_default(r'L[0-9]+', _cmd, 'L1')[1:])
                tasks.append({"command": cmd, "taskType": "read", "dataType": "string", "device": device, "length": size,
                              "value": modbus.read_ascii(cli, device, size)})
            elif re.match(r'^W[+-]?[0-9]+$', _cmd):
                x = int(get_default(r'W[+-]?[0-9]+', _cmd, 'W0')[1:])
                tasks.append({"command": cmd, "taskType": "write", "dataType": "short", "device": device, "value": x})
                modbus.write_short(cli, device, x)
            elif re.match(r'^@int(eger)?W[+-]?[0-9]+$', _cmd):
                x = int(get_default(r'W[+-]?[0-9]+', _cmd, 'W0')[1:])
                tasks.append({"command": cmd, "taskType": "write", "dataType": "int", "device": device, "value": x})
                modbus.write_int(cli, device, x)
            elif re.match(r'^(@bool)?W(true|false)$', _cmd):
                x = get_default(r'W(true|false)', _cmd, 'Wfalse')[1:] == 'true'
                tasks.append({"command": cmd, "taskType": "write", "dataType": "bool", "device": device, "value": x})
                modbus.write_boolean(cli, device, x)
            elif re.match(r'^(@float)?W[+-]?[0-9]+\.[0-9]+$', _cmd):
                x = float(get_default(r'W[+-]?[0-9]+\.[0-9]+', _cmd, 'W0')[1:])
                tasks.append({"command": cmd, "taskType": "write", "dataType": "float", "device": device, "value": x})
                modbus.write_float(cli, device, x)
            elif re.match(r'^@doubleW[+-]?[0-9]+\.[0-9]+$', _cmd):
                x = float(get_default(r'W[+-]?[0-9]+\.[0-9]+', _cmd, 'W0')[1:])
                tasks.append({"command": cmd, "taskType": "write", "dataType": "double", "device": device, "value": x})
                modbus.write_double(cli, device, x)
            elif re.match(r'^@asciiW.+$', _cmd):
                text = get_default(r'^@asciiW.+', _cmd, '@asciiW')[7:]
                tasks.append({"command": cmd, "taskType": "write", "dataType": "string", "device": device, "value": text})
                modbus.write_ascii(cli, device, text)
            else:
                raise Exception(f"invalid command: {_cmd}")
        except Exception as e:
            tasks.append({"command": cmd, "error": str(e)})
    cli.close()
    print(json.dumps({"tasks": tasks}, indent=2, sort_keys=True, ensure_ascii=False))
