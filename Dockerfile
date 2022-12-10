FROM python:3

WORKDIR /data

ADD api/requirements.txt /data/api/requirements.txt

RUN pip install -r /data/api/requirements.txt

ADD api /data/api
ADD service-account.json /data

ENV GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

CMD uvicorn api.main:app --host 0.0.0.0 --proxy-headers --forwarded-allow-ips='*'
