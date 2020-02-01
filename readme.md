# DashBot

A chatbot that does whatever I feel like implementing at the time.

## How to use

1. Clone and build.
2. Create a config file `dashbot.config.js`. The options should be self-explanatory.
3. Put the config file in the storage location (of your choice)

    ```javascript
    /* eslint-disable @typescript-eslint/triple-slash-reference */
    /// <reference path="src/DashBotConfig.d.ts" />

    /** @type DashbotConfig */
    const Config = {
    	botToken: '',
    	imgurClientId: '',
    	statsFileLocation: 'stats.json',
    };

    module.exports = Config;
    ```

    You can find details on how to get a bot token for discord online (that's how I figured it out).  
    The same goes for the Imgur stuff if you want it.

4.  1. Run in node

    ```bash
    cd dist
    node main.js --storage ".."
    ```

5.  1. Run in docker

    ```bash
    docker build -t dashbot .
    docker run -v "$(pwd):/home/node/app/storage" dashbot --config /home/node/app/storage
    ```

## What can it do

The magic is in the mystery but if you want to know you can check the code.
