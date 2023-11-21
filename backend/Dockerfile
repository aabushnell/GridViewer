FROM python:3.8-slim

LABEL maintainer = "Aaron Bushnell" \
      name = "gridviewer-backend" \
      version = "0.1"

WORKDIR /gridviewer
ADD . /gridviewer

RUN apt update
RUN apt install -y gcc
RUN pip install -r requirements.txt

ENTRYPOINT ["bash", "./gunicorn.sh"]