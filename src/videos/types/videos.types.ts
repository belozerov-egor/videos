export enum AvailableResolutions {
  P144 = 'P144',
  P240 = 'P240',
  P360 = 'P360',
  P480 = 'P480',
  P720 = 'P720',
  P1080 = 'P1080',
  P1440 = 'P1440',
  P2160 = 'P2160',
}

export type VideoInputDto = {
  title: string;
  author: string;
  availableResolutions: AvailableResolutions[];
};

export interface Video extends VideoInputDto {
  id: number;
  createdAt: Date;
  canBeDownloaded: boolean;
  minAgeRestriction: number | null;
  publicationDate: Date;
}

export type VideoInputUpdateDto = Omit<Video, 'id' | 'createdAt'>;
