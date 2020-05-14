export interface LuisQueryResponse {
  query: string;
  alteredQuery?: string;
  topScoringIntent: TopScoringIntent;
  intents: Intent[];
  entities: Entity[];
}

interface TopScoringIntent {
  intent: string;
  score: number;
}

interface Intent {
  intent: string;
  score: number;
}

interface Entity {
  entity: string;
  type: string;
  role: string;
  startIndex: number;
  endIndex: number;
  resolution: {subtype: string; value: string};
}
