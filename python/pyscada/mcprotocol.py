import re
import struct
from pymcprotocol import Type3E as McClient

__endian_lib__ = '<h'


def __endian_store__(f: str):
    # '<' represents little-endian read,
    # '>' represents    big-endian read.
    return f'<{f}'


def read_boolean(client: McClient, device: str) -> bool:
    if re.match(r"[BMSXY][0-9]+", device):
        r = client.batchread_bitunits(device, 1)[0]
    elif re.match(r"[DR][0-9]+", device):
        r = client.batchread_wordunits(device, 1)[0]
    else:
        raise Exception(f"invalid device type : {device}")
    return True if r else False


def write_boolean(client: McClient, device: str, value: bool):
    w = 1 if value else 0
    if re.match(r"[BMSXY][0-9]+", device):
        client.batchwrite_bitunits(device, [w])
    elif re.match(r"[DR][0-9]+", device):
        return client.batchwrite_wordunits(device, [w])
    else:
        raise Exception(f"invalid device type : {device}")


def read_short(client: McClient, device: str) -> int:
    return struct.unpack(__endian_store__('h'), struct.pack(
        __endian_lib__, client.batchread_wordunits(device, 1)[0]))[0]


def write_short(client: McClient, device: str, value: int):
    client.batchwrite_wordunits(device, [value])


def read_int(client: McClient, device: str) -> int:
    return struct.unpack(__endian_store__('i'), b''.join(
        struct.pack(__endian_lib__, e) for e in client.batchread_wordunits(device, 2)))[0]


def write_int(client: McClient, device: str, value: int):
    m = struct.pack(__endian_store__('i'), value)
    client.batchwrite_wordunits(device, [struct.unpack(
        __endian_lib__, m[i * 2:i * 2 + 2])[0] for i in range(2)])


def read_long(client: McClient, device: str) -> int:
    return struct.unpack(__endian_store__('q'), b''.join(
        struct.pack(__endian_lib__, e) for e in client.batchread_wordunits(device, 4)))[0]


def write_long(client: McClient, device: str, value: int):
    m = struct.pack(__endian_store__('q'), value)
    client.batchwrite_wordunits(device, [struct.unpack(
        __endian_lib__, m[i * 2:i * 2 + 2])[0] for i in range(4)])


def read_float(client: McClient, device: str) -> float:
    return struct.unpack(__endian_store__('f'), b''.join(
        struct.pack(__endian_lib__, e) for e in client.batchread_wordunits(device, 2)))[0]


def write_float(client: McClient, device: str, value: float):
    m = struct.pack(__endian_store__('f'), value)
    client.batchwrite_wordunits(device, [struct.unpack(
        __endian_lib__, m[i * 2:i * 2 + 2])[0] for i in range(2)])


def read_double(client: McClient, device: str) -> float:
    return struct.unpack(__endian_store__('d'), b''.join(
        struct.pack(__endian_lib__, e) for e in client.batchread_wordunits(device, 2)))[0]


def write_double(client: McClient, device: str, value: float):
    m = struct.pack(__endian_store__('d'), value)
    client.batchwrite_wordunits(device, [struct.unpack(
        __endian_lib__, m[i * 2:i * 2 + 2])[0] for i in range(4)])


def read_ascii(client: McClient, device: str, length: int) -> str:
    return b''.join([struct.pack(__endian_lib__, e) for e in client.batchread_wordunits(
        device, length)]).decode()


def write_ascii(client: McClient, device: str, value: str):
    bt = value.encode()
    bt = bt if len(bt) % 2 else (bt + b'\0\0')
    client.batchwrite_wordunits(device, [struct.unpack(
        __endian_lib__, bt[i * 2:i * 2 + 2])[0] for i in range(int(len(bt) / 2))])
