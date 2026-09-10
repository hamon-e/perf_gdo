FROM python:3

WORKDIR /data

ADD api/requirements.txt /data/api/requirements.txt

RUN pip install -r /data/api/requirements.txt

ADD api /data/api

ENV API_DB=postgresql://postgres:password@postgres/postgres

EXPOSE 8000

CMD uvicorn api.main:app --host 0.0.0.0 --proxy-headers --forwarded-allow-ips='*'
