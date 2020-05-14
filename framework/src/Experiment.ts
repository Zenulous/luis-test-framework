import {LuisConnector} from "./connectors/LuisConnector";
import {Csv, csvHeader} from "./models/Csv";
import {createObjectCsvWriter} from "csv-writer";
import {TravelGrammar} from "./TravelGrammar";
import {SentenceWithEntities} from "./models/SentenceWithEntities";
import {LuisQueryResponse} from "./models/LuisQueryResponse";
import {StringManipulator} from "./StringManipulator";
import * as path from "path";
import combinatorics from "js-combinatorics";
import jsonFile = require("jsonfile");

export class Experiment {
  static async executeParameterAgnosticComplexityExperimentAndSaveResults(
    luisConnector: LuisConnector,
    sampleSize: number
  ) {
    const records: Csv[] = [];
    const csvWriter = createObjectCsvWriter({
      path: path.join(
        __dirname,
        "../experiments_output/parameterAgnosticComplexityExperiment.csv"
      ),
      header: csvHeader,
    });
    const parameterIndexes = [0, 1, 2, 3, 4, 5];
    for (let conditionIndex = 0; conditionIndex < 6; conditionIndex++) {
      const travelGrammars: TravelGrammar[] = [];
      const parameterCombinations = combinatorics
        .combination(parameterIndexes, conditionIndex + 1)
        .toArray()
        .concat();

      for (const combination of parameterCombinations) {
        const parameters = [false, false, false, false, false, false];
        for (const parameterIndex of combination) {
          parameters[parameterIndex] = true;
        }
        travelGrammars.push(
          new TravelGrammar(
            parameters[0],
            parameters[1],
            parameters[2],
            parameters[3],
            parameters[4],
            parameters[5]
          )
        );
      }
      for (const result of await this.querySampleWithLuisAndSaveResults(
        luisConnector,
        travelGrammars,
        Math.floor(sampleSize / parameterCombinations.length),
        `parameterAgnosticComplexityExperiment-Condition${conditionIndex + 1}`
      )) {
        records.push(result);
      }
    }
    await csvWriter.writeRecords(records);
  }

  static async executeParameterAwareComplexityExperimentAndSaveResults(
    constantParameterIndex: number,
    luisConnector: LuisConnector,
    sampleSize: number
  ) {
    const records: Csv[] = [];
    const csvWriter = createObjectCsvWriter({
      path: path.join(
        __dirname,
        `../experiments_output/parameterAwareComplexityExperiment-Parameter${constantParameterIndex +
          1}.csv`
      ),
      header: csvHeader,
    });

    const parameterIndexes = [0, 1, 2, 3, 4, 5];
    parameterIndexes.splice(constantParameterIndex, 1);
    for (let conditionIndex = 0; conditionIndex < 6; conditionIndex++) {
      const travelGrammars: TravelGrammar[] = [];
      let parameterCombinations: number[][] = [];
      if (conditionIndex === 0) {
        parameterCombinations = [[constantParameterIndex]];
      } else {
        parameterCombinations = combinatorics
          .combination(parameterIndexes, conditionIndex)
          .toArray()
          .concat();
      }
      for (const combination of parameterCombinations) {
        const parameters = [false, false, false, false, false, false];
        for (const parameterIndex of combination) {
          parameters[parameterIndex] = true;
        }
        parameters[constantParameterIndex] = true;
        travelGrammars.push(
          new TravelGrammar(
            parameters[0],
            parameters[1],
            parameters[2],
            parameters[3],
            parameters[4],
            parameters[5]
          )
        );
      }
      for (const result of await this.querySampleWithLuisAndSaveResults(
        luisConnector,
        travelGrammars,
        Math.floor(sampleSize / parameterCombinations.length),
        `parameterAwareComplexityExperiment-Parameter${constantParameterIndex +
          1}-Condition${conditionIndex + 1}`
      )) {
        records.push(result);
      }
    }
    await csvWriter.writeRecords(records);
  }

  static async querySampleWithLuisAndSaveResults(
    luisConnector: LuisConnector,
    travelGrammars: TravelGrammar[],
    sampleSize: number,
    rootFileName: string
  ) {
    const inputSentences: SentenceWithEntities[] = [];
    const inputSentencesWithSpellingError: SentenceWithEntities[] = [];
    const luisResultsWithoutSpellingError: LuisQueryResponse[] = [];
    const luisResultsWithSpellingErrorWithoutSpellCheck: LuisQueryResponse[] = [];
    const luisResultsWithSpellingErrorWithSpellCheck: LuisQueryResponse[] = [];

    for (let i = 0; i < travelGrammars.length; i++) {
      for (let j = 0; j < sampleSize; j++) {
        let inputSentence: SentenceWithEntities;
        do {
          inputSentence = travelGrammars[i].getSentenceWithEntities(true);
        } while (
          inputSentences.some(sentence => sentence.text === inputSentence.text)
        );
        console.log(inputSentence);
        const inputSentenceWithSpellingError = JSON.parse(
          JSON.stringify(inputSentence)
        );
        inputSentenceWithSpellingError.text = StringManipulator.addProximitySpellingErrorToEachWord(
          inputSentenceWithSpellingError.text,
          0.5
        );
        inputSentences.push(inputSentence);
        inputSentencesWithSpellingError.push(inputSentenceWithSpellingError);

        const result = await luisConnector.getQueryResponse(inputSentence.text);
        luisResultsWithoutSpellingError.push(result);

        const resultSpellingErrorWithoutSpellCheck = await luisConnector.getQueryResponse(
          inputSentenceWithSpellingError.text
        );
        luisResultsWithSpellingErrorWithoutSpellCheck.push(
          resultSpellingErrorWithoutSpellCheck
        );

        const resultSpellingErrorWithSpellCheck = await luisConnector.getQueryResponseWithSpellCheck(
          inputSentenceWithSpellingError.text
        );
        luisResultsWithSpellingErrorWithSpellCheck.push(
          resultSpellingErrorWithSpellCheck
        );
      }
    }
    const record: Csv[] = [];
    for (const result of luisResultsWithoutSpellingError) {
      if (result.topScoringIntent.intent === "inform") {
        record.push({
          intent: true,
          intentScore: result.topScoringIntent.score,
          inputSentence: result.query,
          spellingErrors: false,
          luisSpellCheck: false,
        });
      } else {
        record.push({
          intent: false,
          intentScore: result.topScoringIntent.score,
          inputSentence: result.query,
          spellingErrors: false,
          luisSpellCheck: false,
        });
      }
    }
    for (const result of luisResultsWithSpellingErrorWithoutSpellCheck) {
      if (result.topScoringIntent.intent === "inform") {
        record.push({
          intent: true,
          intentScore: result.topScoringIntent.score,
          inputSentence: result.query,
          spellingErrors: true,
          luisSpellCheck: false,
        });
      } else {
        record.push({
          intent: false,
          intentScore: result.topScoringIntent.score,
          inputSentence: result.query,
          spellingErrors: true,
          luisSpellCheck: false,
        });
      }
    }
    for (const result of luisResultsWithSpellingErrorWithSpellCheck) {
      if (result.topScoringIntent.intent === "inform") {
        record.push({
          intent: true,
          intentScore: result.topScoringIntent.score,
          inputSentence: result.query,
          spellcheckedSentence: result.alteredQuery,
          spellingErrors: true,
          luisSpellCheck: true,
        });
      } else {
        record.push({
          intent: false,
          intentScore: result.topScoringIntent.score,
          inputSentence: result.query,
          spellcheckedSentence: result.alteredQuery,
          spellingErrors: true,
          luisSpellCheck: true,
        });
      }
    }
    const allSentences = [
      inputSentences,
      inputSentencesWithSpellingError,
      inputSentencesWithSpellingError,
    ];
    const allLuisResults = [
      luisResultsWithoutSpellingError,
      luisResultsWithSpellingErrorWithoutSpellCheck,
      luisResultsWithSpellingErrorWithSpellCheck,
    ];
    let recordIndex = 0;
    allSentences.forEach((sentences, i) => {
      sentences.forEach((sentence, j) => {
        let allEntitiesRecognized = true;
        for (const expectedEntity of sentence.entities) {
          let entityRecognized = false;
          entityRecognized = allLuisResults[i][j].entities.some(
            resultEntity =>
              expectedEntity.entity === resultEntity.entity &&
              resultEntity.type.startsWith(expectedEntity.type)
          );

          if (entityRecognized) {
            record[recordIndex][expectedEntity.role] = true;
          } else {
            allEntitiesRecognized = false;
            record[recordIndex][expectedEntity.role] = false;
          }
        }
        record[recordIndex].numEntities = sentence.entities.length;
        record[recordIndex].allEntities = allEntitiesRecognized;
        recordIndex += 1;
      });
    });

    await jsonFile.writeFile(
      path.join(
        __dirname,
        `../experiments_output/samples/${rootFileName}-Input.json`
      ),
      allSentences
    );
    await jsonFile.writeFile(
      path.join(
        __dirname,
        `../experiments_output/samples/${rootFileName}-Results.json`
      ),
      allLuisResults
    );
    return record;
  }
}
