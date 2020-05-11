require('dotenv').config();
const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = "!";
const Discord = require("discord.js");
const client = new Discord.Client();

const fs = require("fs");
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync("./commands/").filter(file => file.endsWith(".js"));
for (const file of commandFiles)
{
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.on("ready", () =>
{
    console.log(`I'm online, my name is ${client.user.username}`);
});

client.on("message", message => 
{
    let args = message.content.substring(PREFIX.length).split(" ");

    switch (args[0].toLowerCase()) {
        case "check":
            client.commands.get("check").execute(message, args, message.channel);
            break;
    }
})

client.login(TOKEN);