import Interaction from '../ChatServer/Interaction';
import DashBot from '../DashBot';
import { EventForEmitter } from '../Events';
import { AdventurerIntroduction } from '../Grammars/AdventurerIntroduction';
import Tracery from '../tracery/Tracery';

export default class TraceryInteraction implements Interaction {
	register(bot: DashBot) {
		bot.on('message', this.onMessage.bind(this));
	}

	onMessage(event: EventForEmitter<DashBot, 'message'>) {
		const message = event.data;
		const textContent = message.textContent;

		if (
			/^who am i\??$/i.test(textContent) ||
			/^introduce me\.?$/i.test(textContent)
		) {
			message.channel.sendText(
				Tracery.generate(AdventurerIntroduction, 'origin')
			);
			event.cancel();
		}
	}
}
