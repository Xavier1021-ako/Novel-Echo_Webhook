# Novax Discord AI

Novax is an OpenAI-powered Discord bot. It replies when a user **mentions the bot** or uses **/ask**. It does not read or answer every message.

## Features

- Mention-to-chat replies
- `/ask` slash command
- Short in-memory conversation context per user/channel (cleared when the process restarts)
- Configurable model, name, and system prompt
- No webhook URL required

## Requirements

- Node.js 20+
- A Discord application and bot
- An OpenAI API key (API usage may cost money)

## 1. Create the Discord bot

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and create an application named **Novax**.
2. Open **Bot** and add a bot user.
3. Copy its bot token and keep it private. If it was ever exposed, reset it immediately.
4. Under **OAuth2 → URL Generator**, select the `bot` and `applications.commands` scopes.
5. Select the permissions **View Channels**, **Send Messages**, **Read Message History**, and **Use Slash Commands**. Use the generated URL to invite the bot to your server.
6. Under **Bot → Privileged Gateway Intents**, enable **Message Content Intent** so the bot can read messages that mention it. Save changes.

## 2. Configure the project

1. Install Node.js 20 or newer.
2. Clone this repository and open its folder in a terminal.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Put your Discord bot token, application client ID, and OpenAI API key in `.env`. Never share these values or commit `.env`.

Optional: set `DISCORD_GUILD_ID` to your test server ID. Guild slash commands update faster than global commands.

## 3. Register commands and run

```bash
npm run commands
npm start
```

Mention Novax in a server channel, or run `/ask`.

## Hosting

To keep Novax online, deploy this Node.js project to a host that supports a persistent process. Add the same environment variables in the host's secret/environment-variable settings, then use:

- Build/install: `npm install`
- Start: `npm start`
- Node version: `20+`

Do not put tokens or API keys in source code, GitHub commits, screenshots, or Discord messages. Do not use a Discord webhook token as a bot token.

## Configuration

| Variable | Required | Purpose |
|---|---:|---|
| `DISCORD_TOKEN` | Yes | Discord bot token |
| `DISCORD_CLIENT_ID` | Yes | Application ID |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `DISCORD_GUILD_ID` | No | Test server ID for guild commands |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o-mini` |
| `BOT_NAME` | No | Defaults to `Novax` |
| `SYSTEM_PROMPT` | No | Customize assistant behavior |

## Privacy and safety

Conversation context is kept only in process memory and is not persisted by this bot. Restarting the bot clears it. Do not use this bot to collect passwords, private keys, or sensitive personal information. OpenAI API usage is separate from a ChatGPT subscription and may incur charges; get a parent/guardian's help before enabling paid billing.

## Troubleshooting

- **Bot is offline:** confirm the process is running and the Discord token is correct.
- **Mention receives no reply:** enable Message Content Intent in the Developer Portal and ensure the bot can view and send messages in that channel.
- **/ask is missing:** run `npm run commands` again and check the application ID and optional guild ID.
- **OpenAI error:** verify the API key, model availability, and API billing/limits in the OpenAI platform.
