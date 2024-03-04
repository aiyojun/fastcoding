import re
import struct
from pymodbus.pdu import ModbusResponse
from pymodbus.client import ModbusTcpClient

__endian_lib__ = '>H'


def __endian_store__(f: str):
    # '<' represents little-endian read,
    # '>' represents    big-endian read.
    return f'<{f}'


def _error_checking(resp: ModbusResponse):
    if resp.isError():
        raise Exception(resp.function_code)
    return resp


def read_boolean(client: ModbusTcpClient, device: str) -> bool:
    if re.match(r"M[0-9]+", device):
        resp = client.read_coils(int(device[1:]), 1)
        _error_checking(resp)
        r = resp.bits[0]
    elif re.match(r"[D][0-9]+", device):
        resp = client.read_holding_registers(int(device[1:]), 1)
        _error_checking(resp)
        r = resp.registers[0]
    else:
        raise Exception(f"invalid device type : {device}, only support M-/D-")
    return True if r else False


def write_boolean(client: ModbusTcpClient, device: str, value: bool):
    if re.match(r"M[0-9]+", device):
        client.write_coil(int(device[1:]), value)
    elif re.match(r"D[0-9]+", device):
        return client.write_register(int(device[1:]), value)
    else:
        raise Exception(f"invalid device type : {device}, only support M-/D-")


def read_short(client: ModbusTcpClient, device: str) -> int:
    return struct.unpack(__endian_store__('h'), struct.pack(__endian_lib__, _error_checking(
        client.read_holding_registers(int(device[1:]))).registers[0]))[0]


def write_short(client: ModbusTcpClient, device: str, value: int):
    client.write_register(int(device[1:]), struct.unpack(
        __endian_lib__, struct.pack(__endian_store__('h'), value))[0])


def read_int(client: ModbusTcpClient, device: str) -> int:
    return struct.unpack(__endian_store__('i'), b''.join(
        struct.pack(__endian_lib__, e) for e in _error_checking(
            client.read_holding_registers(int(device[1:]), 2)).registers))[0]


def write_int(client: ModbusTcpClient, device: str, value: int):
    m = struct.pack(__endian_store__('i'), value)
    client.write_registers(int(device[1:]), [struct.unpack(
        __endian_lib__, m[i*2:i*2+2])[0] for i in range(2)])


def read_long(client: ModbusTcpClient, device: str) -> int:
    return struct.unpack(__endian_store__('q'), b''.join(
        struct.pack(__endian_lib__, e) for e in _error_checking(
            client.read_holding_registers(int(device[1:]), 4)).registers))[0]


def write_long(client: ModbusTcpClient, device: str, value: int):
    m = struct.pack(__endian_store__('q'), value)
    client.write_registers(int(device[1:]), [struct.unpack(
        __endian_lib__, m[i * 2:i * 2 + 2])[0] for i in range(4)])


def read_float(client: ModbusTcpClient, device: str) -> float:
    return struct.unpack(__endian_store__('f'), b''.join(
        struct.pack(__endian_lib__, e) for e in _error_checking(
            client.read_holding_registers(int(device[1:]), 2)).registers))[0]


def write_float(client: ModbusTcpClient, device: str, value: float):
    m = struct.pack(__endian_store__('f'), value)
    client.write_registers(int(device[1:]), [struct.unpack(
        __endian_lib__, m[i * 2:i * 2 + 2])[0] for i in range(2)])


def read_double(client: ModbusTcpClient, device: str) -> float:
    return struct.unpack(__endian_store__('d'), b''.join(
        struct.pack(__endian_lib__, e) for e in _error_checking(
            client.read_holding_registers(int(device[1:]), 4)).registers))[0]


def write_double(client: ModbusTcpClient, device: str, value: float):
    m = struct.pack(__endian_store__('d'), value)
    client.write_registers(int(device[1:]), [struct.unpack(
        __endian_lib__, m[i * 2:i * 2 + 2])[0] for i in range(4)])


def read_ascii(client: ModbusTcpClient, device: str, length: int) -> str:
    return b''.join([struct.pack(__endian_lib__, e) for e in (_error_checking(
        client.read_holding_registers(int(device[1:]), int(length / 2))).registers)]).decode()


def write_ascii(client: ModbusTcpClient, device: str, value: str):
    bt = value.encode()
    bt = bt if len(bt) % 2 else (bt + b'\0\0')
    client.write_registers(int(device[1:]), [struct.unpack(
        __endian_lib__, bt[i * 2:i * 2 + 2])[0] for i in range(int(len(bt) / 2))])
