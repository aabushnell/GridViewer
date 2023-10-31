from flask import Flask
from itertools import product

import json_builder as jb
import file_reader as fr


app = Flask(__name__)
app.elevation = fr.read_elevation_full()
app.landlake = fr.read_landlake_full()


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
    for y, x in product(range(int(y_center) - (depth - 1), int(y_center) + (depth)),
                        range(int(x_center) - depth, int(x_center) + (depth + 1))):
        features += jb.get_fine_grid_json(y, x, app.elevation, app.landlake)
    return {"type": "FeatureCollection", "features": features}
