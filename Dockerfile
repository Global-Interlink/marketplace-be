FROM node:18-alpine
RUN apk update && apk add bash

# Docker working directory
WORKDIR /app

# Copying file into APP directory of docker
COPY ./package.json /app/

# Then install the NPM module
# RUN npm config set unsafe-perm true
RUN npm install

# Copy current directory to APP folder
COPY . /app/

EXPOSE 3000
CMD ["npm", "run", "build"]
