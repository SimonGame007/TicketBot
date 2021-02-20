const express = require('express');
const app = express();
app.get('/', (request, response) => {
	const ping = new Date();
	ping.setHours(ping.getHours() - 3);
	console.log(
		`Ping recebido às ${ping.getUTCHours()}:${ping.getUTCMinutes()}:${ping.getUTCSeconds()}`
	);
	response.sendStatus(200);
});
app.listen(process.env.PORT);

const Discord = require('discord.js');
const client = new Discord.Client({partials: ["MESSAGE", "USER", "REACTION"]});
const {prefix} = require('./config.json');
const enmap = require('enmap');


const settings = new enmap({
    name: "settings",
    autoFetch: true,
    cloneLevel: "deep",
    fetchAll: true
});

client.on('ready', () => {
    console.log('ready')
});

client.on('message', async message => {
    if(message.author.bot) return;
    if(message.content.indexOf(prefix) !== 0) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command == "ticket-open") {
        
        let channel = message.mentions.channels.first();
        if(!channel) return message.reply("Mencione um canal");
        var motivo = args.slice(1).join(" ");
   if(!motivo) return message.reply('Diga algo')

        

        let sent = await channel.send(new Discord.MessageEmbed()
            .setTitle("Ticket")
            .setDescription(motivo)
            .setFooter("ticket")
            .setColor("00ff00")
        );
      

        sent.react('🎫');
        settings.set(`${message.guild.id}-ticket`, sent.id);
       message.channel.send("Ticket criado com suscesso!")
    }

    if(command == "ticket-close") {
        if(!message.channel.name.includes("ticket-")) return message.channel.send("o ticket fechado")
        message.channel.delete();
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if(user.partial) await user.fetch();
    if(reaction.partial) await reaction.fetch();
    if(reaction.message.partial) await reaction.message.fetch();

    if(user.bot) return;

    let ticketid = await settings.get(`${reaction.message.guild.id}-ticket`);

    if(!ticketid) return;

    if(reaction.message.id == ticketid && reaction.emoji.name == '🎫') {
        reaction.users.remove(user);

        reaction.message.guild.channels.create(`ticket-${user.username}`, {
            permissionOverwrites: [
                {
                    id: user.id,
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                },
                {
                    id: reaction.message.guild.roles.everyone,
                    deny: ["VIEW_CHANNEL"]
                }
            ],
            type: 'text'
        }).then(async channel => {
            channel.send(`<@${user.id}>`, new Discord.MessageEmbed()
            .setTitle("olá")
            .setDescription(`Fale,qual é sua dúvida?`)
            .setColor("00ff00")
            .setFooter(`use l!ticket-close para fechar o ticket!`)
            )

        })
    }
});
client.login(process.env.TOKEN);