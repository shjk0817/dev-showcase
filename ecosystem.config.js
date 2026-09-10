// PM2 生产进程配置
module.exports = {
  apps: [
    {
      name: "dev-showcase",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "/root/dev-showcase",
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
    },
  ],
};
