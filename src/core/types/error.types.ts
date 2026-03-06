import { ValidationError } from './http-statuses';

export type ApiErrorResponse = {
  errorsMessages: ValidationError[];
};
