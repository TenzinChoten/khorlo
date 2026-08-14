// [Reason] Deep imports avoid the package barrel, which always pulls the 7.7MB city dataset
import Country from 'country-state-city/lib/country';
import State from 'country-state-city/lib/state';

export { Country, State };

// [Reason] City JSON is only needed after a state is chosen, so load it on demand
export async function getCitiesOfState(countryCode, stateCode) {
  if (!countryCode || !stateCode) return [];
  const { default: City } = await import('country-state-city/lib/city');
  return City.getCitiesOfState(countryCode, stateCode);
}
