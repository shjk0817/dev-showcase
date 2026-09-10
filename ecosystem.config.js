// PM2 生产进程配置
const path = require("path");

module.exports = {
  apps: [
    {
      name: "dev-showcase",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: path.resolve(__dirname),
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
    },
  ],
};
