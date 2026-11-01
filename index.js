import "dotenv/config";
import OpenAI from "openai";
import {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder
} from "discord.js";

const required = ["DISCORD_TOKEN", "DISCORD_CLIENT_ID", "OPENAI_API_KEY"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing ${key}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const BOT_NAME = process.env.BOT_NAME || "Novax";
const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT ||
  "You are Novax, a helpful, witty, friendly Discord AI assistant. Be clear, concise, respectful, and useful. Match the user's tone without becoming abusive. Never claim to have performed actions you cannot perform.";
const history = new Map();
const MAX_TURNS = 10;
const MAX_INPUT = 6000;
const MAX_OUTPUT = 1800;

const askCommand = new SlashCommandBuilder()
  .setName("ask")
  .setDescription("Ask Novax a question.")
  .addStringOption(option =>
    option.setName("prompt")
      .setDescription("What do you want to ask?")
      .setRequired(true)
      .setMaxLength(MAX_INPUT)
  );

async function generateReply(key, prompt) {
  const previous = history.get(key) || [];
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...previous,
    { role: "user", content: prompt }
  ];

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: 700
  });

  const answer = completion.choices?.[0]?.message?.content?.trim()
    || "I couldn't generate a reply just now.";

  history.set(key, [
    ...previous,
    { role: "user", content: prompt },
    { role: "assistant", content: answer }
  ].slice(-MAX_TURNS * 2));

  return answer;
}

async function sendLongReply(send, text) {
  const chunks = text.match(/[\s\S]{1,1900}/g) || ["I have no response."];
  for (const chunk of chunks) await send(chunk);
}

client.once(Events.ClientReady, readyClient => {
  console.log(`🟣 ${BOT_NAME} is online as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.guild) return;
  if (!client.user || !message.mentions.has(client.user)) return;

  const prompt = message.content
    .replaceAll(`<@${client.user.id}>`, "")
    .replaceAll(`<@!${client.user.id}>`, "")
    .trim()
    .slice(0, MAX_INPUT);

  if (!prompt) {
    await message.reply(`Yo! I'm ${BOT_NAME}. Mention me with a question or use **/ask**.`);
    return;
  }

  await message.channel.sendTyping();
  try {
    const answer = await generateReply(`channel:${message.channelId}:user:${message.author.id}`, prompt);
    await sendLongReply(text => message.reply(text), answer);
  } catch (error) {
    console.error("Message response failed:", error);
    await message.reply("I hit an error while thinking. Check the bot host logs and API configuration.");
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== "ask") return;

  await interaction.deferReply();
  const prompt = interaction.options.getString("prompt", true).slice(0, MAX_INPUT);
  try {
    const answer = await generateReply(`slash:${interaction.channelId || "dm"}:user:${interaction.user.id}`, prompt);
    const chunks = answer.match(/[\\s\\S]{1,1900}/g) || ["I have no response."];
    await interaction.editReply(chunks[0]);
    for (const chunk of chunks.slice(1)) await interaction.followUp({ content: chunk });
  } catch (error) {
    console.error("Slash command failed:", error);
    await interaction.editReply("I hit an error while thinking. Check the bot host logs and API configuration.");
  }
});

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  const body = [askCommand.toJSON()];
  const guildId = process.env.DISCORD_GUILD_ID;

  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, guildId), { body });
    console.log("Registered /ask for the configured test server.");
  } else {
    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body });
    console.log("Registered /ask globally. Global command updates can take a while.");
  }
}

if (process.argv.includes("--register")) {
  registerCommands()
    .then(() => process.exit(0))
    .catch(error => { console.error("Command registration failed:", error); process.exit(1); });
} else {
  client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error("Discord login failed:", error);
    process.exit(1);
  });
}
