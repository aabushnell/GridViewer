from typing import BinaryIO


def read_int(f: BinaryIO) -> int:
    file_bytes = f.read(2)
    height = int.from_bytes(file_bytes, 'big', signed=True)
    return height


def read_elevation_full() -> list[list[int]]:
    lat = []
    with open('./data/ETOPO5.DAT', 'rb') as f:
        for i in range(2160):
            lon = []
            for j in range(4320):
                height = read_int(f)
                lon.append(height)
            lat.append(lon)

    return lat


def read_landlake_full() -> list[list[int]]:
    rows = []
    with open('./data/landlake.asc', 'r') as f:
        for i in range(6):
            _ = f.readline()
        for i in range(2160):
            line_str = f.readline()
            line_arr = [int(n) for n in line_str.split(' ') if n != '\n']
            line_arr_fixed = line_arr[2160:4320] + line_arr[0:2160]
            rows.append(line_arr_fixed)

    return rows


def read_forests_full() -> list[list[int]]:
    rows = []
    with open('./data/forest_wwf_cr.asc', 'r') as f:
        for i in range(6):
            _ = f.readline()
        for i in range(2160):
            line_str = f.readline()
            line_arr = [int(float(n)) for n in line_str.split(' ')
                        if (n != '\n' and n != '')]
            line_arr_fixed = line_arr[2160:4320] + line_arr[0:2160]
            rows.append(line_arr_fixed)

    return rows


def read_pop3000_full() -> list[list[int]]:
    rows = []
    with open('./data/popc_3000BC.asc', 'r') as f:
        for i in range(6):
            _ = f.readline()
        for i in range(2160):
            line_str = f.readline()
            line_arr = [int(float(n)) for n in line_str.split(' ')
                        if (n != '\n' and n != '')]
            line_arr_fixed = line_arr[2160:4320] + line_arr[0:2160]
            rows.append(line_arr_fixed)

    return rows


def read_pop0_full() -> list[list[int]]:
    rows = []
    with open('./data/popc_0AD.asc', 'r') as f:
        for i in range(6):
            _ = f.readline()
        for i in range(2160):
            line_str = f.readline()
            line_arr = [int(float(n)) for n in line_str.split(' ')
                        if (n != '\n' and n != '')]
            line_arr_fixed = line_arr[2160:4320] + line_arr[0:2160]
            rows.append(line_arr_fixed)

    return rows


def read_crop0_full() -> list[list[int]]:
    rows = []
    with open('./data/cropland0AD.asc', 'r') as f:
        for i in range(6):
            _ = f.readline()
        for i in range(2160):
            line_str = f.readline()
            line_arr = [int(float(n)) for n in line_str.split(' ')
                        if (n != '\n' and n != '')]
            line_arr_fixed = line_arr[2160:4320] + line_arr[0:2160]
            rows.append(line_arr_fixed)

    return rows


def read_landarea_full() -> list[list[int]]:
    rows = []
    with open('./data/maxln_cr.asc', 'r') as f:
        for i in range(6):
            _ = f.readline()
        for i in range(2160):
            line_str = f.readline()
            line_arr = [int(float(n)) for n in line_str.split(' ')
                        if (n != '\n' and n != '')]
            line_arr_fixed = line_arr[2160:4320] + line_arr[0:2160]
            rows.append(line_arr_fixed)

    return rows
