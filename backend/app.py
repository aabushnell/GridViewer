from flask import Flask
from itertools import product

import json_builder as jb
import file_reader as fr
import grid_helpers as gh


app = Flask(__name__)

data_files = ['elevation', 'landlake', 'forest_wwf_cr',
              'maxln_cr', 'popc_3000BC', 'popc_0AD', 'cropland0AD']
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
