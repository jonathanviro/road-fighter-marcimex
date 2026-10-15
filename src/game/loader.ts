import type { GameImages } from "./types";
export async function loadGameImages(): Promise<GameImages> {
  const sources: Record<keyof GameImages, string> = {
    roadLevel1: "level1/road_bg.png",
    playerStraight: "general/player_straight.png", playerLeft: "general/player_left.png", playerRight: "general/player_right.png",
    enemyCarA: "general/enemy_car_a.png", enemyCarB: "general/enemy_car_b.png",
    enemyCarC: "general/enemy_car_c.png", enemyCarD: "general/enemy_car_d.png",
    enemyCarE: "general/enemy_car_e.png", enemyCarF: "general/enemy_car_f.png",
    fuelItem: "general/fuel_item.png", oilSlick: "general/obstacle_oilslick.png", finish: "general/finish.png",
  };
  const images = await Promise.all(Object.entries(sources).map(async ([key, path]) => {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve(); img.onerror = () => reject(new Error(`No se pudo cargar ${path}`));
      img.src = `assets/${path}`;
    });
    return [key, img];
  }));
  return Object.fromEntries(images) as unknown as GameImages;
}
