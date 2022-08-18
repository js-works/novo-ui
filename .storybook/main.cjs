const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [],
  framework: '@storybook/html',
  core: {
    disableTelemetry: true
  },
  features: {
    storyStoreV7: true
  },
  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'novo-ui/ext': path.resolve(__dirname, '../src/main/ext.ts'),
      'novo-ui/html': path.resolve(__dirname, '../src/main/html.ts'),
      'novo-ui/jsx-runtime': path.resolve(
        __dirname,
        '../src/main/jsx-runtime.ts'
      ),
      'novo-ui': path.resolve(__dirname, '../src/main/core.ts')
    };

    return config;
  }
};
