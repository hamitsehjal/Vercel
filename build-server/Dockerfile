# Using a base linux image
FROM ubuntu:focal

# Updating system and installing dependencies
RUN apt-get update && apt-get install -y curl

# Add NodeSource Repository for the desired Node version
RUN curl -sL https://deb.nodesource.com/setup_22.x | bash -

# Install Node.js 
RUN apt-get install -y nodejs

# Install Git 
RUN apt-get install -y git

# Set Working Directory
WORKDIR /app

# Copy application Files
COPY script.js .
COPY package*.json .

# Run npm install 
RUN npm install

# Copy the rest of the files 
COPY . .
RUN chmod +x script.js

CMD [ "node","script.js" ]


