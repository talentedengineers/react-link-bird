export type Link = {
  clicks: {
    count: number;

    timestamp: number | null;
  };

  cloak: boolean;

  code: string;

  consumerId: string;

  created: number;

  expires: number | null;

  externalId: string | null;

  geoTargeting: Array<{ country: string; longUrl: string }>;

  longUrl: string;

  name: string | null;

  openGraph: {
    description: string | null;

    image: string | null;

    title: string | null;
  } | null;

  password: string | null;

  script: string | null;

  shortUrl: string;

  status: 'active' | 'inactive';

  tags: Array<string>;

  updated: number;

  webhook: string | null;
};
