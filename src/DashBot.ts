import { Client, Message, TextChannel } from 'discord.js';
import selectRandom from './SelectRandom';

export default class DashBot {
	constructor(public readonly client: Client) {
		client.on('message', this.onMessage.bind(this));
		client.on('presenceUpdate', (oldMember, newMember) => {
			if (newMember.presence) {
			}
		});
		this.initActions();
	}

	private onMessage(message: Message) {
		if (message.author.bot) return;
		const handled = this.actions.some(
			action => action.handle(message).handled
		);
		console.log(`Message ${handled ? 'handled' : 'ignored'}`);
	}

	private initActions() {
		this.actions.push(
			new OneOffReplyAction(
				this,
				['compliment'],
				[
					'@n, you have beautiful eyes.',
					'@n, your face reminds me of someone who has a beautiful face.',
					"Music is better when I listen to it with @n! Oh wait, this isn't plug.dj! :open_mouth:",
					"I don't care about trying to be more human-like, but if I could be more like @n I would be happy.",
				]
			),

			new OneOffReplyAction(
				this,
				msg => /^(oh )?((hey|hi|hello) )?dash ?bot/i.test(msg.content),
				[
					'Oh, hello @n. :|',
					"Another one... Please, @n, don't touch anything.",
					"I hope you'll be more interesting than the others, @n.",
					"I suppose you'll be expecting me to do some tricks @n. I don't do tricks.",
					"My programming dictates that I welcome you @n, but I won't enjoy it.",
					'Hello @n.',
					'Hi @n.',
					'Hey @n!',
					"Kon'nichiwa @n-san, kangei.",
					"Hey @n, glad you're here.",
					'Welcome to the room @n.',
					'Enjoy your stay @n.',
					'Ladies, gentlemen, and non-binaries, I present to you @n.',
					'Oh, you noticed i was here. You are very observant @n',
					'Beep boop... does not compute',
					':eyes:',
					"I'm sorry, my responses are limited. You must ask the right questions.",
				]
			),

			new OneOffReplyAction(
				this,
				msg => /^link(age)? (pls|please)$/i.test(msg.content),
				[
					'http://i.imgur.com/03t8FfH.gif',
					'http://i.imgur.com/oeCQSZa.gif',
					'http://24.media.tumblr.com/tumblr_mdcyicRSCh1r84nrbo2_400.gif',
					'http://fc09.deviantart.net/fs70/f/2012/019/6/6/dance_link__daaance__by_nasakii-d4mzerp.gif',
					'http://fc06.deviantart.net/fs71/f/2012/063/4/e/links_dubstep_dance_by_13alicia-d4rq2jm.gif',
					'http://fc06.deviantart.net/fs44/f/2009/117/9/0/Dance_chibi_Link_dance_xD_by_sparxpunx.gif',
					'http://img2.wikia.nocookie.net/__cb20140626040013/walkingdead/images/8/85/Link_dance.gif',
					'http://i859.photobucket.com/albums/ab159/gothictsukasa/Legend-of-zelda-link-navi.gif',
					'http://images6.fanpop.com/image/photos/32500000/Link-the-legend-of-zelda-32575476-500-500.gif',
				]
			),

			new OneOffReplyAction(
				this,
				msg => /^pony (pls|please)$/i.test(msg.content),
				[
					'http://media.giphy.com/media/mRqTOQkwmO9xe/giphy.gif',
					'http://i284.photobucket.com/albums/ll40/JazzEx022/111009-animatedapple_bloomdeadpoolscootaloosilver_spoonSpider-ManspidermanSweetie_BelleTwist.gif',
					'http://media.giphy.com/media/oDq2jEKDLJ8E8/giphy.gif',
					'http://media1.giphy.com/media/I1hC7mQZpW4jS/giphy.gif',
					'http://31.media.tumblr.com/8dd4c7fe07aead115ea3e6171708d1ca/tumblr_modktorBMz1rthxy9o1_500.gif',
					'http://img4.wikia.nocookie.net/__cb20140309190904/mlp/images/d/dc/AppleHappyJumping.gif',
					//dancing
					'http://4.bp.blogspot.com/-7Rj2RNCajsE/UK6T9HBBU9I/AAAAAAABDmw/cDHRKhiOClI/s1600/32271__safe_animated_dinky-hooves_dance.gif',
					'http://www.gurl.com/wp-content/uploads/2013/09/my-little-pony-dancing-car.gif',
					'http://img3.wikia.nocookie.net/__cb20110314152016/mlpfanart/images/c/c2/Pinkie_Pie_dancing_to_her_Zecora_song.gif',
					'http://img1.wikia.nocookie.net/__cb20110503154149/mlp/images/4/43/Gummy_dancing_S1E25.gif',
					'http://img2.wikia.nocookie.net/__cb20140415224206/mipequeoponyfanlabor/es/images/9/9a/Pony_dance_gif_by_gibsonflyingv-d4ia62q.gif',
					'http://fc07.deviantart.net/fs71/f/2013/113/5/8/my_little_pony___pesonajes_gifs_by_happysadlife-d62q7pj.gif',
					'http://img4.wikia.nocookie.net/__cb20130102165457/mlpfanart/images/e/e7/Luna_clapping.gif',
				]
			)
		);
	}

	actions: Action[] = [];
}

export class ActionResult {
	constructor(public readonly handled: boolean) {}
}

export abstract class Action {
	constructor(protected readonly client: Client) {}
	abstract handle(message: Message): ActionResult;
}

export class OneOffReplyAction extends Action {
	private readonly trigger: (message: Message) => boolean;
	constructor(
		bot: DashBot,
		triggerOrKeywords: ((message: Message) => boolean) | string[],
		private readonly replies: (
			| Parameters<TextChannel['sendMessage']>[0]
			| string
		)[]
	) {
		super(bot.client);

		if (triggerOrKeywords instanceof Array) {
			this.trigger = msg => triggerOrKeywords.includes(msg.content);
		} else {
			this.trigger = triggerOrKeywords.bind(null);
		}
	}

	handle(message: Message) {
		if (this.trigger(message)) {
			let compliment = selectRandom(this.replies);

			const replacements = [['@n', message.author.username]];

			if (typeof compliment === 'string') {
				compliment = replacements.reduce(
					(comp, replacement) =>
						comp.replace(replacement[0], replacement[1]),
					compliment
				);
				message.channel.send(compliment);
			} else {
				message.channel.send(compliment);
			}

			return new ActionResult(true);
		}

		return new ActionResult(false);
	}
}
