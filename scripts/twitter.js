import { TwitterApi } from "twitter-api-v2";
import { DateTime, Interval } from "luxon";

export async function checkTweets(username, numberOfDays, minTweetsPerDay) {
  const client = new TwitterApi(
    "AAAAAAAAAAAAAAAAAAAAABuyqAEAAAAA6W3CcPLlofOAwcol6t3q%2B2u3BUk%3DB3LSReKLjjZSb2WHU1D6vQs95AUMCpXzG6iZSRsRv6Nse5CIso"
  );
  const user = await searchUserByUsername(client, username);
  const pastDate = DateTime.now().minus({ days: numberOfDays });
  const pastDateString = pastDate.toISO();
  // rate limits: 10 requests / 15 mins
  let tweets = await client.v2.userTimeline(user.id, {
    start_time: pastDateString,
    exclude: "replies",
    "tweet.fields": ["created_at"],
  });
  let fetchedTweets = [];
  let dateTweetsMap = {};

  for await (const tweet of tweets) {
    fetchedTweets.push({
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at,
    });
  }

  while (!tweets.done) {
    for await (const tweet of tweets) {
      fetchedTweets.push({
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
      });
    }
    tweets = await tweets.fetchNext();
  }

  for (const tweet of fetchedTweets) {
    const dateString = tweet.created_at;
    const date = DateTime.fromISO(dateString);
    dateTweetsMap[date] = [...(dateTweetsMap[date] || []), tweet];
  }

  const nowDate = DateTime.now();
  const interval = Interval.fromDateTimes(pastDate, nowDate);
  const tweetsInDay = interval.splitBy({ day: 1 }).map((d) => {
    const date = d.start.toFormat("yyyy-MM-dd");
    
    if (!dateTweetsMap[date]) return false;
    if (dateTweetsMap[date].length < minTweetsPerDay) return false;
    return true;
  });

  return tweetsInDay.filter((t) => t === false).length > 0;
}

async function searchUserByUsername(client, username) {
  const users = await client.v2.usersByUsernames(username);

  if (users.data?.length > 0) {
    const user = users.data[0];
    return {
      id: user.id,
      verified: user.verified,
      profileImageUrl: user.profile_image_url,
      username: user.username,
      name: user.name,
    };
  }

  return undefined;
}

async function wait(seconds = 1) {
  return new Promise((res, reject) => {
    setTimeout(res, seconds * 1000);
  });
}
