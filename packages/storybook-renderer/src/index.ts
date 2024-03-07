/// <reference types="offscreencanvas" />

import './globals';

export * from './types/public-api';
export * from './types/public-types';

// optimization: stop HMR propagation in webpack
module?.hot?.decline();
