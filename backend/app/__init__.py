from flask import Flask
from itertools import product

from . import json_builder as jb
from . import file_reader as fr
from . import grid_helpers as gh


data_files = ['elevation', 'landlake', 'forest_wwf_cr',
              'maxln_cr', 'popc_3000BC', 'popc_0AD', 'cropland0AD', 'sample_weights']

offset_dict = {0: (-1, -1), 1: (-1, 0),
               2: (-1, 1), 3: (0, -1),
               4: (0, 1), 5: (1, -1),
               6: (1, 0), 7: (1, 1)}


def create_app():
    app = Flask(__name__)

    app.data = dict()
    for filename in data_files:
        app.data[filename] = fr.read_data(filename)

    @app.after_request
    def after_request(response):
        header = response.headers
        header['Access-Control-Allow-Origin'] = '*'
        header['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        header['Access-Control-Allow-Methods'] = 'OPTIONS, HEAD, GET, POST, DELETE, PUT'
        return response

    @app.route('/api/fine_grid/<y_center>/<x_center>')
    def fine_grid(y_center, x_center):
        depth = 3
        features = []
        for y, x in gh.get_neighboring_coarse(y_center, x_center, depth):
            features += jb.get_fine_grid_json(y, x, app.data)
        return {"type": "FeatureCollection", "features": features}

    @app.route('/api/costs_from_point/<y_fine>/<x_fine>/<offset>')
    def costs_from_point(y_fine, x_fine, offset):
        y_coarse = int(y_fine) // 24
        x_coarse = int(x_fine) // 24
        y_local = int(y_fine) % 24
        x_local = int(x_fine) % 24
        y_offset, x_offset = offset_dict[int(offset)]
        origin_id = y_local * 24 + x_local
        features = []
        cost_grid = fr.read_costs(
            y_coarse + y_offset, x_coarse + x_offset)[int(offset), origin_id, :]
        for y, x in gh.get_neighboring_coarse(y_coarse, x_coarse, 3):
            if (y, x) == (y_coarse + y_offset, x_coarse + x_offset):
                features += jb.get_costs_from_point(int(y_fine),
                                                    int(x_fine), int(offset), cost_grid, app.data)
            else:
                features += jb.get_fine_grid_json(y, x, app.data)
        return {"type": "FeatureCollection", "features": features}

    return app
