import axios, {AxiosError} from "axios";
import {LuisQueryResponse} from "../models/LuisQueryResponse";

export class LuisConnector {
  private defaultQueryUrl: string;
  private bingSpellCheckSubscriptionKey: string;
  constructor(defaultQueryUrl: string, bingSpellCheckSubscriptionKey: string) {
    this.defaultQueryUrl = defaultQueryUrl;
    this.bingSpellCheckSubscriptionKey = bingSpellCheckSubscriptionKey;
  }

  async handleAxiosError(err: AxiosError) {
    if (err.response && err.response.status === 401) {
      throw Error(
        "Request unauthenticated, LUIS connection strings may be invalid"
      );
    }
    console.log("Waiting to avoid LUIS rate limiting");
    await new Promise(resolve => setTimeout(resolve, 60000));
    return;
  }

  async getQueryResponse(messageContent: string): Promise<LuisQueryResponse> {
    const url = this.defaultQueryUrl + encodeURIComponent(messageContent);
    while (true) {
      try {
        return (await axios.get(url)).data as LuisQueryResponse;
      } catch (err) {
        await this.handleAxiosError(err);
      }
    }
  }

  async getQueryResponseWithSpellCheck(
    messageContent: string
  ): Promise<LuisQueryResponse> {
    const url =
      this.defaultQueryUrl +
      encodeURIComponent(messageContent) +
      `&bing-spell-check-subscription-key=${encodeURIComponent(
        this.bingSpellCheckSubscriptionKey
      )}&spellCheck=true`;
    while (true) {
      try {
        return (await axios.get(url)).data as LuisQueryResponse;
      } catch (err) {
        await this.handleAxiosError(err);
      }
    }
  }
}
