export type PokemonOption = {
  id: number;
  label: string;
};

export type Question = {
  id: number; // número na Pokédex
  name: string; // nome correto (formatado)
  types: string[]; // nomes dos tipos na PokéAPI (ex.: "fairy")
  description: string; // descrição sem o nome do Pokémon
  options: PokemonOption[]; // 4 alternativas
  correctId: number;
};

export type Answer = {
  question: Question;
  selectedId: number;
  correct: boolean;
};

export type Screen = 'home' | 'quiz' | 'result';
