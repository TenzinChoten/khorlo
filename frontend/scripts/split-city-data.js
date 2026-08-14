import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(
  root,
  'node_modules/country-state-city/lib/assets/city.json',
);
const outDir = path.join(root, 'src/generated/cities');

// [Reason] Countries above this size are split by state so one dropdown does not download 1MB+
const STATE_SPLIT_BYTES = 350 * 1024;

function isCountryCode(value) {
  return typeof value === 'string' && /^[A-Z]{2}$/.test(value);
}

function isStateCode(value) {
  return typeof value === 'string' && /^[A-Za-z0-9-]+$/.test(value);
}

function writeJson(name, rows) {
  fs.writeFileSync(path.join(outDir, name), JSON.stringify(rows));
}

// [Reason] Split the 7.7MB world city list into country (and large-country state) files for Vite
export function splitCityData() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing city dataset at ${sourcePath}. Run npm install in frontend/.`);
  }

  const cities = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  fs.mkdirSync(outDir, { recursive: true });

  for (const file of fs.readdirSync(outDir)) {
    if (file.endsWith('.json')) {
      fs.unlinkSync(path.join(outDir, file));
    }
  }

  const byCountry = new Map();
  for (const row of cities) {
    const countryCode = row?.[1];
    if (!isCountryCode(countryCode)) continue;
    const list = byCountry.get(countryCode);
    if (list) list.push(row);
    else byCountry.set(countryCode, [row]);
  }

  let countryFiles = 0;
  let stateFiles = 0;

  for (const [countryCode, rows] of byCountry) {
    const encoded = JSON.stringify(rows);
    if (encoded.length <= STATE_SPLIT_BYTES) {
      writeJson(`${countryCode}.json`, rows);
      countryFiles += 1;
      continue;
    }

    const byState = new Map();
    for (const row of rows) {
      const stateCode = row?.[2];
      if (!isStateCode(stateCode)) continue;
      const list = byState.get(stateCode);
      if (list) list.push(row);
      else byState.set(stateCode, [row]);
    }

    for (const [stateCode, stateRows] of byState) {
      writeJson(`${countryCode}.${stateCode}.json`, stateRows);
      stateFiles += 1;
    }
  }

  return { countries: byCountry.size, countryFiles, stateFiles };
}

if (process.argv[1]?.endsWith('split-city-data.js')) {
  const result = splitCityData();
  console.log(
    `Split city dataset: ${result.countryFiles} country files, ${result.stateFiles} state files (${result.countries} countries)`,
  );
}
