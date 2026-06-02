/** Точки на карте — адреса и координаты по Яндекс.Картам. */

export const OFFICE_ADDRESS = "г. Москва, Рублевское шоссе д.26 корп.4";
export const PRODUCTION_ADDRESS = "г. Фрязино, ул. Горького д.10 стр.1";

/** Как в Яндекс.Картах (для геокодера) */
export const OFFICE_YANDEX_QUERY = "Москва, Рублёвское шоссе, 26к4";
export const PRODUCTION_YANDEX_QUERY = "Фрязино, улица Горького, 10А строение 1";

/** lon, lat */
export const OFFICE_POINT = {
  lon: 37.427776,
  lat: 55.746569,
  label: "Офис" as const,
  yandexMapsUrl: "https://yandex.ru/maps/?text=Москва%2C+Рублёвское+шоссе+26к4",
};

export const PRODUCTION_POINT = {
  lon: 38.034229,
  lat: 55.959087,
  label: "Производство" as const,
  yandexMapsUrl:
    "https://yandex.ru/maps/?text=Фрязино%2C+улица+Горького+10А+строение+1",
};

export function yandexMapWidgetUrl(): string {
  const { lon: oLon, lat: oLat } = OFFICE_POINT;
  const { lon: pLon, lat: pLat } = PRODUCTION_POINT;
  const llLon = (oLon + pLon) / 2;
  const llLat = (oLat + pLat) / 2;
  const pt = `${oLon},${oLat},pm2blm~${pLon},${pLat},pm2gnm`;
  return `https://yandex.ru/map-widget/v1/?ll=${llLon}%2C${llLat}&z=10&pt=${pt}`;
}
