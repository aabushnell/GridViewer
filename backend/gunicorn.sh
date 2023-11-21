#!/bin/sh
gunicorn --env SCRIPT_NAME=/gridviewer-backend --bind 0.0.0.0:8090 "wsgi:create_app()"
