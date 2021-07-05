FROM ubuntu:bionic

RUN \
  apt-get update && \
  apt-get upgrade -y && \
  apt-get install -y curl build-essential nano netcat git jq

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 14.17.0
ENV PATH=$PATH:/usr/local/go/bin:/root/.nvm/versions/node/v$NODE_VERSION/bin

# Install nvm, node, npm and yarn
RUN curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.35.3/install.sh | bash && \
  . $NVM_DIR/nvm.sh && \
  nvm install $NODE_VERSION && \
  mkdir -p /root/vor-ui

WORKDIR /root/vor-ui

COPY ./package.json ./package-lock.json ./

RUN cd /root/vor-ui && npm ci

COPY ./.eslintrc.json ./.prettierrc.json ./.sequelizerc ./config-overrides.js ./truffle-config.js ./
COPY ./contracts ./contracts/
COPY ./migrations ./migrations/
COPY ./.env ./.env
COPY ./docker/assets/set_contract_address.sh ./set_contract_address.sh

RUN npx truffle compile
