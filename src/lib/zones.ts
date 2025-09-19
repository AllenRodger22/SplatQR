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
  return {
    id,
    label: `Zona ${letter.toUpperCase()}`,
    uuid: `splatrq22-${id}`,
  };
});

export const TOTAL_ZONES = ZONE_DEFINITIONS.length;

export const LOGIN_PATH = '/login';
