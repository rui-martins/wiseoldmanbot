const Discord = require("discord.js");
const axios = require("axios");
const playerUrl = "https://wiseoldman.net/api/players/";
const groupUrl = "https://wiseoldman.net/api/groups/";
const competitionUrl = "https://wiseoldman.net/api/competitions/";
const lodash = require("lodash");
const SKILLS = require("../config/skills.js");

module.exports = 
{
	name: 'check',
	description: 'Retrieves info about a Player/Group/Competition, etc. Usage: !check [entity] [name]',
	async execute(message, args, channel) 
	{
		if (args.length < 3) return;

		name = args[2];

		for (i = 3; i < args.length; i++)
		{
			name = name.concat(" " + args[i]);
		}

		switch(args[1].toLowerCase())
		{
			case "group":
				params = { name: name };

				return axios
				.get(groupUrl, { params })
				.then(result => console.log(result.data))
				.catch(error => console.log(error.message));

			case 'player':
				params = { username: name };
				
				try
				{
					player = await axios.get(playerUrl, { params });
					console.log(player.data);
				}
				catch (error)
				{
					console.log(error.message);
				}

				const { type, latestSnapshot } = player.data;

				const playerEmbed = new Discord.MessageEmbed()
					.setAuthor("Wise Old Man", "https://wiseoldman.net/img/logo.png", "https://wiseoldman.net")
					.setColor("#2980b9")
					.setTitle("Player Stats")
					.setThumbnail("https://wiseoldman.net/img/logo.png")
					.addFields(
						{ name: "**Account type**", value: type.charAt(0).toUpperCase() + type.substring(1), inline: true},
						{ name: "\u200b", value: "\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800", inline: true},
						{ name: "**Rank**", value: latestSnapshot["overall"].rank, inline: true}
					)
					.addFields(
						{ name: "**Total Level**", value: getTotalLevel(latestSnapshot), inline: true},
						{ name: "\u200b", value: "\u200b", inline: true},
						{ name: "**Overall Exp**", value: latestSnapshot["overall"].experience, inline: true},
						{ name: "\u200b", value: "\u200b"}
					)
					.setTimestamp()
					.setFooter("Wise Old Man", "https://wiseoldman.net/img/logo.png");

				
					for (s of SKILLS.filter(s => s !== "overall"))
					{
						// Capitalize first letter
						playerEmbed.addFields(
							{ name: `**${s.charAt(0).toUpperCase() + s.substring(1)}**`, value: getLevel(latestSnapshot[s].experience), inline: true }
						)
					}

				channel.send(playerEmbed);
				break;

			case "competition":
				break;
		}
	},
};

function getTotalLevel(snapshot) 
{	
	return SKILLS
			.filter(s => s !== "overall")
			.map(s => getLevel(snapshot[s].experience))
			.reduce((acc, cur) => acc + cur);
}

function getLevel(experience) 
{
	const maxlevel = 99;
	
	// Unranked
	if (experience === -1) {
	  return 0;
	}

  
	let accumulated = 0;
  
	for (let level = 1; level < maxlevel; level++) {
	  const required = getXpDifferenceTo(level + 1);
	  if (experience >= accumulated && experience < accumulated + required) {
		return level;
	  }
	  accumulated += required;
	}

	return maxlevel;
}

function getXpDifferenceTo(level) {
	if (level < 2) {
	  return 0;
	}
  
	return Math.floor(level - 1 + 300 * 2 ** ((level - 1) / 7)) / 4;
  }