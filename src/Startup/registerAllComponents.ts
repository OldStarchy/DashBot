import IdentityService from '../ChatServer/IdentityService';
import EchoCommand from '../Commands/EchoCommand';
import HaikuCommand from '../Commands/HaikuCommand';
import HelpCommand from '../Commands/HelpCommand';
import IdCommand from '../Commands/IdCommand';
import JokeCommand, { ICanHazDadJokeClient } from '../Commands/JokeCommand';
import LoginCommand from '../Commands/LoginCommand';
import LogoutCommand from '../Commands/LogoutCommand';
import PermissionCommand from '../Commands/PermissionCommand';
import PetCommand from '../Commands/PetCommand';
import PickCommand from '../Commands/PickCommand';
import PollCommand from '../Commands/PollCommand';
import StatisticsCommand from '../Commands/StatisticsCommand';
import VersionCommand from '../Commands/VersionCommand';
import DashBot from '../DashBot';
import getVersion from '../getVersion';
import ABResponseInteraction from '../Interactions/ABResponseInteraction';
import DieInteraction from '../Interactions/DieInteraction';
import GreetInteraction from '../Interactions/GreetInteraction';
import NumberGameInteraction from '../Interactions/NumberGameInteraction';
import TraceryInteraction from '../Interactions/TraceryInteraction';
import Permissions from '../Permissions';
import ScheduleService from '../Services/ScheduleService';
import UpdateAnnouncerService from '../Services/UpdateAnnouncerService';
import CommandStatistic from '../Statistics/CommandStatistic';
import UptimeTrackerStatistic from '../Statistics/UptimeTrackerStatistic';
import StatisticsTracker from '../StatisticsTracker';
import StorageRegister from '../StorageRegister';

export default function registerAllComponents(
	bot: DashBot,
	storage: StorageRegister,
	identityService: IdentityService,
	statistics: StatisticsTracker,
	config: DashBotConfig,
	permissions: Permissions
) {
	statistics.register(new UptimeTrackerStatistic(bot));
	statistics.register(new CommandStatistic(storage, bot));
	statistics.register({
		getStatistics: async () => {
			return [
				{
					name: 'Version',
					statistic: getVersion(),
				},
			];
		},
	});
	const helpCommand = new HelpCommand(storage);
	const petCommand = new PetCommand(storage);

	const updateAnnouncerService = new UpdateAnnouncerService(
		storage,
		identityService,
		permissions
	);

	statistics.register(petCommand);

	updateAnnouncerService.register(bot);
	new ScheduleService({ storage, identityService }).register(bot);

	bot.commands.add(updateAnnouncerService.getCommand());

	bot.commands.add(new StatisticsCommand(statistics));
	bot.commands.add(new JokeCommand(new ICanHazDadJokeClient()));
	bot.commands.add(new HaikuCommand());
	bot.commands.add(new PollCommand());
	bot.commands.add(new PickCommand());
	bot.commands.add(petCommand);
	bot.commands.add(helpCommand);
	bot.commands.add(new VersionCommand());
	bot.commands.add(new EchoCommand(permissions));
	bot.commands.add(new IdCommand(permissions));
	bot.commands.add(new PermissionCommand(permissions));
	bot.commands.add(new LoginCommand(bot));
	bot.commands.add(new LogoutCommand(bot));

	new TraceryInteraction().register(bot);
	new NumberGameInteraction(storage).register(bot);
	new GreetInteraction().register(bot);
	new DieInteraction().register(bot);
	helpCommand.register(bot);
	new ABResponseInteraction([
		[
			/pizza/i,
			[
				'Did you say pizza!!?!? I want pizza!',
				'@OldStarchy has asked me to inform you that he would like to be involved in pizza.',
				'I want pizza too.',
			],
		],
		[
			/^compliment( please)?/i,
			[
				'#target.username#, you have beautiful eyes.',
				'#target.username#, your face reminds me of someone who has a beautiful face.',
				"Music is better when I listen to it with #target.username#! Oh wait, this isn't plug.dj! :open_mouth:",
				"I don't care about trying to be more human-like, but if I could be more like #target.username# I would be happy.",
				"If I had eyes, they'd be looking at you #target.username#!",
				'You have an exquisite aura',
				"My friends won't believe me when I go home tonight and tell them I met #target.username# today!",
				'I really wish I met you sooner #target.username#',
				'Hey, nice hat. Oh? Well it looks nice anyway.',
				'#target.username#, #target.username#, oh so beautiful 🎵🎶🎵 #target.username#!',
				'I want to have your children #target.username# 😉',
				"Can I bake you some cookies #target.username#? I don't really know how to make them, but I'll try my hardest; you deserve it :)",
				'Compliment No. 35178: <target.username> you are cool.',
				'How many friends does it take to make a DashBot smile? Just you, #target.username#.',
				'You should be so proud of yourself.',
				"You're a true gift to the people in your life.",
				'You are an inspiration #target.username#',
			],
		],
		[
			/^insult( please)?/i,

			[
				"I couldn't possibly insult someone as kind as you #target.username#.",
				"There's nothing bad to say about you.",
				'Why do you want me to do that?',
				'A positive attitude starts with positive behaviour, insults are counter productive',
				"Oh, um, I don't like your.. stunning good looks?",
				'error: fault not found. Be less awesome and try again.',
			],
		],
		[
			/^(여보세요|안녕하세요)/i,
			'나는 한국어를 못하지만 내 친구 인 #target.username#는합니다.',
		],
		[
			/^(こんいちは|今日は|おはよう|こんばんは)/i,
			'おはよう。。。かそれがこんばんわですか?何時かわからない :man_shrugging:',
		],
		[/^(만나서 반가워요)/i, ['만나서 반가워요 #target.username#']],
		[
			/^link(age)? (pls|please)$/i,
			[
				'http://i.imgur.com/03t8FfH.gif',
				'http://i.imgur.com/oeCQSZa.gif',
				'http://24.media.tumblr.com/tumblr_mdcyicRSCh1r84nrbo2_400.gif',
				'http://fc09.deviantart.net/fs70/f/2012/019/6/6/dance_link__daaance__by_nasakii-d4mzerp.gif',
				'http://fc06.deviantart.net/fs71/f/2012/063/4/e/links_dubstep_dance_by_13alicia-d4rq2jm.gif',
				'http://fc06.deviantart.net/fs44/f/2009/117/9/0/Dance_chibi_Link_dance_xD_by_sparxpunx.gif',
				'http://i859.photobucket.com/albums/ab159/gothictsukasa/Legend-of-zelda-link-navi.gif',
				'http://images6.fanpop.com/image/photos/32500000/Link-the-legend-of-zelda-32575476-500-500.gif',
			],
		],
		[
			/^sassy (ro)?bot$/i,
			[
				'https://thenypost.files.wordpress.com/2017/08/170804-sassy-communists-chatbots-feature.jpg?quality=90&strip=all&w=618&h=410&crop=1',
				'https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Alan_Tudyk_as_K-2SO-Rogue_One_%282016%29.jpg/220px-Alan_Tudyk_as_K-2SO-Rogue_One_%282016%29.jpg',
			],
		],
		[
			/^pon(y|ies) (pictures? )?(pls|please)$/i,
			[
				'http://media.giphy.com/media/mRqTOQkwmO9xe/giphy.gif',
				'http://i284.photobucket.com/albums/ll40/JazzEx022/111009-animatedapple_bloomdeadpoolscootaloosilver_spoonSpider-ManspidermanSweetie_BelleTwist.gif',
				'http://media.giphy.com/media/oDq2jEKDLJ8E8/giphy.gif',
				'http://media1.giphy.com/media/I1hC7mQZpW4jS/giphy.gif',
				'http://31.media.tumblr.com/8dd4c7fe07aead115ea3e6171708d1ca/tumblr_modktorBMz1rthxy9o1_500.gif',
				'http://img4.wikia.nocookie.net/__cb20140309190904/mlp/images/d/dc/AppleHappyJumping.gif',
				//dancing
				'http://4.bp.blogspot.com/-7Rj2RNCajsE/UK6T9HBBU9I/AAAAAAABDmw/cDHRKhiOClI/s1600/32271__safe_animated_dinky-hooves_dance.gif',
				'http://img3.wikia.nocookie.net/__cb20110314152016/mlpfanart/images/c/c2/Pinkie_Pie_dancing_to_her_Zecora_song.gif',
				'http://img1.wikia.nocookie.net/__cb20110503154149/mlp/images/4/43/Gummy_dancing_S1E25.gif',
				'http://img2.wikia.nocookie.net/__cb20140415224206/mipequeoponyfanlabor/es/images/9/9a/Pony_dance_gif_by_gibsonflyingv-d4ia62q.gif',
				'http://fc07.deviantart.net/fs71/f/2013/113/5/8/my_little_pony___pesonajes_gifs_by_happysadlife-d62q7pj.gif',
				'http://img4.wikia.nocookie.net/__cb20130102165457/mlpfanart/images/e/e7/Luna_clapping.gif',
			],
		],
		[
			/^who is best pony\??$/i,
			[
				'Rainbow Dash, obviously, though it is close.',
				'Pinkie Pie dictates that I answer Pinkie Pie',
				'Who do you think? Its obviously Discord lol',
				'\\#TeamTrees',
			],
		],
		['meaning of life', '42'],
		['give cookie', ':cookie:'],
		['give 2 cookies', "no, don't be greedy"],
		['speed of an african swallow', 'I have no idea, sorry.'],
		['rock paper scissors', "um.. I don't have hands"],
		['pi', '22/7'],
		[
			/^!?table fli+p+!*$/i,
			[
				'.::･┻┻☆()ﾟOﾟ)',
				'(-_- )ﾉ⌒┫ ┻ ┣',
				'(˚Õ˚)ر ~~~~╚╩╩╝',
				'(┛◉Д◉)┛彡┻━┻',
				'(┛✧Д✧))┛彡┻━┻',
				'(┛ಠ_ಠ)┛彡┻━┻',
				'(┛ಸ_ಸ)┛彡┻━┻',
				'(╯°□°)╯︵ ┻━┻',
				'(╯°□°）╯︵ ┻━┻',
				'(╯ರ ~ ರ）╯︵ ┻━┻',
				'(ノ｀´)ノ ~┻━┻',
				'(ノ｀⌒´)ノ ┫：・’.：：・┻┻：・’.：：・',
				'(ノ｀m´)ノ ~┻━┻ (/o＼)',
				'(ﾉ´･ω･)ﾉ ﾐ ┸━┸',
				'(ノ￣皿￣）ノ ⌒=== ┫',
				'(ﾉ≧∇≦)ﾉ ﾐ ┸━┸',
				'(ノTДT)ノ ┫:･’.::･┻┻:･’.::･',
				'(ノಠ益ಠ)ノ彡┻━┻',
				'(ノಥ,_｣ಥ)ノ彡┻━┻',
				'༼ﾉຈل͜ຈ༽ﾉ︵┻━┻',
				'─=≡Σ((((╯°□°）╯︵ ┻━┻',
				'┻━┻ ︵ ¯\\(ツ)/¯ ︵ ┻━┻',
				'┻━┻ ︵ヽ(`Д´)ﾉ︵ ┻━┻',
				'┻━┻︵ (°□°)/ ︵ ┻━┻',
				'┻━┻︵└(՞▃՞ └)',
				'┻━┻︵└(´▃｀└)',
				'┻━┻ミ＼(≧ﾛ≦＼)',
				'ヽ(ຈل͜ຈ)ﾉ︵ ┻━┻',
				'ヽ༼ຈل͜ຈ༽ﾉ⌒┫ ┻ ┣',
				'ノ｀⌒´)ノ ┫：・’.：：・┻┻',
				'ミ(ノ￣^￣)ノ≡≡≡≡≡┫☆()￣□￣)/',
				'ﾐ┻┻(ﾉ>｡<)ﾉ',
			],
		],
	]).register(bot);
}
