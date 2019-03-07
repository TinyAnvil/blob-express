FROM node:10-alpine

# Set the working direcrory to `/usr/src`
WORKDIR /usr/src

# Installs latest Chromium (68) package.
RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      freetype@edge \
      harfbuzz@edge \
      chromium@edge \
      nss@edge

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Copy the package.json and yarn.lock files into the image and run `yarn` to install dependencies
COPY package.json yarn.lock /usr/src/

RUN yarn

# Copy the remaining source files into the image
COPY . .
RUN yarn build

# Clear the cache
RUN yarn cache clean

EXPOSE 4000
CMD [ "yarn", "start", "--hostname", "0.0.0.0"]

# docker build --no-cache -t blob-express .
# docker stop blob-express ; docker run -d -i --rm -it -p 3026:4000 --cap-add=SYS_ADMIN --name blob-express blob-express
# docker exec -it blob-express /bin/bash
# docker logs --follow blob-express
# mechanic add blob-express '--host=blob.gly.sh' '--backends=localhost:3012' '--canonical=true' '--https=true' '--redirect-to-https=true'