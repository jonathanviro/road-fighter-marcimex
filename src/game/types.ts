export type EntityKind = "car_a" | "car_b" | "car_c" | "car_d" | "car_e" | "car_f" | "oil" | "fuel";
export interface Entity {
  kind: EntityKind; x: number; y: number; w: number; h: number;
  speed: number; speedFactor?: number;
}
export interface GameImages {
  roadLevel1: HTMLImageElement;
  playerStraight: HTMLImageElement; playerLeft: HTMLImageElement; playerRight: HTMLImageElement;
  enemyCarA: HTMLImageElement; enemyCarB: HTMLImageElement;
  enemyCarC: HTMLImageElement; enemyCarD: HTMLImageElement;
  enemyCarE: HTMLImageElement; enemyCarF: HTMLImageElement;
  fuelItem: HTMLImageElement; oilSlick: HTMLImageElement; finish: HTMLImageElement;
}
