FROM ghcr.io/puppeteer/puppeteer:22.3.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /home/node/app

COPY package*.json ./

RUN npm ci
COPY . .

RUN  npm run build
CMD ["npm","start"]