# Create image from nodejs base image
FROM node:10-alpine

# Set the working direcrory to `/usr/src`
WORKDIR /usr/src

# Installs latest Chromium (71) package.
RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      chromium@edge \
      harfbuzz@edge \
      nss@edge

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Copy the package.json and yarn.lock files into the image and run `yarn` to install dependencies
COPY package.json yarn.lock /usr/src/

RUN yarn

# Puppeteer v1.9.0 works with Chromium 71.
# RUN yarn add puppeteer@1.13.0

# Copy the remaining source files into the image
COPY . .
RUN yarn build

# Clear the cache
RUN yarn cache clean

EXPOSE 3000
CMD [ "yarn", "start", "--hostname", "0.0.0.0"]

# docker build --no-cache -t blob-express .
# docker stop blob-express ; docker run -d --shm-size=1gb --rm -it -p 3012:3000 --name blob-express blob-express
# docker exec -it blob-express /bin/bash
# docker logs --follow blob-express
# mechanic add blob-express '--host=blob.gly.sh' '--backends=localhost:3012' '--canonical=true' '--https=true' '--redirect-to-https=true'