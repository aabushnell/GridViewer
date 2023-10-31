from itertools import product

import grid_helpers as gh

offset = 0.00027778
cellsize = 1/12


def get_fine_grid_json(y_coarse: int, x_coarse: int, elev_array: list[list[int]], land_array: list[list[int]]) -> dict:

    y_start = y_coarse * 24
    x_start = x_coarse * 24

    y_end = y_start + 24
    x_end = x_start + 24

    features = []
    for y, x in product(range(y_start, y_end), range(x_start, x_end)):

        cell_id = y*4320 + x
        elevation = elev_array[y][x]
        landlake = land_array[y][x]

        # center_lat, center_lon = gh.index_to_coord(y, x, cellsize, center=True)

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
                        # "id": f"{y}.{x}",
                        # "index_y": y,
                        # "index_x": x,
                        # "cellsize": cellsize,
                        # "center_lat": center_lat,
                        # "center_lon": center_lon,
                        "elevation": elevation,
                        "landlake": landlake
                    },
                "id": cell_id
        }
        features.append(d)

    # gj = {"type": "FeatureCollection", "features": features}

    return features
