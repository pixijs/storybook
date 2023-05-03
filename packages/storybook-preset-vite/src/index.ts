import type { StorybookConfigVite } from "./types";

export * from "./types";

export const webpack: StorybookConfigVite["viteFinal"] = (config) => {
  return config;
};
