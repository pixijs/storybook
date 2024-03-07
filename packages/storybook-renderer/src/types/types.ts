import type { StoryContext as DefaultStoryContext } from '@storybook/csf';
import type { parameters } from '../config';
import { Renderer } from '@storybook/types';
import { Application, ApplicationOptions, Container, Ticker } from 'pixi.js';

export type { RenderContext } from '@storybook/types';

export type ApplicationResizeFunctionReturnType = {
  rendererWidth: number;
  rendererHeight: number;
  canvasWidth: number;
  canvasHeight: number;
};
export type ApplicationResizeFunction = (
  w: number,
  h: number
) => ApplicationResizeFunctionReturnType;

export type PixiRendererParameters = {
  applicationOptions: ApplicationOptions;
  resizeFn: ApplicationResizeFunction;
  app: Application;
  appReady: Promise<void>;
};

export type EventHandler = (e: Event) => void;

export type StoryResizeFn = (w: number, h: number) => void;

export type StoryFnPixiReturnType = {
  view: Container;
  update?: (ticker: Ticker) => void;
  resize?: StoryResizeFn;
  destroy?: () => void;
};

export interface IStorybookStory {
  name: string;
  render: (context: any) => any;
}

export interface IStorybookSection {
  kind: string;
  stories: IStorybookStory[];
}

export interface ShowErrorArgs {
  title: string;
  description: string;
}

export interface PixiFramework extends Renderer {
  component: Container;
  storyResult: StoryFnPixiReturnType;
};

export type StoryContext = DefaultStoryContext<PixiFramework> & {
  parameters: DefaultStoryContext<PixiFramework>['parameters'] & typeof parameters & {
    pixi: PixiRendererParameters;
  }
};
