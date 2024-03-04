FROM mcr.microsoft.com/playwright:v1.42.1

WORKDIR /home/node/app

ENV ENV PATH /home/node/app/node_modules/.bin:$PATH

COPY package*.json ./

RUN npm ci
RUN npm install -g playwright
RUN playwright install
COPY . .

RUN  npm run build
CMD ["npm","start"]