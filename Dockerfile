# Base image, alpine node images are very optimized and the size will be very small
FROM node:18.17.0-alpine3.18

# to handle node gyp error
RUN apk --no-cache add --virtual .builds-deps build-base python3

# Create app directory in docker container
WORKDIR /usr/src/app

#We need to copy package.json and package-lock.json ie copy from ./ folder
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source ie copy all from curr folder and paste in curr foler in docker ie /user/src/app
COPY  . .

# Create build
RUN npm run build

#Exposing port
EXPOSE 5000

# start the server
CMD [ "npm", "start" ]