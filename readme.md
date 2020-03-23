# DashBot

[![CircleCI](https://circleci.com/gh/aNickzz/DashBot.svg?style=svg)](https://circleci.com/gh/aNickzz/DashBot)
[![codecov.io](https://codecov.io/github/aNickzz/DashBot/coverage.svg?branch=master)](https://codecov.io/github/aNickzz/DashBot?branch=master)

A chatbot that does whatever I feel like implementing at the time.

## What can it do

Dashbot will listen for messages on all text channels it has access to and do some simple matching (usually a regex test) to figure out which `Action` to run. Actions are registered in the `initActions` method in [DashBot.ts](src/DashBot.ts).

See the documentation in each Action to see what it does, however, some notable ones are

-   [DieAction](src/Actions/DieAction.ts)

    Rolls dice and flips coins, invoke with either `roll dX` (where X can be any whole number > 1 or < -1) or a few variants of the phrase `flip coin`.

-   [OneOffReplyAction](src/Actions/OneOffReplyAction.ts)

    There are a few of these that have different responses. Eg. `compliment` will cause DashBot to give you a random compliment. `link` will post a random link to a picture of Link. This is the most simple type of Action, all responses need to be predefined, and it will pick one randomly.

-   [ImgurSearchAction](src/Actions/ImgurSearchAction.ts)

    If you have an imgur ClientId set, this action will post an random image from the first 20 results of a [Imgur](https://imgur.com) search. Usage `!imgur cats`.

-   [NumberGameAction](src/Actions/NumberGameAction.ts)

    This is one of 2 actions that deal with multiple messages and replies (see [OngoingAction](src/Actions/OngoingAction.ts)). After invoking it with "I want to guess a number", it will prompt you to try to guess the number its thinking.

-   [PollAction](src/Actions/PollAction.ts)

    Allows you to create polls (much like other existing poll bots). `!poll "this is my question" yes no maybe "i don't know"`.

## How to use

This project uses Yarn, information on how to install and use yarn can be found [here](https://classic.yarnpkg.com/en/docs/getting-started/);

1. Clone this repo somewhere!
2. Install the dependencies with yarn by running `yarn install` in the project root.
3. Build the project with `yarn build`, you should now have a `dist` folder.
4. Create a config file `dashbot.config.js`. The only required property is `discordBotToken`

    ```javascript
    /* eslint-disable @typescript-eslint/triple-slash-reference */
    /// <reference path="src/DashBotConfig.d.ts" />

    /** @type DashbotConfig */
    const Config = {
    	discordBotToken: '',
    	minecraftClient: {
    		type: 'webhook',
    		maintainerEmail: 'your.email@exmaple.com',
    		packageAgent: 'dashbot/1.0.0',
    	},
    };

    module.exports = Config;
    ```

    To get a bot token, you need to go to the [Discord Developers](https://discordapp.com/developers/applications) website. You need to create an Application, then go to the Bot page from the menu on the left and create a bot. From there you can get your bot token and put it in the config.

5. Add your bot to your server

    So now you're almost set, but to actually test, you need to add your bot to a server, to do this you'll need to get the url below and add your client ID which you can find on your Discord Application page.

    `https://discordapp.com/api/oauth2/authorize?permissions=515136&scope=bot&client_id=YOUR_CLIENT_ID`

    Put your client id in there, and open it up. You'll get a page which will allow you to add your bot to any server you have admin control over.

6. Put the config file in the storage location (of your choice), for convenience i usually leave it in the project root.
7. Now you can run the program, in the root of the project run

    ```bash
    node dist/main.js --storage "."
    ```

    The storage flag tells dashbot where to load the config from, as well as where to store its statistics, and log files. By default it will be a directory named "storage".

8. If everything worked correctly, you can go have a look in discord, your bot should be online. Now say something like `roll d20` or `joke` to activate one of its responses.

## Known Bugs

This is a WIP so there's lots of things wrong with it, but the main one is sometimes it just stops / crashes. Not sure why, maybe discord is kicking the bot or there's some crash happening, or maybe my raspberry pi is just running out of ram. Whatever the cause, its not leaving any trace in the error log /shrug
