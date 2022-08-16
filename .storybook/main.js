const path = require("path");

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [],
  framework: "@storybook/html",
  core: {
    disableTelemetry: true,
  },
  features: {
    storyStoreV7: true,
  },
  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "novo-ui": path.resolve(__dirname, "../src/main/core.ts"),
    };

    return config;
  },
};
