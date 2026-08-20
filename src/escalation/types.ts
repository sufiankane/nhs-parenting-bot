export interface SignpostService {
  readonly name: string;
  readonly contact: string;
  readonly use: string;
}

export interface SignpostPayload {
  readonly tier: 1 | 2 | 3;
  readonly headline: string;
  readonly reason_plain_language: string;
  readonly services: readonly SignpostService[];
}

export interface SignpostEvent {
  readonly type: "signpost";
  readonly payload: SignpostPayload;
}

