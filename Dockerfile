FROM node:20-alpine

WORKDIR /app

# Install global tools for scaffolding
RUN npm install -g create-vite

# Copy ONLY the entrypoint (Do not copy . /app)
COPY entrypoint.sh /entrypoint.sh

# Fix permissions and line endings (Mac/Linux compatibility)
RUN chmod +x /entrypoint.sh && \
    sed -i 's/\r$//' /entrypoint.sh

EXPOSE 5173

ENTRYPOINT ["/entrypoint.sh"]
