import { useEffect, useState } from "react";
import { subscribeStore } from "./store";

/** Перерисовка при изменении данных CMS (после hydrate / сохранения в админке). */
export function useStoreVersion(): number {
  const [v, setV] = useState(0);
  useEffect(() => subscribeStore(() => setV((x) => x + 1)), []);
  return v;
}
