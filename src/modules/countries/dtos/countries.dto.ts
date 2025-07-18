import { generateResponse } from '@/common/utils/response.util';

import { Country } from '../schemas/country.schema';

export class CountriesResponse extends generateResponse([Country]) {}
export class CountryResponse extends generateResponse(Country) {}
