# Create image from nodejs base image
FROM node:10

# Set the working direcrory to `/usr/src`
WORKDIR /usr/src

# Copy the package.json and yarn.lock files into the image and run `yarn` to install dependencies
COPY package.json yarn.lock /usr/src/

RUN yarn

# RUN apk --no-cache --virtual build-dependencies add \
#     python \
#     build-base \
#     && yarn \
#     && apk del build-dependencies

# Copy the remaining source files into the image
COPY . .
RUN yarn build

# Clear the cache
RUN yarn cache clean

EXPOSE 4000
CMD [ "yarn", "start", "--hostname", "0.0.0.0"]

# docker build --no-cache -t blob-express .
# docker stop blob-express ; docker run -d --rm -it -p 3022:4000 --name blob-express blob-express
# docker exec -it blob-express /bin/bash
# docker logs --follow blob-express
