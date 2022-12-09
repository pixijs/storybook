import type { StorybookConfig } from "./types";

export * from "./types";

export const vite: StorybookConfig["viteFinal"] = (config) => {
  return config;
};
