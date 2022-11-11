# Storybook for PixiJS

---

Storybook for PixiJS is a UI development environment for your PixiJS Components.
With it, you can visualize different states of your Components and develop them interactively.

![Storybook Screenshot](https://github.com/storybookjs/storybook/blob/main/media/storybook-intro.gif)

Storybook runs outside of your app.
So you can develop UI components in isolation without worrying about app specific dependencies and requirements.

## Getting Started

We don't currently have a init script for PixiJS storybook. Currently the easiest way is
to initialize with the html framework and manually edit the configuration:

```sh
cd my-app
npx storybook@7.0.0-alpha.48 init -t html
```

Remove HTML framework/renderer and install PixiJS framework/renderer:

```sh
npm remove @storybook/html @storybook/html-webpack5 --save-dev
npm install storybook-pixi storybook-pixi-webpack5 --save-dev
```

Replace `.storybook/main.js` with the below, setting up the correct paths as necessary.

```javascript
module.exports = {
  stories: ['RELATIVE_PATH_TO_STORIES'],
  staticDirs: ['RELATIVE_PATH_TO_ASSETS'],
  logLevel: 'debug',
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-backgrounds',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    '@storybook/addon-links',
    '@storybook/addon-highlight',
  ],
  core: {
    channelOptions: { allowFunction: false, maxDepth: 10 },
    disableTelemetry: true,
  },
  features: {
    buildStoriesJson: true,
    breakingChangesV7: true,
  },
  framework: 'storybook-pixi-webpack5',
};
```

Replace `.storybook/preview.js` with:

```javascript
export const parameters = { 
  layout: 'fullscreen', 
  pixi: {
    // these are passed as options to `PIXI.Application` when instantiated by the 
    // renderer
    applicationOptions: {
      backgroundColor: 0x1099bb,
      resolution: 1,
    },
    // optional, if you want to provide custom resize logic, pass a function here,
    // if nothing is provided, the default resize function is used, which looks like
    // this, where w and h will be the width and height of the storybook canvas.
    resizeFn: (w, h) => {
      return {
        rendererWidth: w,
        rendererHeight: h,
        canvasWidth: w,
        canvasHeight: h,
      };
    },
  },
};
```

Depending on where you want to keep your story source, either delete `src/stories` folder
if you plan to keep your stories co-located with their components, or empty `src/stories`
of the example HTML stories and replace with your own. See below for instructions on
how to write PixiJS Stories in the correct format.

## PixiJS Stories

Unlike reactive web UI frameworks, PixiJS requires a more imperative code style to interact
with the HTML5 Canvas API. Components are added to a display list, most commonly via a
top level Application instance, and often need to respond to application-level events and
callbacks. This Pixi renderer, handles setting up an Application and Renderer for you
and handles adding and removing your Story's DisplayObject from the Stage, but in order to
accommodate this, PixiJS stories must return a JS object with a fixed API:

```typescript
type StoryFnPixiReturnType = {
  view: DisplayObject; 
  // optionally respond to requestAnimationFrame tick
  update?: (delta: number) => void;
  // optionally respond to application level resizing
  resize?: (rendererWidth: number, rendererHeight: number) => void;
  // optionally clean up things when story is rerendered / removed - this happens a lot, so do it!
  destroy?: () => void;
}
```

If your component already matches this particular interface, then you can just return an
instance of it.

### Typescript

`npx sb init` will select `.ts` starter stories if your `package.json` has typescript as a dependency. If starting a new project,
run `npm init` and `npm install typescript --save-dev` before initializing storybook to get the typescript starter stories.

---

Storybook also comes with a lot of [addons](https://storybook.js.org/addons) and a great API to customize as you wish.
You can also build a [static version](https://storybook.js.org/docs/html/sharing/publish-storybook) of your Storybook and deploy it anywhere you want.
