from itertools import product

import numpy as np

from . import grid_helpers as gh

offset = 0.00027778
cellsize = 1/12


def get_fine_grid_json(y_coarse: int, x_coarse: int, data: dict) -> dict:

    y_start = y_coarse * 24
    x_start = x_coarse * 24

    y_end = y_start + 24
    x_end = x_start + 24

    features = []
    for y, x in product(range(y_start, y_end), range(x_start, x_end)):

        cell_id = y*4320 + x
        elevation = data['elevation'][y, x]
        landlake = data['landlake'][y, x]
        forests = data['forest_wwf_cr'][y, x]
        landarea = data['maxln_cr'][y, x]
        pop3000 = data['popc_3000BC'][y, x]
        pop0 = data['popc_0AD'][y, x]
        crop0 = data['cropland0AD'][y, x]
        sample_weight = data['sample_weights'][y, x]

        # center_lat, center_lon = gh.index_to_coord(y, x, cellsize, center=True)

        lat, lon = gh.index_to_coord(y, x, cellsize)
        ul = [round(max(lon - offset, 0), 5),
              round(min(lat + offset, 90), 5)]
        ll = [round(max(lon - offset, 0), 5),
              round(max(lat - offset - cellsize, -90), 5)]
        lr = [round(min(lon + offset + cellsize, 360), 5),
              round(max(lat - offset - cellsize, -90), 5)]
        ur = [round(min(lon + offset + cellsize, 360), 5),
              round(min(lat + offset, 90), 5)]
        d = {
            "type": "Feature",
            "geometry":
                    {
                        "type": "Polygon",
                        "coordinates":
                            [[
                                ll,
                                lr,
                                ur,
                                ul,
                                ll
                            ]]
                    },
                "properties":
                    {
                        # "id": f"{y}.{x}",
                        "index_y": y,
                        "index_x": x,
                        # "cellsize": cellsize,
                        # "center_lat": center_lat,
                        # "center_lon": center_lon,
                        "elevation": elevation,
                        "landlake": landlake,
                        "forest": forests,
                        "pop3000": pop3000,
                        "pop0": pop0,
                        "crop0": crop0,
                        "landarea": landarea,
                        "sample_weight": sample_weight
                    },
                "id": cell_id
        }
        features.append(d)

    # gj = {"type": "FeatureCollection", "features": features}

    return features


def get_fine_grid_json_empty(y_coarse: int, x_coarse: int) -> dict:
    y_start = y_coarse * 24
    x_start = x_coarse * 24

    y_end = y_start + 24
    x_end = x_start + 24

    features = []
    for y, x in product(range(y_start, y_end), range(x_start, x_end)):

        cell_id = y*4320 + x

        lat, lon = gh.index_to_coord(y, x, cellsize)
        ul = [max(lon - offset, 0),
              min(lat + offset, 90)]
        ll = [max(lon - offset, 0),
              max(lat - offset - cellsize, -90)]
        lr = [min(lon + offset + cellsize, 360),
              max(lat - offset - cellsize, -90)]
        ur = [min(lon + offset + cellsize, 360),
              min(lat + offset, 90)]
        d = {
            "type": "Feature",
            "geometry":
                    {
                        "type": "Polygon",
                        "coordinates":
                            [[
                                ll,
                                lr,
                                ur,
                                ul,
                                ll
                            ]]
                    },
                "properties":
                    {
                        "index_y": y,
                        "index_x": x,
                    },
                "id": cell_id
        }
        features.append(d)

    # gj = {"type": "FeatureCollection", "features": features}

    return features


def get_costs_from_point(y_fine: int, x_fine: int, nbr_offset: int,
                         cost_grid: np.ndarray[float], data: dict) -> dict:

    y_coarse = y_fine // 24
    x_coarse = x_fine // 24

    offset_dict = {0: (-1, -1), 1: (-1, 0),
                   2: (-1, 1), 3: (0, -1),
                   4: (0, 1), 5: (1, -1),
                   6: (1, 0), 7: (1, 1)}

    y_offset, x_offset = offset_dict[nbr_offset]

    y_start = (y_coarse - y_offset) * 24
    x_start = (x_coarse - x_offset) * 24

    y_end = y_start + 24
    x_end = x_start + 24

    features = []
    for y, x in product(range(y_start, y_end), range(x_start, x_end)):

        cell_id = y*4320 + x
        cost = cost_grid[(y % 24) * 24 + (x % 24)]
        elevation = data['elevation'][y, x]
        landlake = data['landlake'][y, x]
        forests = data['forest_wwf_cr'][y, x]
        landarea = data['maxln_cr'][y, x]
        pop3000 = data['popc_3000BC'][y, x]
        pop0 = data['popc_0AD'][y, x]
        crop0 = data['cropland0AD'][y, x]
        sample_weight = data['sample_weights'][y, x]

        lat, lon = gh.index_to_coord(y, x, cellsize)
        ul = [round(max(lon - offset, 0), 5),
              round(min(lat + offset, 90), 5)]
        ll = [round(max(lon - offset, 0), 5),
              round(max(lat - offset - cellsize, -90), 5)]
        lr = [round(min(lon + offset + cellsize, 360), 5),
              round(max(lat - offset - cellsize, -90), 5)]
        ur = [round(min(lon + offset + cellsize, 360), 5),
              round(min(lat + offset, 90), 5)]
        d = {
            "type": "Feature",
            "geometry":
                    {
                        "type": "Polygon",
                        "coordinates":
                            [[
                                ll,
                                lr,
                                ur,
                                ul,
                                ll
                            ]]
                    },
                "properties":
                    {
                        "index_y": y,
                        "index_x": x,
                        "cost": cost,
                        # "elevation": elevation,
                        # "landlake": landlake,
                        # "forest": forests,
                        # "pop3000": pop3000,
                        # "pop0": pop0,
                        # "crop0": crop0,
                        # "landarea": landarea,
                        # "sample_weight": sample_weight
                    },
                "id": cell_id
        }
        features.append(d)

    # gj = {"type": "FeatureCollection", "features": features}

    return features
