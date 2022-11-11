# Storybook for PixiJS

---

Storybook for PixiJS is a UI development environment for your PixiJS Components.
With it, you can visualize different states of your Components and develop them interactively.

![Storybook Screenshot](https://github.com/storybookjs/storybook/blob/main/media/storybook-intro.gif)

Storybook runs outside of your app.
So you can develop UI components in isolation without worrying about app specific dependencies and requirements.

## Getting Started

```sh
cd my-app
npx storybook init -t pixi
```

For more information visit: [storybook.js.org](https://storybook.js.org)

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
