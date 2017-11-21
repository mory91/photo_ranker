const config = require('./config')
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const channelId = config.MAIN_CHANNEL
const acChannelId = config.ACC_CHANNEL
const bot = new Telegraf(config.TOKEN)


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/photo_ranker');

const Message = require('./models/message')

bot.start((ctx) => {
	return ctx.reply('عکس بده')
})
bot.on("photo", (ctx) => {
	Message.find({sender: ctx.message.from.id}).count(function(err, data) {
		if(err)
			console.log(err)
		else {
			if (data >= 5) {
				console.log("دیگه بسه")
			} else {
				ctx.telegram.sendCopy(acChannelId, ctx.message, Markup.inlineKeyboard([Markup.callbackButton('تایید', 'accept')]).extra())
				.then((data) => {
					let msg = new Message();
					msg.sender = ctx.message.from.id;
					msg.message = ctx.message;
					msg.voters = [];
					msg.messageId = data.message_id;
					msg.voteNum = 0;
					msg.state = "na";
					msg.save(function(err) {
						if (err)
							console.log(err)
					})
				})
			}
		}
	})
})

bot.action('accept', (ctx, next) => {
	let cbq = ctx.update.callback_query
	let mid = ctx.update.callback_query.message.message_id	
	ctx.telegram.sendCopy(channelId, cbq.message, Markup.inlineKeyboard([Markup.callbackButton('رای بده', 'vote')]).extra())
	.then((data) => {
		let msg = Message.findOne({messageId: cbq.message.message_id}, function(err, msg) {
			if (err) {
				console.log(err)
			} else if (msg == null) {
				console.log("فرستادی")
			} else {
				if (msg.state == "a")
					console.log("فرستادی")
				else {
					msg.state = "a";
					msg.messageId = data.message_id
					msg.save(function(err) {
						if(err)
							console.log(err)
					})
					ctx.telegram.editMessageReplyMarkup(acChannelId, mid, "", Markup.inlineKeyboard([Markup.callbackButton('فرستاده شد', 'hech')]))				
					console.log("فرستاده شد")
				}
			}
		})
	})
	return next()
})


bot.action('vote', (ctx, next) => {
	let mid = ctx.update.callback_query.message.message_id
	Message.findOne({messageId: mid}, function(err,  data){
		if (err) {
			console.log(err)
		} else {
			if (data.voters.indexOf(ctx.update.callback_query.from.id) > -1)
				console.log("قبلن رای دادی")
			else {
				data.voters.push(ctx.update.callback_query.from.id)
				data.voteNum = data.voteNum + 1
				data.save(function(err) {
					if(err)
						console.log(err)
				})
				ctx.telegram.editMessageReplyMarkup(channelId, mid, "", Markup.inlineKeyboard([Markup.callbackButton('رای بده' + '  ' + data.voteNum, 'vote')]))				
				console.log("رایت ثبت شد")
			}
		}
	})
	return next()
})



bot.startPolling()