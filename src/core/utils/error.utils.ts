import { ValidationError } from '../types/http-statuses';
import { ApiErrorResponse } from '../types/error.types';

export const createErrorMessages = (
  errors: ValidationError[],
): ApiErrorResponse => {
  return { errorsMessages: errors };
};
