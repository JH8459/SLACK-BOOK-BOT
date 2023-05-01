FROM node:18.14.2

WORKDIR /myfolder/

RUN apt-get update \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get upgrade -y \
    && apt-get clean

COPY ./package.json /myfolder/
COPY ./package-lock.json /myfolder/

RUN npm install

COPY . /myfolder

CMD npm start