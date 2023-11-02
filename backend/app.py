from flask import Flask
from itertools import product

import json_builder as jb
import file_reader as fr
import grid_helpers as gh


app = Flask(__name__)
app.elevation = fr.read_elevation_full()
app.landlake = fr.read_landlake_full()
app.forests = fr.read_forests_full()
app.pop3000 = fr.read_pop3000_full()
app.pop0 = fr.read_pop0_full()
app.crop0 = fr.read_crop0_full()
app.landarea = fr.read_landarea_full()


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
        features += jb.get_fine_grid_json(y, x,
                                          app.elevation,
                                          app.landlake,
                                          app.forests,
                                          app.pop3000,
                                          app.pop0,
                                          app.crop0,
                                          app.landarea)
    return {"type": "FeatureCollection", "features": features}
