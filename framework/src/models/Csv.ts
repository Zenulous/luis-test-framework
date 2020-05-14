export interface Csv {
  intent: boolean;
  intentScore: number;
  inputSentence: string;
  spellcheckedSentence?: string;
  spellingErrors: boolean;
  luisSpellCheck: boolean;
  numEntities?: number;
  allEntities?: boolean;
  origincity?: boolean;
  destinationcity?: boolean;
  budget?: boolean;
  start?: boolean;
  children?: boolean;
  adults?: boolean;
}

export const csvHeader = [
  {id: "intent", title: "intentRecognized"},
  {id: "intentScore", title: "intentScore"},
  {id: "inputSentence", title: "inputSentence"},
  {id: "spellcheckedSentence", title: "spellcheckedSentence"},
  {id: "spellingErrors", title: "spellingErrors"},
  {id: "luisSpellCheck", title: "luisSpellCheck"},
  {id: "allEntities", title: "allEntitiesRecognized"},
  {id: "numEntities", title: "numberEntities"},
  {id: "origincity", title: "originCity"},
  {id: "destinationcity", title: "destinationCity"},
  {id: "budget", title: "budget"},
  {id: "start", title: "startDate"},
  {id: "children", title: "numberChildren"},
  {id: "adults", title: "numberAdults"},
];
