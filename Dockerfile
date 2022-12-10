FROM node:14

WORKDIR /app
COPY yarn.lock package.json /app/
RUN yarn install
COPY . /app/

ENV REACT_APP_API_BASE_URL=https://perf-api.lesgdo.org

RUN yarn build
FROM nginx:latest
COPY --from=0 /app/build /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
