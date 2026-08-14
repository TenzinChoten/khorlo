// [Reason] Dynamic import keeps the country list out of the app entry and location page chunks
const countryLoader = () => import('../generated/countries.json');
// [Reason] Vite emits one async chunk per country's states instead of the 555KB world state list
const stateLoaders = import.meta.glob('../generated/states/*.json');
// [Reason] Vite emits one async chunk per country or large-country state, never the full world city list
const cityLoaders = import.meta.glob('../generated/cities/*.json');

const CITY_KEYS = ['name', 'countryCode', 'stateCode', 'latitude', 'longitude'];
const cityListCache = new Map();
const stateListCache = new Map();
let countriesPromise = null;

function toCityObjects(rows) {
  return rows.map((row) => Object.fromEntries(CITY_KEYS.map((key, index) => [key, row[index]])));
}

function compareByName(a, b) {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
}

async function loadJson(loaders, loaderKey, cache) {
  if (cache.has(loaderKey)) {
    return cache.get(loaderKey);
  }

  const loader = loaders[loaderKey];
  if (!loader) {
    cache.set(loaderKey, null);
    return null;
  }

  const mod = await loader();
  cache.set(loaderKey, mod.default);
  return mod.default;
}

// [Reason] Country list is ~100KB and only needed when a location dropdown mounts
export async function getAllCountries() {
  if (!countriesPromise) {
    countriesPromise = countryLoader().then((mod) => mod.default);
  }
  return countriesPromise;
}

export async function findCountryByName(name) {
  if (!name) return undefined;
  const countries = await getAllCountries();
  return countries.find((country) => country.name === name);
}

// [Reason] Load only the selected country's states so the 555KB state.json never ships as one chunk
export async function getStatesOfCountry(countryCode) {
  if (!countryCode) return [];
  const rows = await loadJson(stateLoaders, `../generated/states/${countryCode}.json`, stateListCache);
  if (!rows) return [];
  return [...rows].sort(compareByName);
}

async function loadCityRows(loaderKey) {
  const rows = await loadJson(cityLoaders, loaderKey, cityListCache);
  if (!rows) return null;
  return toCityObjects(rows);
}

// [Reason] Prefer a state file for large countries; fall back to the country file for everyone else
export async function getCitiesOfState(countryCode, stateCode) {
  if (!countryCode || !stateCode) return [];

  const stateCities = await loadCityRows(`../generated/cities/${countryCode}.${stateCode}.json`);
  if (stateCities) {
    return stateCities
      .filter((city) => city.countryCode === countryCode && city.stateCode === stateCode)
      .sort(compareByName);
  }

  const countryCities = await loadCityRows(`../generated/cities/${countryCode}.json`);
  if (!countryCities) return [];

  return countryCities
    .filter((city) => city.countryCode === countryCode && city.stateCode === stateCode)
    .sort(compareByName);
}
