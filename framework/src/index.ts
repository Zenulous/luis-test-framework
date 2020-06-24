import {LuisConnector} from "./connectors/LuisConnector";
import * as path from "path";
import {config} from "dotenv";
import {TravelGrammar} from "./TravelGrammar";
import {StringManipulator} from "./StringManipulator";
import {Experiment} from "./Experiment";
import * as core from "@actions/core";
import _ from "underscore";
import yargs = require("yargs");
import {LuisQueryResponse} from "./models/LuisQueryResponse";
config({
  path: path.join(__dirname, "..", ".env"),
});

interface Arguments {
  _: "example" | "cicd" | "experiment"[];
  sample: number;
  noise: number;
  spellCheck: boolean;
  cicd?: boolean;
  experiment?: boolean;
  threshold: number;
  complexity: number;
  example?: boolean;
  specificEntityId?: number;
  oracle: "overallIntent" | "allEntities" | "specificEntity";
}

const specificEntityId = {
  "1": "origincity",
  "2": "destinationcity",
  "3": "budget",
  "4": "start",
  "5": "children",
  "6": "adults",
};

const argv = (yargs
  .usage("Usage: $0 <cmd> [options]")
  .command("cicd", "command for starting a cicd test suite", yargs => {
    yargs
      .options({
        noise: {
          type: "number",
          description:
            "Relative noise (spelling errors) to add to the CFG output, must be between 0 and 1",
          demandOption: true,
        },
        complexity: {
          type: "number",
          description:
            "Complexity of the samples (refers to number of entities), must between 1 and 6",
          demandOption: true,
        },
        sample: {
          type: "number",
          description: "Amount of samples to generate from the CFG",
          demandOption: true,
        },
        threshold: {
          type: "number",
          description:
            "Percentage at which the LUIS performance is deemed sufficient, must be between 0 and 100",
          demandOption: true,
        },
        oracle: {
          type: "string",
          description:
            'Test oracle which determines if the LUIS output is correct, can be "overallIntent", "allEntities" or "specificEntity". If "specificEntity", "specificEntityId" arg is required',
          demandOption: true,
        },
        specificEntityId: {
          type: "number",
          description:
            'Specific entity ID if oracle is set to "specificEntity". 1: origin city, 2: destination city, 3: budget, 4: start date, 5: number of children, 6: number of adults',
        },
        spellCheck: {
          type: "boolean",
          description: "Enable spell check",
        },
      })
      .check(argv => {
        if (
          !(
            argv.oracle === "overallIntent" ||
            argv.oracle === "allEntities" ||
            argv.oracle === "specificEntity"
          )
        ) {
          throw Error(
            'Invalid test oracle. Must be "overallIntent", "allEntities" or "specificEntity"'
          );
        }
        if (argv.oracle === "specificEntity" && !argv.specificEntityId) {
          throw Error(
            '"specificEntityId" arg should be included if test oracle is "specificEntity"'
          );
        }
        if (
          argv.specificEntityId &&
          !Object.keys(specificEntityId).includes(String(argv.specificEntityId))
        ) {
          throw Error("Entity ID should be an integer between 1 and 6");
        }
        if (argv.noise < 0 || argv.noise > 1) {
          throw Error("Noise value should be between 0 and 1.");
        }
        if (argv.complexity < 1 || argv.complexity > 6) {
          throw Error("Complexity should be an integer between 1 and 6");
        }
        if (argv.threshold < 0 || argv.threshold > 100) {
          throw Error("Threshold should be between 0 and 100");
        }
        if (argv.sample < 0) {
          throw Error("Sample should be an integer above 0");
        }
        return true;
      });
  })
  .command(
    "experiment",
    "command for replicating the experiment from the framework proposal with a new sample"
  )
  .command(
    "example",
    "command for generating a few example utterances, does not require LUIS"
  )
  .demandCommand()
  .strict().argv as unknown) as Arguments; // make a bit nice

async function main() {
  const luisConnector = new LuisConnector(
    process.env.LUIS_QUERY_URL!,
    process.env.BING_SPELL_CHECK_SUBSCRIPTION_KEY!
  );
  if (argv._[0] === "cicd") {
    if (argv.noise < 0 || argv.noise > 1) {
      throw Error("Noise value should be between 0 and 1.");
    }
    if (argv.threshold < 0 || argv.threshold > 100) {
      throw Error("Threshold should be between 0 and 100");
    }
    if (argv.sample < 0) {
      throw Error("Sample should be more than 0");
    }
    console.log("🤖 CI/CD proof of concept\n\n");
    const sampleSize = Math.ceil(argv.sample);

    console.log(`Noise ratio (spelling mistakes) set at ${argv.noise}\n`);
    console.log(
      `Spell check enabled (only affects performance if noise ratio > 0): ${argv.spellCheck ||
        false} \n`
    );
    let entitySet = [false, false, false, false, false, false];

    switch (argv.complexity) {
      case 1:
        entitySet = [true, false, false, false, false, false];
        break;
      case 2:
        entitySet = [true, true, false, false, false, false];
        break;
      case 3:
        entitySet = [true, true, true, false, false, false];
        break;
      case 4:
        entitySet = [true, true, true, true, false, false];
        break;
      case 5:
        entitySet = [true, true, true, true, true, false];
        break;
      case 6:
        entitySet = [true, true, true, true, true, true];
        break;
      default:
        throw Error("Complexity should be between 1 and 6");
    }

    let hits = 0;
    let overallIntentOracle = false;
    let allEntitiesOracle = false;
    let specificEntityOracle = false;
    switch (argv.oracle) {
      case "overallIntent":
        console.log(
          `Testing for overall intent recognition with approval threshold ${argv.threshold}%\n`
        );
        overallIntentOracle = true;
        break;
      case "allEntities":
        console.log(
          `Testing for all entity recognition with approval threshold ${argv.threshold}%\n`
        );
        allEntitiesOracle = true;
        break;
      case "specificEntity":
        console.log(
          `Testing for specific entity recognition (entity ID: ${argv.specificEntityId}) with approval threshold ${argv.threshold}%\n`
        );
        specificEntityOracle = true;
        break;
      default:
        throw Error("Invalid test oracle detected.");
    }
    console.log("Input sentences generated by the CFG:\n");
    for (let index = 0; index < sampleSize; index++) {
      entitySet = _.shuffle(entitySet);
      if (specificEntityOracle) {
        do {
          entitySet = _.shuffle(entitySet);
        } while (entitySet[argv.specificEntityId! - 1] === false);
      }
      const travelGrammar = new TravelGrammar(
        entitySet[0],
        entitySet[1],
        entitySet[2],
        entitySet[3],
        entitySet[4],
        entitySet[5]
      );

      const sentence = travelGrammar.getSentenceWithEntities(true);
      if (argv.noise > 0) {
        sentence.text = StringManipulator.addProximitySpellingErrorToEachWord(
          sentence.text,
          argv.noise
        );
      }
      let result: LuisQueryResponse;
      if (argv.spellCheck) {
        result = await luisConnector.getQueryResponseWithSpellCheck(
          sentence.text
        );
      } else {
        result = await luisConnector.getQueryResponse(sentence.text);
      }
      if (overallIntentOracle) {
        if (result.topScoringIntent.intent === "inform") {
          console.log(`✔️ Correct intent: inform for input: ${sentence.text}`);
          hits += 1;
        } else {
          console.log(
            `❌ Wrong intent: ${result.topScoringIntent.intent} for input: ${sentence.text}`
          );
        }
      } else if (allEntitiesOracle) {
        let allEntitiesRecognized = true;
        const unrecognizedEntites = [];
        for (const expectedEntity of sentence.entities) {
          let entityRecognized = false;
          entityRecognized = result.entities.some(
            resultEntity =>
              expectedEntity.entity === resultEntity.entity &&
              resultEntity.type.startsWith(expectedEntity.type)
          );
          if (!entityRecognized) {
            unrecognizedEntites.push(expectedEntity.entity);
            allEntitiesRecognized = false;
          }
        }
        if (allEntitiesRecognized) {
          hits += 1;
          console.log(`✔️ All entites recognized for input: ${sentence.text}`);
        } else {
          console.log(
            `❌ Missing entities: ${unrecognizedEntites} for input: ${sentence.text}`
          );
        }
      } else if (specificEntityOracle) {
        const expectedEntityRole = Object.values(specificEntityId)[
          argv.specificEntityId! - 1
        ];
        const expectedEntity = sentence.entities.filter(
          entity => entity.role === expectedEntityRole
        );
        let entityRecognized = false;
        for (const entity of expectedEntity) {
          entityRecognized = result.entities.some(
            resultEntity =>
              entity.entity === resultEntity.entity &&
              resultEntity.type.startsWith(entity.type)
          );
          if (!entityRecognized) {
            console.log(
              `❌ Missing entity role ${expectedEntityRole} (${entity.entity}) for input: ${sentence.text}`
            );
          } else {
            console.log(
              `✔️ Specific entity recognized for input: ${sentence.text}`
            );
            hits += 1;
          }
        }
      }
    }

    const performance = (hits / sampleSize) * 100;

    if (performance < argv.threshold) {
      core.setFailed(
        `❌ Performance not good enough. Expected: ${
          argv.threshold
        }% Result: ${performance}%, difference: ${performance -
          argv.threshold}%`
      );
      return;
    }
    console.log(
      `✔️ Performance sufficient. Expected: ${
        argv.threshold
      }% Result: ${performance}%, difference: ${performance - argv.threshold}%`
    );
  }
  if (argv._[0] === "experiment") {
    console.log(
      "Experiment recreation selected. WARNING: this takes a long time to complete and consumes LUIS a lot. Use with caution!"
    );
    await Experiment.executeParameterAgnosticComplexityExperimentAndSaveResults(
      luisConnector,
      300
    );
    for (let index = 0; index < 6; index++) {
      await Experiment.executeParameterAwareComplexityExperimentAndSaveResults(
        index,
        luisConnector,
        300
      );
    }
  }

  if (argv._[0] === "example") {
    console.log("Example utterances selected.");
    const travelGrammar = new TravelGrammar(true, true, true, true, true, true);
    for (let index = 0; index < 10; index++) {
      console.log(`Example ${index + 1}\n`);
      console.log("Generating utterance with all entities...\n");
      const sentence = travelGrammar.getSentenceWithEntities(true);
      console.log(sentence.text + "\n");
      console.log("Adding spelling errors to the same utterance...\n");
      console.log(
        StringManipulator.addProximitySpellingErrorToEachWord(
          sentence.text,
          0.5
        ) + "\n"
      );
      console.log("The expected entities for this example:\n");
      console.log(sentence.entities);
      console.log("\n");
    }
  }
}

main().catch(
  err => (console.log(err), core.setFailed(`Task failed due to error ${err}`))
);
