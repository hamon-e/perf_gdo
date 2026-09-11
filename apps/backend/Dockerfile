FROM python:3

WORKDIR /data

ADD api/requirements.txt /data/api/requirements.txt

RUN pip install -r /data/api/requirements.txt

ADD api /data/api

ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION}

ENV API_DB=postgresql://postgres:password@postgres/postgres

EXPOSE 8000

CMD uvicorn api.main:app --host 0.0.0.0 --proxy-headers --forwarded-allow-ips='*'
