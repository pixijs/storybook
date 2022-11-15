import type { StorybookConfig } from './types';

export * from './types';

export const webpack: StorybookConfig['webpack'] = (config) => {
  const rules = [
    ...(config.module?.rules || []),
    {
      test: /\.(png|jpg|gif|woff|woff2)$/,
      type: 'asset/inline',
    },
    {
      test: /\.(mp4|ogg|svg)$/,
      type: 'asset/resource',
    },
    {
      test: /\.(glsl|frag|vert|wgsl)$/,
      type: 'asset/source',
    },
  ];

  // eslint-disable-next-line no-param-reassign
  config.module = config.module || {};
  // eslint-disable-next-line no-param-reassign
  config.module.rules = rules;

  return config;
};
