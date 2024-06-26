import equals from 'deep-equal';
import type { ApplicationOptions } from 'pixi.js';
import { Application, Ticker } from 'pixi.js';

import type { RenderContext, RenderToCanvas } from '@storybook/types';
import { dedent } from 'ts-dedent';
import type {
  ApplicationResizeFunction,
  ApplicationResizeFunctionReturnType,
  EventHandler,
  PixiFramework,
  StoryFnPixiReturnType,
} from './types/types';

let pixiApp: Application;
let canvas = document.createElement('canvas');
canvas.style.display = 'block';
let appReady: Promise<void>;
let lastApplicationOptions: ApplicationOptions;
let storyState: {
  resizeHandler: EventHandler;
  storyObject: StoryFnPixiReturnType;
} | null = null;
const resizeState = {
  w: 0,
  h: 0,
  canvasWidth: 0,
  canvasHeight: 0,
};

function updater() {
  let first = false;
  return (ticker: Ticker) => {
    if (first) {
      resizeApplication({
        containerWidth: window.innerWidth,
        containerHeight: window.innerHeight,
        app: pixiApp,
        resizeFn: resizeDefault,
        force: true,
      });
    }
    appReady.then(() => {
      storyState?.storyObject?.update?.(ticker);
    });
  };
}

function resizeDefault(w: number, h: number): ApplicationResizeFunctionReturnType {
  return {
    rendererWidth: w,
    rendererHeight: h,
    canvasWidth: w,
    canvasHeight: h,
  };
}

function getPixiApplication(applicationOptions: ApplicationOptions): Application {
  // Destroy previous app instance and create a new one each time applicationOptions
  // changes - in theory it shouldn't be often
  if (!equals(applicationOptions, lastApplicationOptions)) {
    if (pixiApp) {
      pixiApp.destroy(true);
    }

    // check if Application has init method
    if (!Application.prototype.init) {
      pixiApp = new Application({ ...applicationOptions, view: canvas });
      appReady = Promise.resolve();
    } else {
      pixiApp = new Application();
      appReady = pixiApp.init({ ...applicationOptions, canvas });
    }

    lastApplicationOptions = applicationOptions;
  }

  return pixiApp;
}

function resizeApplication({
  containerWidth,
  containerHeight,
  app,
  resizeFn,
  storyObject,
  force = false,
}: {
  containerWidth: number;
  containerHeight: number;
  app: Application;
  resizeFn: ApplicationResizeFunction;
  storyObject?: StoryFnPixiReturnType;
  force?: boolean;
}) {
  const { renderer } = app;
  const newSize = resizeFn(containerWidth, containerHeight);
  if (
    force ||
    resizeState.w !== newSize.rendererWidth ||
    resizeState.h !== newSize.rendererHeight ||
    resizeState.canvasWidth !== newSize.canvasWidth ||
    resizeState.canvasHeight !== newSize.canvasHeight
  ) {
    resizeState.w = newSize.rendererWidth;
    resizeState.h = newSize.rendererHeight;
    resizeState.canvasWidth = newSize.canvasWidth;
    resizeState.canvasHeight = newSize.canvasHeight;
    canvas.style.width = `${newSize.canvasWidth}px`;
    canvas.style.height = `${newSize.canvasHeight}px`;
    window.scrollTo(0, 0);
    if (renderer) renderer.resize(resizeState.w, resizeState.h);
    storyObject?.resize?.(resizeState.w, resizeState.h);
  }
}

function initResize({
  app,
  resizeFn,
  storyObject,
}: {
  app: Application;
  resizeFn: ApplicationResizeFunction;
  storyObject?: StoryFnPixiReturnType;
}): EventHandler {
  const storyResizeHandler = (e: Event) =>
    resizeApplication({
      containerWidth: window.innerWidth,
      containerHeight: window.innerHeight,
      app,
      resizeFn,
      storyObject,
    });

  // TODO: throttle/debounce?
  window.addEventListener('resize', storyResizeHandler);
  // Manually call resize each story render, use force to ensure `storyResizeFn` is called
  // if it exists, since story component will be recreated
  appReady.then(() => {
    resizeApplication({
      containerWidth: window.innerWidth,
      containerHeight: window.innerHeight,
      app,
      resizeFn,
      storyObject,
      force: Boolean(storyObject?.resize),
    });
  });

  return storyResizeHandler;
}

let updateRef: (ticker: Ticker) => void;
function addStory({
  app,
  resizeFn,
  storyObject,
}: {
  app: Application;
  resizeFn: ApplicationResizeFunction;
  storyObject: StoryFnPixiReturnType;
}): EventHandler {
  const storyResizeHandler = initResize({
    app,
    resizeFn,
    storyObject,
  });

  app.stage.addChild(storyObject.view);

  if (storyObject.update) {
    updateRef = updater();
    Ticker.shared.add(storyObject.update, updateRef);
  }

  return storyResizeHandler;
}

function removeStory({
  app,
  storyObject,
  storyResizeHandler,
}: {
  app: Application;
  storyObject: StoryFnPixiReturnType;
  storyResizeHandler: EventHandler;
}) {
  if (storyObject.update) {
    Ticker.shared.remove(storyObject.update, updateRef);
  }

  app.stage.removeChild(storyObject.view);

  window.removeEventListener('resize', storyResizeHandler);

  storyObject.destroy?.();
}

export const renderToDOM: RenderToCanvas<PixiFramework> = (
  { storyContext, unboundStoryFn, kind, id, name, showMain, showError, forceRemount }: RenderContext<PixiFramework>,
  domElement: unknown,
) => {
  const canvasElement = domElement as HTMLCanvasElement;

  const { parameters } = storyContext;
  const { pixi: pixiParameters } = parameters;
  const { applicationOptions, resizeFn = resizeDefault } = pixiParameters;

  // Create a new PIXI.Application instance each time applicationOptions changes, ideally
  // applicationOptions is set globally in pixi parameters in `.storybook/preview.ts`, but
  // it's possible to override this on a per-story basis if needed
  // TODO: recreate PIXI.Application if forceRemount is true?
  const app = getPixiApplication(applicationOptions);

  // Expose app to a global variable for debugging using `pixi-inspector` (https://github.com/bfanger/pixi-inspector)
  (globalThis as any).__PIXI_APP__ = app;

  if (canvasElement.firstChild !== canvas || forceRemount) {
    canvasElement.innerHTML = '';
    canvasElement.appendChild(canvas);
  }

  if (storyState) {
    // Each story rerender (basically when any args are changed in Storybook's Controls
    // Panel), remove and kill the last story's PIXI component instance, but keep the same
    // PIXI Application instance alive. We'll recreate a new component instance with any
    // changed args. This is different to how a reactive framework would work, but is
    // necessary for PIXI's imperative style
    removeStory({
      app,
      storyObject: storyState.storyObject,
      storyResizeHandler: storyState.resizeHandler,
    });
    storyState = null;
  }

  const storyObject = unboundStoryFn({
    ...storyContext,
    parameters: {
      ...parameters,
      pixi: {
        ...pixiParameters,
        app,
        appReady,
      },
    },
  });
  showMain();

  if (!storyObject.view) {
    showError({
      title: `Expecting a StoryFnPixiReturnType from the story: "${name}" of "${kind}".`,
      description: dedent`
        Did you forget to return the correct object from the story?
      `,
    });
    return () => {};
  }

  const storyResizeHandler = addStory({ app, resizeFn, storyObject });
  storyState = {
    storyObject,
    resizeHandler: storyResizeHandler,
  };

  return () => {
    // This cleanup function only runs when a story is unloaded, not after a rerender:
    // Remove and kill this story, see storyState check above for handling rerenders
    removeStory({ app, storyObject, storyResizeHandler });
  };
}

export const renderToCanvas: RenderToCanvas<PixiFramework> = renderToDOM;