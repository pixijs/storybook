/// <reference types="offscreencanvas" />

import './globals';

export * from './public-api';
export * from './public-types';

// optimization: stop HMR propagation in webpack
module?.hot?.decline();
