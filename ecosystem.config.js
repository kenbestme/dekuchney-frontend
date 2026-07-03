module.exports = {
  apps: [
    {
      name: "dekuchney-frontend",
      script: "npm.cmd",
      args: "run start",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};