import { BotModule, cfg } from "../vedbot";

export default {
  name: "gayetiyi",
  description: "",
  state: true,
  guilds: ["dh"],
  onMessage(message) {
    const msg = message.content.toLowerCase().split(/\s/);

    if (
      cfg.servers.dh.gayetiyikeywords.every((wordlist: string[]) => wordlist.some((word) => msg.indexOf(word) !== -1))
    ) {
      const localResponse = message.channel.id !== cfg.servers.dh.channels.english ? "gayet iyi" : "very well";
      message.reply(`**${localResponse}** <:afro:744923369279062156>`);
    }
  },
} as BotModule;
