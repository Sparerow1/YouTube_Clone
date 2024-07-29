# stage 1: build stage
FROM node:18 AS builder


# set the working directory
WORKDIR /app

# copy the package.json
COPY package*.json ./

# install the dependencies
RUN npm install

# copy the other source files
COPY . .

# build the app
RUN npm run build

# stage 2: production stage
FROM node:18

# set the working directory
WORKDIR /app

# copy the package.json
COPY package*.json ./

# install the dependencies
RUN npm install --only=production

# copy the built app from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# copy next.config.mjs 
COPY --from=builder /app/next.config.mjs ./


# expose the port
EXPOSE 3000

# start the app
CMD ["npm", "start"]