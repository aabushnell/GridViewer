#!/bin/sh
gunicorn --env SCRIPT_NAME=/gridviewer --bind 0.0.0.0:8090 "wsgi:run_app()"
