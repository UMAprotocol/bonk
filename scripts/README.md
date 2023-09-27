# Scripts

This directory contains a collection of scripts to be used with the SLAs.

- twitter.js -> checkTweets(): this function checks if a Twitter user tweeted a minimum number of daily tweets in the past days


### Commands

```
// install dependencies
npm install

// run tests
node --test
```

### Usage

```
import { checkTweets } from "./twitter.js";

const committedSuccessfully = await checkTweets("twitter-user", numberOfDays, minTweetsPerDay);
```