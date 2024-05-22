import { Container, Ticker } from 'pixi.js-legacy';
import { StoryFn } from '../types/public-types';

export class PixiStory<Args> {
  public view: Container;
  public update!: (ticker: Ticker | number) => void;
  public resize!: (width: number, height: number) => void;
  public destroy!: () => void;

  constructor(options: {
    context: Parameters<StoryFn<Args>>[1];
    init: (view: Container) => void;
    update?: (view: Container, ticker?: Ticker | number) => void;
    resize?: (view: Container, width: number, height: number) => void;
    destroy?: (view: Container) => void;
  }) {
    this.view = new Container();

    options.context.parameters.pixi.appReady.then(() => {
      options.init(this.view);
    });

    if (options.update !== undefined) {
      this.update = (ticker: Ticker | number) => {
        options.update!(this.view, ticker);
      };
    }

    if (options.resize !== undefined) {
      this.resize = (width: number, height: number) => {
        options.resize!(this.view, width, height);
      };
    }

    if (options.destroy !== undefined) {
      this.destroy = () => {
        options.destroy!(this.view);
      };
    }
  }
}
