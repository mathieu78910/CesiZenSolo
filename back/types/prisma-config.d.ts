declare module "prisma/config" {
  export type Config = any;
  export function defineConfig(config: Config): Config;
}
