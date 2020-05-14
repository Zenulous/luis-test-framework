export interface SentenceWithEntities {
  text: string;
  entities: Entity[];
}

export interface Entity {
  entity: string;
  type: string;
  role:
    | "origincity"
    | "destinationcity"
    | "budget"
    | "start"
    | "children"
    | "adults";
}
