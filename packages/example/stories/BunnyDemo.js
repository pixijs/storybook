import { Assets, Container, Sprite, Texture } from "pixi.js";
import 'pixi.js/assets'

export class BunnyDemo {
  constructor({ bunnySize, bunnySpacing, someInjectedObject }) {
    this.view = new Container();

    //async iife
    (async () => {
      const tex = await Assets.load("bunny.png");
      const numBunnies = bunnySize * bunnySize;

      for (let i = 0; i < numBunnies; i += 1) {
        const bunny = new Sprite(tex);
        bunny.buttonMode = true;
        bunny.interactive = true;
        bunny.on("pointerdown", someInjectedObject.onBunnyClick);
        bunny.x = (i % bunnySize) * bunnySpacing;
        bunny.y = Math.floor(i / bunnySize) * bunnySpacing;
        this.view.addChild(bunny);
      }

      // Center bunny sprite in local container coordinates
      this.view.pivot.x = this.view.width / 2;
      this.view.pivot.y = this.view.height / 2;
    })();
  }

  resize(w, h) {
    this.view.x = w / 2;
    this.view.y = h / 2;
  }

  update(ticker) {
    this.view.rotation -= 0.01 * ticker.deltaTime;
  }

  destroy() {
    this.view.destroy(true);
  }
}
