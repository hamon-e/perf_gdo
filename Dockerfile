FROM node:14

WORKDIR /app
COPY yarn.lock package.json /app/
RUN yarn install
COPY . /app/
RUN yarn build
FROM nginx:latest
COPY --from=0 /app/build /usr/share/nginx/html
COPY ./default.conf /etc/nginx/conf.d/default.conf
