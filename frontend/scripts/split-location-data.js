import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = path.join(root, 'node_modules/country-state-city/lib/assets');
const generatedDir = path.join(root, 'src/generated');
const cityOutDir = path.join(generatedDir, 'cities');
const stateOutDir = path.join(generatedDir, 'states');
const countryOutPath = path.join(generatedDir, 'countries.json');

// [Reason] Countries above this size are split by state so one dropdown does not download 1MB+
const CITY_STATE_SPLIT_BYTES = 350 * 1024;

function isCountryCode(value) {
  return typeof value === 'string' && /^[A-Z]{2}$/.test(value);
}

function isStateCode(value) {
  return typeof value === 'string' && /^[A-Za-z0-9-]+$/.test(value);
}

function clearJsonFiles(dir) {
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir)) {
    if (file.endsWith('.json')) fs.unlinkSync(path.join(dir, file));
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data));
}

function requireAsset(name) {
  const filePath = path.join(assetsDir, name);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing ${name} at ${filePath}. Run npm install in frontend/.`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// [Reason] Keep the full country list as one small async chunk, not bundled with states
function splitCountryData() {
  const countries = requireAsset('country.json');
  fs.mkdirSync(generatedDir, { recursive: true });
  writeJson(countryOutPath, countries);
  return countries.length;
}

// [Reason] State JSON is 555KB together; load only the selected country's states
function splitStateData() {
  const states = requireAsset('state.json');
  fs.mkdirSync(stateOutDir, { recursive: true });
  clearJsonFiles(stateOutDir);

  const byCountry = new Map();
  for (const state of states) {
    const countryCode = state?.countryCode;
    if (!isCountryCode(countryCode)) continue;
    const list = byCountry.get(countryCode);
    if (list) list.push(state);
    else byCountry.set(countryCode, [state]);
  }

  for (const [countryCode, rows] of byCountry) {
    writeJson(path.join(stateOutDir, `${countryCode}.json`), rows);
  }

  return { countries: byCountry.size, states: states.length };
}

// [Reason] Split the 7.7MB world city list into country (and large-country state) files
function splitCityData() {
  const cities = requireAsset('city.json');
  fs.mkdirSync(cityOutDir, { recursive: true });
  clearJsonFiles(cityOutDir);

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
    if (encoded.length <= CITY_STATE_SPLIT_BYTES) {
      writeJson(path.join(cityOutDir, `${countryCode}.json`), rows);
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
      writeJson(path.join(cityOutDir, `${countryCode}.${stateCode}.json`), stateRows);
      stateFiles += 1;
    }
  }

  return { countries: byCountry.size, countryFiles, stateFiles };
}

export function splitLocationData() {
  const countries = splitCountryData();
  const states = splitStateData();
  const cities = splitCityData();
  return { countries, states, cities };
}

if (process.argv[1]?.endsWith('split-location-data.js')) {
  const result = splitLocationData();
  console.log(
    `Split location data: ${result.countries} countries, ${result.states.countries} state files, ${result.cities.countryFiles} city-country files, ${result.cities.stateFiles} city-state files`,
  );
}
