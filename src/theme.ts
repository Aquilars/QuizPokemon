export const colors = {
  bg: '#0f172a',
  card: '#1e293b',
  cardBorder: '#334155',
  text: '#f8fafc',
  muted: '#94a3b8',
  primary: '#facc15',
  primaryText: '#1e293b',
  correct: '#16a34a',
  wrong: '#dc2626',
} as const;

export type TypeInfo = { label: string; color: string };

export const TYPE_INFO: Record<string, TypeInfo> = {
  normal: { label: 'Normal', color: '#a8a77a' },
  fire: { label: 'Fogo', color: '#ee8130' },
  water: { label: 'Água', color: '#6390f0' },
  electric: { label: 'Elétrico', color: '#d4a90f' },
  grass: { label: 'Planta', color: '#4fa83d' },
  ice: { label: 'Gelo', color: '#4fb8b0' },
  fighting: { label: 'Lutador', color: '#c22e28' },
  poison: { label: 'Veneno', color: '#a33ea1' },
  ground: { label: 'Terra', color: '#b8964a' },
  flying: { label: 'Voador', color: '#8e72d8' },
  psychic: { label: 'Psíquico', color: '#f95587' },
  bug: { label: 'Inseto', color: '#8f9c14' },
  rock: { label: 'Pedra', color: '#a6862a' },
  ghost: { label: 'Fantasma', color: '#735797' },
  dragon: { label: 'Dragão', color: '#6f35fc' },
  dark: { label: 'Sombrio', color: '#705746' },
  steel: { label: 'Aço', color: '#7a7aa0' },
  fairy: { label: 'Fada', color: '#d685ad' },
};
