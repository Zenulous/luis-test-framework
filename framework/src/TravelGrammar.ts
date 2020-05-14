import {SentenceWithEntities, Entity} from "./models/SentenceWithEntities";
import _ from "underscore";
const rita = require("rita");
const largeCities = require("all-the-cities").filter(
  (city: {population: number}) => city.population > 100000
);

export class TravelGrammar {
  originCityClause: boolean;
  destinationCityClause: boolean;
  budgetClause: boolean;
  startDateClause: boolean;
  numberOfChildrenClause: boolean;
  numberOfAdultsClause: boolean;

  constructor(
    originCityClause: boolean,
    destinationCityClause: boolean,
    budgetClause: boolean,
    startDateClause: boolean,
    numberOfChildrenClause: boolean,
    numberOfAdultsClause: boolean
  ) {
    this.originCityClause = originCityClause;
    this.destinationCityClause = destinationCityClause;
    this.budgetClause = budgetClause;
    this.startDateClause = startDateClause;
    this.numberOfChildrenClause = numberOfChildrenClause;
    this.numberOfAdultsClause = numberOfAdultsClause;
  }
  getSentenceWithEntities(shuffleOrder: boolean): SentenceWithEntities {
    let originCity: string;
    let destinationCity: string;
    const cfg = new rita.RiGrammar();
    let clauseCollection: string[] = [];
    const entityCollection: Entity[] = [];
    do {
      originCity = this.getRandomCity();
      destinationCity = this.getRandomCity();
    } while (originCity === destinationCity);
    cfg.addRule("<pronoun>", "I | we");
    if (this.originCityClause) {
      clauseCollection.push("<originCityClause>");
      cfg.addRule("<originCityClause>", "<originCityStart> <originCity> ", 1);
      cfg.addRule(
        "<originCityStart>",
        "<pronoun> want to fly from | can <pronoun> fly from | is there a flight that leaves | can <pronoun> depart from | can <pronoun> go from | is there any way to travel from"
      );
      cfg.addRule("<originCity>", originCity, 1);
      entityCollection.push({
        entity: originCity.toLowerCase(),
        type: "builtin.geographyV2.city",
        role: "origincity",
      });
    }
    if (this.destinationCityClause) {
      clauseCollection.push("<destinationCityClause>");
      cfg.addRule(
        "<destinationCityClause>",
        "<destinationCityStart> <destinationCity> ",
        1
      );
      cfg.addRule(
        "<destinationCityStart>",
        "to | and to add <pronoun> want to go to | my destination is | can <pronoun> depart from | <pronoun> want to fly up to | to go to"
      );
      cfg.addRule("<destinationCity>", destinationCity, 1);
      entityCollection.push({
        entity: destinationCity.toLowerCase(),
        type: "builtin.geographyV2.city",
        role: "destinationcity",
      });
    }
    if (this.budgetClause) {
      clauseCollection.push("<budgetClause>");
      cfg.addRule("<budgetClause>", "<budgetStart> <budget>, ");
      cfg.addRule(
        "<budgetStart>",
        "my budget is | our budget | <pronoun> only have | <pronoun> got lots of money, to be precise | <pronoun> wanna go all out, <pronoun> got | the budget is running low.. only got | how about | does this budget suffice: | <pronoun> saved up | <pronoun> broke my piggy bank and got "
      );
      const monetaryAmount = this.getRandomMonetaryAmount();
      cfg.addRule("<budget>", monetaryAmount);
      entityCollection.push({
        entity: monetaryAmount.toLowerCase(),
        type: "builtin.currency",
        role: "budget",
      });
    }
    if (this.startDateClause) {
      clauseCollection.push("<startDateClause>");
      cfg.addRule("<startDateClause>", "<startDateStart> <startDate>, ");
      cfg.addRule(
        "<startDateStart>",
        "<pronoun> want to go | let me leave | gotta leave | want to go | willing to depart | departure | fly starting | fly sometime | <pronoun> absolutely must leave | <pronoun> want to leave | <pronoun> wanna go | let us go | make sure the departure date is | ensure departure is sometime"
      );
      const dateReferences = [
        "tomorrow",
        "yesterday",
        "next month",
        "in a year",
        "January",
        "in the vincinity of February",
        "March, I guess",
        "in April",
        "around May",
        "June if possible",
        "July for sure",
        "middle of August",
        "for September",
        "due December",
        "next Friday",
        "in a couple of months",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      const date = _.sample<string>(dateReferences);
      cfg.addRule("<startDate>", date);
      entityCollection.push({
        entity: date.toLowerCase(),
        type: "builtin.date",
        role: "start",
      });
    }
    let numberOfChildren: string;
    let numberOfAdults: string;
    const possibleNumbers = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
    ];
    do {
      numberOfChildren = _.sample(possibleNumbers);
      numberOfAdults = _.sample(possibleNumbers);
    } while (numberOfChildren === numberOfAdults);
    if (this.numberOfChildrenClause || this.numberOfAdultsClause) {
      cfg.addRule(
        "<numberOfPersonStart>",
        "in addition <pronoun> have | I'm stuck with | We are stuck with | maybe it's good to mention <pronoun> have | the trip needs to be accommodated  for | important: <pronoun> have"
      );
    }
    if (this.numberOfChildrenClause) {
      clauseCollection.push("<numberOfChildrenClause>");
      cfg.addRule(
        "<numberOfChildrenClause>",
        "<numberOfPersonStart>  <numberOfChildren> <childReference>, "
      );
      cfg.addRule("<numberOfChildren>", numberOfChildren);
      if (numberOfChildren === "1" || numberOfChildren === "one") {
        cfg.addRule(
          "<childReference>",
          "kid | youngster | child | son | daughter | newborn"
        );
      } else {
        cfg.addRule(
          "<childReference>",
          "kids | youngsters | children | sons | daughters | newborns"
        );
      }
      entityCollection.push({
        entity: numberOfChildren.toLowerCase(),
        type: "builtin.number",
        role: "children",
      });
    }
    if (this.numberOfAdultsClause) {
      clauseCollection.push("<numberOfAdultsClause>");
      cfg.addRule(
        "<numberOfAdultsClause>",
        "<numberOfPersonStart> <numberOfAdults> <adultReference>, "
      );
      cfg.addRule("<numberOfAdults>", numberOfAdults);
      if (numberOfAdults === "1" || numberOfAdults === "one") {
        cfg.addRule(
          "<adultReference>",
          "adult | person | grownup | mature person | aged person"
        );
      } else {
        cfg.addRule(
          "<adultReference>",
          "adults | women | men | mature persons | aged people"
        );
      }
      entityCollection.push({
        entity: numberOfAdults.toLowerCase(),
        type: "builtin.number",
        role: "adults",
      });
    }
    if (shuffleOrder) {
      clauseCollection = _.shuffle(clauseCollection);
    }
    cfg.addRule("<start>", clauseCollection.join(""), 1);
    let text = cfg.expand() as string;
    text = text.slice(0, -1);
    if (text.charAt(text.length - 1) === ",") {
      text = text.slice(0, -1) + ".";
    }
    const output: SentenceWithEntities = {text, entities: entityCollection};
    return output;
  }

  private getRandomCity(): string {
    return largeCities[Math.floor(Math.random() * largeCities.length)].name;
  }

  private getRandomMonetaryAmount(): string {
    let amount = Math.floor(Math.random() * Math.floor(5000));
    const currencySymbols = [
      "$",
      "¥",
      "£",
      "€",
      "euro",
      "dollars",
      "pounds",
      "yen",
      "USD",
      "JPY",
      "EUR",
      "GBP",
    ];
    const currencySymbol = _.sample(currencySymbols);
    if (currencySymbol === ("¥" || "yen" || "JPY")) {
      amount = amount * 100;
    }
    const symbolPosition = Math.round(Math.random());
    if (symbolPosition === 0) {
      return `${currencySymbol} ${amount}`;
    }
    return `${amount} ${currencySymbol}`;
  }
}
