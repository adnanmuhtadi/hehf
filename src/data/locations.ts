export const AVAILABLE_LOCATIONS = [
  'Cheshunt',
  'Chingford', 
  'Elstree and Borehamwood',
  'Harpenden',
  'Harrow',
  'Hatch End',
  'Loughton',
  'Stevenage',
  'Watford'
] as const;

export type Location = typeof AVAILABLE_LOCATIONS[number];