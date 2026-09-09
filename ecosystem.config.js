module.exports = {
  apps: [
    {
      name: "wayshub-frontend",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "development",
        HOST: "0.0.0.0",
        PORT: 3000
      }
    }
  ]
};
