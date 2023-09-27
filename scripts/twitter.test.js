import test from 'node:test';
import { checkTweets } from "./twitter.js"
import assert from "assert";

test("test", async () => {
    const hasTweeted = await checkTweets("elonmusk", 1, 1);
    assert.equal(hasTweeted, true);
});
