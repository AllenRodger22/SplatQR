export interface ZoneDefinition {
  id: string;
  label: string;
  uuid: string;
}

const ZONE_LETTERS = Array.from({ length: 11 }, (_, index) =>
  String.fromCharCode(97 + index)
);

export const ZONE_DEFINITIONS: ZoneDefinition[] = ZONE_LETTERS.map((letter) => {
  const id = `zone-${letter}`;
  // Example of a more complex, less obvious UUID format
  const randomPart = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
  const shortRandom = randomPart.substring(0, 20);
  return {
    id,
    label: `Zona ${letter.toUpperCase()}`,
    uuid: `${shortRandom}${letter}`,
  };
});

export const TOTAL_ZONES = ZONE_DEFINITIONS.length;

export const LOGIN_PATH = '/login';
