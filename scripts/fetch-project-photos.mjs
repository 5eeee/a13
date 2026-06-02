/**
 * Скачивает по одному кадру с Wikimedia Commons на проект (лицензии CC / свободные),
 * конвертирует в WebP и кладёт в public/projects/web/.
 *
 * Запуск из корня: node scripts/fetch-project-photos.mjs
 *
 * Соблюдайте политику User-Agent:
 * https://meta.wikimedia.org/wiki/User-Agent_policy
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const UA = "buro-a13-portfolio-script/1.0 (https://a13bureau.ru; info@a13bureau.ru)";

/** Три кадра Commons на каждый проект (порядок = id 1…18). Имена файлов как на Commons. */
const COMMONS_TRIPLETS = [
  [
    "International Gymnasium Skolkovo main.jpg",
    "Campus-SKOLKOVO.jpg",
    "Skolkovo hub.jpg",
  ],
  [
    "Building of Lukoil headquarters in Moscow 1.jpg",
    "Moscow-Lukoil-1607.jpg",
    "Moscow, Turgenevskaya Square, building of Lukoil headquarters (42222879835).jpg",
  ],
  [
    "2021-12 Michurinsky Prospekt 01.jpg",
    "Main Building of Moscow State University in winter, Moscow, Russia.jpg",
    "Michurinsky Prospect (BCL) - station hall and escalators.jpg",
  ],
  [
    "KGB-FSB headquarters, Lubyanka Square, Moscow, Russia.jpg",
    "Lubyanka Building.jpg",
    "Moscow, Lubyanka Square, renovation of the FSB building in 2013.jpg",
  ],
  [
    "Moscow, Rochdelskaya Street, Lukoil gas station (22146580786).jpg",
    "Lukoil-azs.jpg",
    "Moscow, Bibirevskaya street - BP petrol station (31532149746).jpg",
  ],
  [
    "Oktyabrskiy rayon, Samara, Samarskaya oblast', Russia - panoramio (43).jpg",
    "Oktyabrskiy rayon, Samara, Samarskaya oblast', Russia - panoramio (50).jpg",
    "Фабрика-кухня завода им. Масленникова, Самара , Ново-Садовая улица, 149.jpg",
  ],
  [
    "Depot Moskva Belorusskaya Station Moscow 2023-06-11 4548.jpg",
    "Depot Moskva Belorusskaya Station Moscow 2023-06-11 4552.jpg",
    "2021-12-31 - Belorusskaya D1 under reconstruction - Photo 3.jpg",
  ],
  [
    "2014 Moskva Ritz-Carlton building.JPG",
    "Hotel National and Ritz-Carlton in Moscow.jpg",
    "Исторический Музей. Вид с крыши отеля Ritz Carlton.jpg",
  ],
  [
    "Moscow Stoleshnikov Lane 11 2025-09 199.jpg",
    "Moscow Stoleshnikov Lane 11 2025-09 198.jpg",
    "Moscow Church in Stoleshnikov Lane 03-2016.jpg",
  ],
  [
    "White Square Office Center Moscow1.jpg",
    "White Square Office Center Moscow.jpg",
    "Evolution Tower, Moscow City.jpg",
  ],
  [
    "Moscow, Bolshaya Pionerskaya Street 20, Mar 2025 01.jpg",
    "Moscow, Bolshaya Pionerskaya Street 20, Mar 2025 02.jpg",
    "Moscow, Bolshaya Pionerskaya 1 July 2022 01.jpg",
  ],
  [
    "Mytishchi, Troitskaya Street 9 (31603387582).jpg",
    "Mytishchi, Blagoveshchenskaya 22 and Troitskaya 11 (31377612400).jpg",
    "Mytishchi. Blagoveshchenskaya Street 9 (31603388452).jpg",
  ],
  [
    "0080 Domodedovo International Airport 16th of August 2016.jpg",
    "0083 Domodedovo International Airport 16th of August 2016.jpg",
    "0085 Domodedovo International Airport 16th of August 2016.jpg",
  ],
  [
    "Mytishchi, Borisovka Street (30908562924).jpg",
    "Mytishchi, Borisovka Street (30908562064).jpg",
    "Mytishchi, Troitskaya Street - Yubileynaya Street block (30908563894).jpg",
  ],
  [
    "Likhobory metro depot pre-2023.jpg",
    "Likhobory (Moscow Metro depot) 20220913 114721.jpg",
    "Fili depot 1.jpg",
  ],
  [
    "Moscow, Tsvetnoy Boulevard 32c1.jpg",
    "Moscow Circus on Tsvetnoy Boulevard Dec 2014.JPG",
    "Moscow Nikulin Circus on Tsvetnoy Boulevard 2025-09 188.jpg",
  ],
  [
    "Фабрика-кухня.jpg",
    "Фабрика-кухня завода им. Масленникова, Самара , Ново-Садовая улица, 149.jpg",
    "Custom cover of communication well near factory-kitchen building in Samara, Russia.jpg",
  ],
  [
    "Zilart.jpg",
    "Moscow, Avtozavodskaya 25c5, Zilart Mar 2026 01.jpg",
    "Moscow, Avtozavodskaya 25c5, Zilart Mar 2026 02.jpg",
  ],
];

function commonsFilePathUrl(filename) {
  const underscored = filename.replace(/ /g, "_");
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(underscored).replace(/'/g, "%27")}`;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function downloadToWebp(outPath, commonsName, maxW = 1400) {
  const url = commonsFilePathUrl(commonsName);
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${commonsName.slice(0, 60)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await sharp(buf)
    .rotate()
    .resize({ width: maxW, height: maxW, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toFile(outPath);
}

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "projects", "web");

async function main() {
  const letters = ["a", "b", "c"];
  const manifest = [];
  const skipExisting = process.argv.includes("--resume");
  for (let i = 0; i < COMMONS_TRIPLETS.length; i++) {
    const pid = i + 1;
    const triplet = COMMONS_TRIPLETS[i];
    for (let j = 0; j < 3; j++) {
      const name = `${String(pid).padStart(2, "0")}-${letters[j]}.webp`;
      const outPath = path.join(OUT_DIR, name);
      const commonsTitle = triplet[j];
      if (skipExisting) {
        try {
          await fs.access(outPath);
          console.log("skip", name);
          manifest.push({ projectId: pid, slot: letters[j], commons: commonsTitle, file: `web/${name}` });
          continue;
        } catch {
          /* fetch */
        }
      }
      try {
        console.log("→", name, "<-", commonsTitle.slice(0, 55) + (commonsTitle.length > 55 ? "…" : ""));
        await downloadToWebp(outPath, commonsTitle);
        manifest.push({ projectId: pid, slot: letters[j], commons: commonsTitle, file: `web/${name}` });
      } catch (e) {
        console.error("FAIL:", commonsTitle, e.message);
        process.exitCode = 1;
        return;
      }
      await sleep(1300);
    }
  }
  await fs.writeFile(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log("Done:", manifest.length, "files →", OUT_DIR);
}

main();
