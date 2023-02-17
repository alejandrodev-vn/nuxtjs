# Set the base image.
FROM node:14-slim

# Create and define the application's working directory.
RUN mkdir /var/app
WORKDIR /var/app
