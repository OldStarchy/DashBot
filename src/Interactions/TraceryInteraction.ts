import Interaction from '../ChatServer/Interaction';
import Message from '../ChatServer/Message';
import DashBot from '../DashBot';
import { Event } from '../Events';
import { AdventurerIntroduction } from '../Grammars/AdventurerIntroduction';
import Tracery from '../tracery/Tracery';

export default class TraceryInteraction implements Interaction {
	register(bot: DashBot) {
		bot.on('message', this.onMessage.bind(this));
	}

	onMessage(event: Event<Message>) {
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
