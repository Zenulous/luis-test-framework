import {Conversation, Turn} from "./models/Conversation";
import jsonFile = require("jsonfile");
import {LuisAuthoringConnector} from "./connectors/LuisAuthoringConnector";
import * as path from "path";
import {config} from "dotenv";
import * as core from "@actions/core";

async function main() {
  const arg = process.argv[2];
  if (!arg || !(arg === "build" || arg === "publish")) {
    throw Error("Usage: index.js [build || publish] ");
  }
  config({
    path: path.join(__dirname, "..", ".env"),
  });

  const luisConnector = new LuisAuthoringConnector(
    process.env.LUIS_ENDPOINT!,
    process.env.LUIS_AUTHORING_KEY!
  );

  if (arg === "publish") {
    console.log("Publishing latest model in staging...");
    await luisConnector.publishLatestStagingModelToProduction();
    console.log("✔️ Publish succeeded!");

    return;
  }

  if (arg === "build") {
    const framesConversations = jsonFile.readFileSync(
      path.join(__dirname, "..", "data/frames/frames.json")
    ) as Conversation[];

    const userTurns: Turn[] = [];
    for (const conversation of framesConversations) {
      for (const turn of conversation.turns) {
        if (turn.author === "user") {
          userTurns.push(turn);
        }
      }
    }

    const filteredUserTurns = userTurns.filter(
      turn =>
        turn.labels.acts_without_refs.length === 0 ||
        turn.labels.acts_without_refs.length === 1
    );

    console.log("Building LUIS model...");

    console.log("[1/4] Posting utterances to LUIS...");
    await luisConnector.postTurnsAsUtteranceExample("1", filteredUserTurns);
    await luisConnector.trainApplication("1");
    console.log("[2/4] Training model...");
    await new Promise(resolve => setTimeout(resolve, 60000));
    console.log("[3/4] Enabling Bing spell check publish setting...");
    await luisConnector.enableBingSpellCheckPublishSetting();
    while (true) {
      try {
        console.log("[4/4] Publishing model to staging...");
        await luisConnector.publishVersionToStaging("1");
        return;
      } catch {
        console.log("Waiting for LUIS to finish training...");
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }
  }
}

main().catch(err => core.setFailed(`Task failed due to error ${err}`));
