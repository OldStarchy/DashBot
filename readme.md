# DashBot

A chatbot that does whatever I feel like implementing at the time.

## How to use

This project uses Yarn, information on how to install and use yarn can be found [here](https://classic.yarnpkg.com/en/docs/getting-started/);

1. Clone this repo somewhere!
2. Install the dependencies with yarn by running `yarn install` in the project root.
3. Build the project with `yarn build`, you should now have a `dist` folder.
4. Create a config file `dashbot.config.js`. The only two required properties are `discordBotToken` and `statsFileLocation`

    ```javascript
    /* eslint-disable @typescript-eslint/triple-slash-reference */
    /// <reference path="src/DashBotConfig.d.ts" />

    /** @type DashbotConfig */
    const Config = {
    	discordBotToken: '',
    	statsFileLocation: 'stats.json',
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
