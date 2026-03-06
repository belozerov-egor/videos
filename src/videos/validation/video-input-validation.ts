import {
  AvailableResolutions,
  VideoInputDto,
  VideoInputUpdateDto,
} from '../types/videos.types';
import { ValidationError } from '../../core/types/http-statuses';

export const videoInputValidation = (
  data: VideoInputDto | VideoInputUpdateDto,
) => {
  const errors: ValidationError[] = [];
  const { title, author, availableResolutions } = data;
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 40) {
    errors.push({
      field: 'title',
      message: 'Title is required and must be between 1 and 40 characters',
    });
  }
  if (
    !author.trim() ||
    typeof author !== 'string' ||
    author.trim().length > 20
  ) {
    errors.push({
      field: 'author',
      message: 'Author is required and must be between 1 and 20 characters',
    });
  }
  if (!Array.isArray(availableResolutions)) {
    errors.push({
      field: 'availableResolutions',
      message: 'Available resolutions must be an array',
    });
  } else if (!availableResolutions.length) {
    errors.push({
      field: 'availableResolutions',
      message: 'Available resolutions must be at least 1 resolution',
    });
  } else if (availableResolutions.length) {
    const existingResolutions = Object.values(AvailableResolutions);
    if (availableResolutions.length > existingResolutions.length) {
      errors.push({
        field: 'availableResolutions',
        message: 'Available resolutions must be between 1 and 8 resolutions',
      });
    }
    for (const availableResolution of availableResolutions) {
      if (!existingResolutions.includes(availableResolution)) {
        errors.push({
          field: 'availableResolutions',
          message: 'Available resolutions must be valid',
        });
        break;
      }
    }
  }
  if ('canBeDownloaded' in data) {
    const { canBeDownloaded } = data;

    if (typeof canBeDownloaded !== 'boolean') {
      errors.push({
        field: 'canBeDownloaded',
        message: 'canBeDownloaded must be a boolean',
      });
    }
  }
  if ('publicationDate' in data) {
    const { publicationDate } = data;
    if (typeof publicationDate !== 'string') {
      errors.push({
        field: 'publicationDate',
        message: 'publicationDate must be a string',
      });
    } else {
      const date = new Date(publicationDate);
      if (
        Number.isNaN(date.getTime()) ||
        date.toISOString() !== publicationDate
      ) {
        errors.push({
          field: 'publicationDate',
          message: 'publicationDate must be an ISO date-time string (UTC, Z)',
        });
      }
    }
  }
  if ('minAgeRestriction' in data) {
    const { minAgeRestriction } = data;

    if (minAgeRestriction !== null) {
      if (
        typeof minAgeRestriction !== 'number' ||
        !Number.isInteger(minAgeRestriction) ||
        minAgeRestriction < 1 ||
        minAgeRestriction > 18
      ) {
        errors.push({
          field: 'minAgeRestriction',
          message:
            'minAgeRestriction must be null or an integer between 1 and 18',
        });
      }
    }
  }

  return errors;
};
