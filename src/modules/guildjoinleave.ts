import { MessageEmbed, TextChannel } from "discord.js";
import { cfg, client, vedbot } from "../vedbot";
import { BotModule } from "../utils/interface";
import { ids } from "../database/database";

export default {
  name: "guildjoinleave",
  description: "Notifies, in a predefined log channel, of members leaving/joining.",
  state: true,
  guilds: ["cs", "dh"],
  async onMemberJoin(member) {
    const serverKey = this.guilds.find(async (srv) => await ids.getServerId(srv) === member.guild.id);
    const logChannel = await client.channels.fetch(await ids.getChannelId(serverKey!, "log")) as TextChannel;

    logChannel?.send({
      embeds: [
        new MessageEmbed()
          .setTitle(":o: - Joined the server:")
          .setDescription(`<@${member.id}>`)
          .setColor("GREEN")
          .setTimestamp(),
      ],
    });

    // if (member.guild.id === cfg.servers.dh.id) {
    //   vedbot.guilds.dh.channels.get("newbie")?.send({
    //     content: `<@${member.id}>`,
    //     embeds: [
    //       new MessageEmbed()
    //         .setTitle(`Merhaba, ${member.displayName} :)`)
    //         .setDescription("Sunucunun tamamına erişmek için lütfen;")
    //         .addFields([
    //           {
    //             name: "#1",
    //             value: `<#${cfg.servers.dh.channels.rules}>'ı onaylayınız`,
    //           },
    //           {
    //             name: "#2",
    //             value: `<#${cfg.servers.dh.channels.rolepick}> kanalından bölüm ve sınıf seçiniz`,
    //           },
    //         ])
    //         .setTimestamp()
    //         .setFooter({ text: "Teşekkürler." })
    //         .setColor("RANDOM")
    //         .setThumbnail(member.guild.iconURL() || ""),
    //     ],
    //   });
    // }
  },
  async onMemberLeave(member) {
    const serverKey = this.guilds.find(async (srv) => await ids.getServerId(srv) === member.guild.id);
    const logChannel = await client.channels.fetch(await ids.getChannelId(serverKey!, "log")) as TextChannel;

    logChannel?.send({
      embeds: [
        new MessageEmbed()
          .setTitle(":x: - Left the server:")
          .setDescription(`<@${member.id}>`)
          .setColor("RED")
          .setTimestamp(),
      ],
    });
  },
} as BotModule;
