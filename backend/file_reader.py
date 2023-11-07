from typing import BinaryIO

import numpy as np
import xarray as xr
import h5netcdf


def read_int(f: BinaryIO) -> int:
    file_bytes = f.read(2)
    height = int.from_bytes(file_bytes, 'big', signed=True)
    return height


def read_data(filename: str) -> np.ndarray[np.ndarray[int]]:
    path = './data/' + filename + '.nc'
    data_array_xarray = xr.open_dataarray(path,
                                          engine='h5netcdf')
    data_array_netcdf4 = data_array_xarray.to_numpy()
    data_array_xarray.close()
    return np.float64(data_array_netcdf4)
