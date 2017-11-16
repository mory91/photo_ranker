const config = require('./config')
const Telegraf = require('telegraf')

const channelId = config.CHANNEL
const bot = new Telegraf(config.TOKEN)
bot.start((ctx) => {

	console.log(ctx)
	return ctx.reply('عکس بده')
})

bot.on("photo", (ctx) => {
	ctx.telegram.sendCopy(channelId, ctx.message)
})

bot.startPolling()