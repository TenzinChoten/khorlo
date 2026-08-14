// [Reason] Deep imports avoid the package barrel, which always pulls the 7.7MB city dataset
import Country from 'country-state-city/lib/country';
import State from 'country-state-city/lib/state';

export { Country, State };

// [Reason] Vite emits one async chunk per country or large-country state, never the full world list
const cityLoaders = import.meta.glob('../generated/cities/*.json');

const CITY_KEYS = ['name', 'countryCode', 'stateCode', 'latitude', 'longitude'];
const cityListCache = new Map();

function toCityObjects(rows) {
  return rows.map((row) => Object.fromEntries(CITY_KEYS.map((key, index) => [key, row[index]])));
}

function compareByName(a, b) {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
}

async function loadCityRows(loaderKey) {
  if (cityListCache.has(loaderKey)) {
    return cityListCache.get(loaderKey);
  }

  const loader = cityLoaders[loaderKey];
  if (!loader) {
    cityListCache.set(loaderKey, null);
    return null;
  }

  const mod = await loader();
  const cities = toCityObjects(mod.default);
  cityListCache.set(loaderKey, cities);
  return cities;
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
