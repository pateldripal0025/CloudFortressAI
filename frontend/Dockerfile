FROM node:20

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

RUN npm install

# Copy the rest of the application
COPY . .

# Expose Vite dev port
EXPOSE 5173

# Run the Vite dev server with --host to expose it outside the container
CMD ["npm", "run", "dev", "--", "--host"]
