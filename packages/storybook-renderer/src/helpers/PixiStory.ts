import { Container, Ticker } from 'pixi.js';
import { StoryContext } from '../types/types';

export class PixiStory {
  public view: Container;
  public update!: (ticker: Ticker | number) => void;
  public resize!: (width: number, height: number) => void;

  constructor(options: {
    context: StoryContext;
    init: (view: Container) => {};
    update?: (ticker?: Ticker | number) => {};
    resize?: (width: number, height: number) => {};
    destroy?: (view: Container) => {};
  }) {
    this.view = new Container();

    options.context.parameters.pixi.appReady.then(() => {
      options.init(this.view);
    });

    if (options.update !== undefined) {
      this.update = (ticker: Ticker | number) => {
        options.update!(ticker);
      };
    }

    if (options.resize !== undefined) {
      this.resize = (width: number, height: number) => {
        options.resize!(width, height);
      };
    }
  }
}
