export type PixelEvent = {
  consumerId: string;

  country: string | null;

  ipAddress: string;

  metadata:
    | {
        code: string;
        longUrl: string;
      }
    | { [key: string]: string };

  referrer: string | null;

  tags: Array<string>;

  timestamp: number;

  type: string;

  userAgent: {
    ua: string;
    browser: {
      name: string | null;
      version: string | null;
      major: string | null;
    };
    engine: { name: string | null; version: string | null };
    os: { name: string | null; version: string | null };
    device: {
      vendor: string | null;
      model: string | null;
      type: string | null;
    };
    cpu: { architecture: string | null };
  };
};
