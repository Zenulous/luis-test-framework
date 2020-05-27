import {Turn} from "../models/Conversation";
import axios, {AxiosError} from "axios";
import {Entity} from "../models/Entity";

export class LuisAuthoringConnector {
  endpoint: string;
  authoringKey: string;
  constructor(endpoint: string, authoringKey: string) {
    this.endpoint = endpoint;
    this.authoringKey = authoringKey;
  }

  async handleAxiosError(err: AxiosError) {
    if (err.response && err.response.status === 401) {
      throw Error(
        "Request unauthenticated, LUIS connection strings may be invalid"
      );
    }
    if (err.response && err.response.status === 429) {
      console.log(`Waiting to avoid LUIS rate limiting`);
      await new Promise(resolve => setTimeout(resolve, 10000));
      return;
    }
    throw Error(`Unknown LUIS API error: ${err}`);
  }

  async postTurnsAsUtteranceExample(versionId: string, turns: Turn[]) {
    const options = {
      headers: {
        "Ocp-Apim-Subscription-Key": this.authoringKey,
      },
    };
    const url =
      this.endpoint + `/versions/${encodeURIComponent(versionId)}/examples`;
    let batchBody = [];
    for (const turn of turns) {
      const body = this.convertTurnIntoRequestBody(turn);
      batchBody.push(body);
      if (batchBody.length === 10) {
        while (true) {
          try {
            await axios.post(url, batchBody, options);
            break;
          } catch (err) {
            await this.handleAxiosError(err);
          }
        }
        batchBody = [];
      }
    }
    if (batchBody.length > 0) {
      while (true) {
        try {
          await axios.post(url, batchBody, options);
          break;
        } catch (err) {
          await this.handleAxiosError(err);
        }
      }
    }
  }

  async enableBingSpellCheckPublishSetting() {
    const options = {
      headers: {
        "Ocp-Apim-Subscription-Key": this.authoringKey,
      },
    };
    const body = {sentimentAnalysis: false, speech: false, spellChecker: true};
    const url = this.endpoint + `/publishsettings`;
    while (true) {
      try {
        await axios.put(url, body, options);
        break;
      } catch (err) {
        await this.handleAxiosError(err);
      }
    }
  }

  async publishVersionToStaging(versionId: string) {
    const options = {
      headers: {
        "Ocp-Apim-Subscription-Key": this.authoringKey,
      },
    };
    const body = {versionId, isStaging: true};
    const url = this.endpoint + `/publish`;
    while (true) {
      try {
        await axios.post(url, body, options);
        break;
      } catch (err) {
        await this.handleAxiosError(err);
      }
    }
  }

  async trainApplication(versionId: string) {
    const options = {
      headers: {
        "Ocp-Apim-Subscription-Key": this.authoringKey,
      },
    };
    const url =
      this.endpoint + `/versions/${encodeURIComponent(versionId)}/train`;
    while (true) {
      try {
        await axios.post(url, {}, options);
        break;
      } catch (err) {
        await this.handleAxiosError(err);
      }
    }
  }

  private async getLatestStagingVersionId(): Promise<string | undefined> {
    const options = {
      headers: {
        "Ocp-Apim-Subscription-Key": this.authoringKey,
      },
    };
    const url = this.endpoint;
    while (true) {
      try {
        return (await axios.get(url, options)).data.endpoints.STAGING.versionId;
      } catch (err) {
        await this.handleAxiosError(err);
      }
    }
  }

  async publishLatestStagingModelToProduction() {
    const options = {
      headers: {
        "Ocp-Apim-Subscription-Key": this.authoringKey,
      },
    };
    const versionId = await this.getLatestStagingVersionId();
    const body = {
      versionId,
      isStaging: false,
    };
    const url = this.endpoint + `/publish`;
    while (true) {
      try {
        await axios.post(url, body, options);
        break;
      } catch (err) {
        await this.handleAxiosError(err);
      }
    }
  }

  private convertTurnIntoRequestBody(turn: Turn) {
    const entityLabels: Entity[] = [];
    if (turn.labels.acts_without_refs.length === 0) {
      return {text: turn.text, intentName: "None", entityLabels};
    }

    const intentName = turn.labels.acts_without_refs[0].name;
    const body = {
      text: turn.text,
      intentName,
      entityLabels,
    };
    if (!turn.labels.acts_without_refs[0].args) {
      return body;
    }
    for (const arg of turn.labels.acts_without_refs[0].args) {
      if (arg.val == null) {
        return body;
      }
      let currentEntity: Entity;
      switch (arg.key) {
        case "str_date":
          currentEntity = {
            entityName: "datetimeV2",
            role: "start",
            startCharIndex: turn.text.indexOf(arg.val),
            endCharIndex: turn.text.indexOf(arg.val) + arg.val.length,
          };
          body.entityLabels.push(currentEntity);
          break;
        case "budget":
          currentEntity = {
            entityName: "money",
            role: "budget",
            startCharIndex: turn.text.indexOf(arg.val),
            endCharIndex: turn.text.indexOf(arg.val) + arg.val.length,
          };
          body.entityLabels.push(currentEntity);
          break;
        case "n_adults":
          currentEntity = {
            entityName: "number",
            role: "adults",
            startCharIndex: turn.text.indexOf(arg.val),
            endCharIndex: turn.text.indexOf(arg.val) + arg.val.length,
          };
          body.entityLabels.push(currentEntity);
          break;
        case "n_children":
          currentEntity = {
            entityName: "number",
            role: "children",
            startCharIndex: turn.text.indexOf(arg.val),
            endCharIndex: turn.text.indexOf(arg.val) + arg.val.length,
          };
          body.entityLabels.push(currentEntity);
          break;
        case "dst_city":
          currentEntity = {
            entityName: "geographyV2",
            role: "destinationcity",
            startCharIndex: turn.text.indexOf(arg.val),
            endCharIndex: turn.text.indexOf(arg.val) + arg.val.length,
          };
          body.entityLabels.push(currentEntity);
          break;
        case "or_city":
          currentEntity = {
            entityName: "geographyV2",
            role: "origincity",
            startCharIndex: turn.text.indexOf(arg.val),
            endCharIndex: turn.text.indexOf(arg.val) + arg.val.length,
          };
          body.entityLabels.push(currentEntity);
          break;
        default:
          console.log(`${arg.key} not implemented, skipping...`);
          break;
      }
    }
    return body;
  }
}
