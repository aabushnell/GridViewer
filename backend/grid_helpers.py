"""
TODO
"""
import math
from itertools import product


def coord_to_index(lat: float, lon: float, cell_size: float,
                   lat_start: float = 90,
                   lon_start: float = 0) -> tuple[int, int]:
    """
    Converts a point defined by latitude and longitude coordinates
    (must be north and east only) into cell indices of a grid
    of height and width 'cell_size'. By default, grid starts at the
    point 90 degrees N, 0 degrees E corresponding to point (0, 0)
    on the grid. Inverse of index_to_coord function.
    """
    # adjust for grid offset
    lat = lat + (90 - lat_start)
    lon = lon - lon_start

    inv = 1 / cell_size  # scales to grid size
    y = int(90 * inv - math.ceil(lat * inv))
    x = int((360 * inv + math.floor(lon * inv)) % (360 * inv))
    return y, x


def index_to_coord(y: int, x: int, cell_size: float,
                   lat_start: float = 90, lon_start: float = 0,
                   center: bool = False) -> tuple[float, float]:
    """
    Converts index points (y -> latitude, x -> longitude) of a grid
    with height and width of 'cell_size' to the latitude and longitude
    coordinates (in terms of north and east) of either the start
    (top left corner) or middle point within the cell. The point
    90 degrees N, 0 degrees E corresponding to point (0, 0)
    on the grid. Inverse of coord_to_index function.
    """
    offset = 1 / 2 if center else 0
    lat = lat_start - cell_size * (y + offset)
    lon = lon_start + cell_size * (x + offset)
    return lat, lon


def get_valid_neighbors(y_pos: int, x_pos: int, depth: int,
                        y_dim: int, x_dim: int,
                        include_middle: bool = False) -> list[tuple[int, int]]:
    """
    Returns the relative positions of valid neighbor points in a 2D grid.
    """
    return [(y_pos + dy, x_pos + dx) for dy, dx
            in product(range(-1 * depth, depth + 1),
                       range(-1 * depth, depth + 1))
            if ((dy != 0 or dx != 0) or include_middle)
            and 0 <= y_pos + dy < y_dim
            and 0 <= x_pos + dx < x_dim]


def get_valid_neigbors_split(y_pos: int, x_pos: int, depth: int,
                             y_dim: int, x_dim: int
                             ) -> tuple[list[int], list[int]]:
    pn = get_valid_neighbors(y_pos, x_pos, depth, y_dim, x_dim)

    ys = [x[0] for x in pn]
    xs = [x[1] for x in pn]

    return ys, xs


def get_neighboring_coarse(y_center: int, x_center: int, depth: int) -> list[tuple[int, int]]:

    return [(y, x) if 0 <= x < 180 else (y, (x + 180) % 180)
            for y, x in product(range(int(y_center) - (depth - 1),
                                      int(y_center) + (depth)),
                                range(int(x_center) - depth,
                                      int(x_center) + (depth + 1)))]
