import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

for (const key of ["DISCORD_TOKEN", "DISCORD_CLIENT_ID"]) {
  if (!process.env[key]) throw new Error(`Missing ${key} in environment.`);
}

const commands = [
  new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask Novax a question.")
    .addStringOption(option =>
      option.setName("prompt")
        .setDescription("What do you want to ask?")
        .setRequired(true)
        .setMaxLength(6000)
    )
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
const route = process.env.DISCORD_GUILD_ID
  ? Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID)
  : Routes.applicationCommands(process.env.DISCORD_CLIENT_ID);

await rest.put(route, { body: commands });
console.log("Registered Novax slash commands.");
