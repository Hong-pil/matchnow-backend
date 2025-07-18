import { generateResponse } from '@/common/utils/response.util';

import { SportsCategory } from '../schemas/sports-category.schema';

export class SportsCategoriesResponse extends generateResponse([SportsCategory]) {}
export class SportsCategoryResponse extends generateResponse(SportsCategory) {}
