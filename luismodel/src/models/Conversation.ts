export interface Conversation {
  user_id: string;
  turns: Turn[];
  wizard_id: string;
  id: string;
  labels: Labels2;
}

interface Arg {
  val: string;
  key: string;
}

interface Act {
  args: Arg[];
  name: string;
}

export interface Arg2 {
  val: string;
  key: string;
}

export interface ActsWithoutRef {
  args: Arg2[];
  name: string;
}

export interface Intent {
  val: string;
  negated: boolean;
}

export interface Budget {
  val: string;
  negated: boolean;
}

export interface DstCity {
  val: string;
  negated: boolean;
}

export interface OrCity {
  val: string;
  negated: boolean;
}

export interface StrDate {
  val: string;
  negated: boolean;
}

export interface NAdult {
  val: string;
  negated: boolean;
}

export interface NORESULT {
  val: boolean;
  negated: boolean;
}

export interface Flex {
  val: boolean;
  negated: boolean;
}

export interface Info {
  intent: Intent[];
  budget: Budget[];
  dst_city: DstCity[];
  or_city: OrCity[];
  str_date: StrDate[];
  n_adults: NAdult[];
  NO_RESULT: NORESULT[];
  flex: Flex[];
}

export interface Frame {
  info: Info;
  frame_id: number;
}

export interface Labels {
  acts: Act[];
  acts_without_refs: ActsWithoutRef[];
  active_frame: number;
  frames: Frame[];
}

export interface Search {
  ORIGIN_CITY: string;
  PRICE_MIN: string;
  NUM_ADULTS: string;
  timestamp: number;
  PRICE_MAX: string;
  ARE_DATES_FLEXIBLE: string;
  NUM_CHILDREN: string;
  START_TIME: string;
  MAX_DURATION: number;
  DESTINATION_CITY: string;
  RESULT_LIMIT: string;
  END_TIME: string;
}

export interface Db {
  result: any[][];
  search: Search[];
}

export interface Turn {
  text: string;
  labels: Labels;
  author: string;
  timestamp: number;
  db: Db;
}

export interface Labels2 {
  userSurveyRating: number;
  wizardSurveyTaskSuccessful: boolean;
}

export interface Conversation {
  user_id: string;
  turns: Turn[];
  wizard_id: string;
  id: string;
  labels: Labels2;
}
