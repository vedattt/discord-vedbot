import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection, GuildMember, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } from "discord.js";
import { BotCommand, Offerings } from "../utils/interface";
import utils from "../utils/utils";

const offerings: Offerings = new Collection(); // This is a temporary mock

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("csroles")
    .setDescription("Manage your roles for CS course sections")
    .setDefaultPermission(true)
    .addStringOption((course) =>
      course
        .setName("course")
        .setDescription("Course to manage roles for")
        .setRequired(true)
        .setChoices(...utils.objectifyChoiceArray(["CS 201", "CS 223"]))
    ),
  guilds: ["cs"],
  async execute(interaction) {
    const selectedCourse = interaction.options.getString("course", true);
    const time = Date.now();
    const roles = offerings
      .get("CS")
      ?.find((course) => course.courseCode === selectedCourse)
      ?.sections.map((el) => ({
        name: `${selectedCourse}-${el.section}`,
        id: interaction.guild?.roles.cache.find((role) => role.name === `${selectedCourse}-${el.section}`)?.id ?? "",
      }));

    const member = interaction.member as GuildMember;
    const currentRoleId = member.roles.cache
      .filter((role) => role.name.startsWith("CS "))
      .find((role) => roles?.some(({ name }) => role.name === name) ?? false)?.id;

    const componentRows = [
      new MessageActionRow().addComponents(
        new MessageSelectMenu({
          customId: `selection_${time}`,
          placeholder: "Choose your section here",
          minValues: 1,
          maxValues: 1,
          options: roles?.map((role) => ({ label: role.name, value: role.id })),
        })
      ),
    ];

    if (currentRoleId !== undefined) {
      componentRows.push(
        new MessageActionRow().addComponents(
          new MessageButton({
            customId: `deletion_${time}`,
            style: "PRIMARY",
            label: "Remove current role",
            emoji: "❌",
          })
        )
      );
    }

    await interaction.reply({
      embeds: [new MessageEmbed().setTitle("Waiting for your input...").setColor("AQUA")],
      ephemeral: true,
      components: componentRows,
    });

    try {
      const compInteraction = await interaction.channel?.awaitMessageComponent({
        time: 20000,
        filter: async (thisInteraction) => {
          const valid =
            thisInteraction.user.id === interaction.user.id &&
            (thisInteraction.customId === `selection_${time}` || thisInteraction.customId === `deletion_${time}`);

          if (valid) {
            await thisInteraction.deferUpdate();
            return true;
          }
          return false;
        },
      });

      if (compInteraction === undefined) throw Error("Interaction component might've timed out");

      if (currentRoleId !== undefined) {
        await member.roles.remove(currentRoleId);
      }

      if (compInteraction.isButton()) {
        await interaction.editReply({
          embeds: [new MessageEmbed().setTitle("Your role has been removed.").setColor("RED")],
          components: [],
        });
      } else if (compInteraction.isSelectMenu()) {
        await member.roles.add(compInteraction.values[0]);
        await interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setTitle("You have been given your role.")
              .setDescription(`**${interaction.guild?.roles.cache.get(compInteraction.values[0])?.name}**`)
              .setColor("RANDOM"),
          ],
          components: [],
        });
      }
    } catch (err) {
      await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("This command timed out.")
            .setDescription("You were not given any roles. Try again.")
            .setColor("RED"),
        ],
        components: [],
      });
    }
  },
};

export default command;
