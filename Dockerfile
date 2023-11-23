FROM node:18
RUN npm install pm2 -g
# Working Dir
RUN mkdir -p /noah-api
WORKDIR /noah-api
# Copy Package Json Files
COPY package*.json /noah-api/
# Copy .env File
# COPY .env /noah-api/
# Install Files
RUN npm ci
# Copy Source Files
COPY . /noah-api/
# Build
RUN npm run build
CMD [ "npm", "run", "serve:prod" ]