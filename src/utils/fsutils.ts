/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import fs from "fs";
import Discord from "discord.js";
import path from "path";
import { BotCommand, BotConfig, BotModule, Offerings, SupportedDepartment } from "./interface";
import { srcrootdir, projrootdir } from "../rootdirname"
import BotFileCollection from "./botfilecollection";

const botfiles = {
  loadAll: (...botFileCollections: BotFileCollection<BotCommand | BotModule>[]): void => {
    console.log("Loading BotFiles...");
    botFileCollections.forEach((collection) => {
      fs.readdirSync(path.join(srcrootdir, collection.rootdir))
        .filter((file) => file.endsWith(".js"))
        .map(
          (file) =>
            [file, require(path.join(srcrootdir, collection.rootdir, file)).default] as [string, BotCommand | BotModule]
        )
        .forEach(([filename, fileImport]) => {
          collection.set(filename.slice(0, -3), fileImport);
          console.log(`Loaded BotFile: ${filename}`);
        });
    });
  },
  reload: (collection: BotFileCollection<BotCommand | BotModule>, filename: string): void => {
    const filePath = path.join(srcrootdir, collection.rootdir, `${filename}.js`);

    delete require.cache[require.resolve(filePath)];
    const reloadedFile: BotCommand | BotModule = require(filePath).default;
    collection.set(filename, reloadedFile);
    console.log(`Reloaded BotFile: ${filename}.js`);
  },
  getAllFileNamesSync: (...botFileCollections: BotFileCollection<BotCommand | BotModule>[]): string[] =>
    botFileCollections
      .map((collection) => fs.readdirSync(path.join(srcrootdir, collection.rootdir)))
      .reduce((acc, curr) => acc.concat(curr), [])
      .filter((filename) => filename.endsWith(".js")),
  getAllFileNames: async (...botFileCollections: BotFileCollection<BotCommand | BotModule>[]): Promise<string[]> =>
    (
      await Promise.all(
        botFileCollections.map((collection) => fs.promises.readdir(path.join(srcrootdir, collection.rootdir)))
      )
    )
      .reduce((acc, curr) => acc.concat(curr), [])
      .filter((filename) => filename.endsWith(".js")),
};

const configPath = path.join(projrootdir, "config.json");
const config = {
  load: (): BotConfig => JSON.parse(fs.readFileSync(configPath, "utf8")),
  save: async (cfg: BotConfig): Promise<void> => {
    await fs.promises.writeFile(configPath, JSON.stringify(cfg, null, 2));
    console.log("Saved config.json");
  },
};

const loadOfferings = (): Offerings => {
  const offerings: Offerings = new Discord.Collection();
  const offeringsFolder = path.join(projrootdir, "offerings_data");

  fs.readdirSync(offeringsFolder).forEach((department) => {
    offerings.set(
      department.split("_")[0] as SupportedDepartment,
      JSON.parse(fs.readFileSync(path.join(offeringsFolder, department), "utf8"))
    );
  });

  return offerings;
};

export default {
  botfiles,
  config,
  loadOfferings,
};
