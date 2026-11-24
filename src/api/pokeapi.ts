import type { Question } from '../types';

const BASE = 'https://pokeapi.co/api/v2';
const TOTAL_POKEMON = 1025; // espécies da Pokédex nacional (#1 a #1025)

export const TOTAL_QUESTIONS = 10;

type NamedPokemon = { id: number; name: string };

interface PokemonListResponse {
  results: { name: string; url: string }[];
}

interface PokemonResponse {
  types: { slot: number; type: { name: string } }[];
}

interface SpeciesResponse {
  flavor_text_entries: { flavor_text: string; language: { name: string } }[];
}

let namesCache: NamedPokemon[] | null = null;

const SPECIAL_NAMES: Record<string, string> = {
  'nidoran-f': 'Nidoran ♀',
  'nidoran-m': 'Nidoran ♂',
  'mr-mime': 'Mr. Mime',
  'mime-jr': 'Mime Jr.',
  'mr-rime': 'Mr. Rime',
  farfetchd: "Farfetch'd",
  sirfetchd: "Sirfetch'd",
  'ho-oh': 'Ho-Oh',
  'porygon-z': 'Porygon-Z',
  'type-null': 'Type: Null',
  'jangmo-o': 'Jangmo-o',
  'hakamo-o': 'Hakamo-o',
  'kommo-o': 'Kommo-o',
  flabebe: 'Flabébé',
};

export function formatName(raw: string): string {
  if (SPECIAL_NAMES[raw]) return SPECIAL_NAMES[raw];
  return raw
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ${res.status} ao acessar a PokéAPI`);
  return (await res.json()) as T;
}

async function getAllNames(): Promise<NamedPokemon[]> {
  if (namesCache) return namesCache;
  const data = await getJson<PokemonListResponse>(
    `${BASE}/pokemon?limit=${TOTAL_POKEMON}&offset=0`
  );
  namesCache = data.results.map((p) => ({
    id: Number(p.url.split('/').filter(Boolean).pop()),
    name: p.name,
  }));
  return namesCache;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Remove o nome do Pokémon (e variações) da descrição, para não entregar a resposta.
function hideName(text: string, rawName: string): string {
  const formatted = formatName(rawName);
  const candidates = new Set<string>([rawName, rawName.replace(/-/g, ' '), formatted]);
  formatted.split(/[\s-]+/).forEach((part) => {
    if (part.replace(/[^a-zA-Z]/g, '').length >= 4) candidates.add(part);
  });
  const sorted = [...candidates].sort((a, b) => b.length - a.length);
  let result = text;
  sorted.forEach((c) => {
    result = result.replace(new RegExp(escapeRegExp(c), 'gi'), '???');
  });
  return result;
}

function cleanFlavor(text: string): string {
  return text.replace(/[\n\f\r]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function pickDescription(species: SpeciesResponse, rawName: string): string {
  const entries = species.flavor_text_entries
    .filter((e) => e.language.name === 'en')
    .map((e) => cleanFlavor(e.flavor_text));
  const unique = [...new Set(entries)];
  const good = unique.filter((t) => t.length >= 40);
  const pool = good.length > 0 ? good : unique;
  const chosen = pool[Math.floor(Math.random() * pool.length)] ?? 'Sem descrição disponível.';
  return hideName(chosen, rawName);
}

// ---- Tradução EN -> PT-BR (a PokéAPI não tem descrições em português) ----

async function fetchWithTimeout(url: string, ms = 7000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function translateGoogle(text: string): Promise<string> {
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=' +
    encodeURIComponent(text);
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error('translate failed');
  const data = (await res.json()) as unknown[][][];
  const out = data[0].map((part) => String(part[0])).join('');
  if (!out) throw new Error('empty translation');
  return out;
}

async function translateMyMemory(text: string): Promise<string> {
  const url =
    'https://api.mymemory.translated.net/get?langpair=en|pt-br&q=' + encodeURIComponent(text);
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error('translate failed');
  const data = (await res.json()) as {
    responseStatus: number | string;
    responseData?: { translatedText?: string };
  };
  const out = data.responseData?.translatedText;
  if (!out || Number(data.responseStatus) !== 200) throw new Error('empty translation');
  return out;
}

// Tenta traduzir; se todos os serviços falharem, devolve o texto original em inglês.
async function translateToPt(text: string): Promise<string> {
  try {
    return await translateGoogle(text);
  } catch {
    try {
      return await translateMyMemory(text);
    } catch {
      return text;
    }
  }
}

export function artworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

async function buildQuestion(correct: NamedPokemon, allNames: NamedPokemon[]): Promise<Question> {
  const [pokemon, species] = await Promise.all([
    getJson<PokemonResponse>(`${BASE}/pokemon/${correct.id}`),
    getJson<SpeciesResponse>(`${BASE}/pokemon-species/${correct.id}`),
  ]);

  const types = [...pokemon.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name);

  const distractors = sample(
    allNames.filter((p) => p.id !== correct.id),
    3
  );

  const options = shuffle([correct, ...distractors]).map((p) => ({
    id: p.id,
    label: formatName(p.name),
  }));

  // Oculta o nome, traduz e oculta de novo (caso a tradução reintroduza o nome)
  const hiddenEn = pickDescription(species, correct.name);
  const translated = await translateToPt(hiddenEn);
  const description = hideName(translated, correct.name);

  return {
    id: correct.id,
    name: formatName(correct.name),
    types,
    description,
    options,
    correctId: correct.id,
  };
}

export async function generateQuiz(): Promise<Question[]> {
  const allNames = await getAllNames();
  const chosen = sample(allNames, TOTAL_QUESTIONS);
  return Promise.all(chosen.map((p) => buildQuestion(p, allNames)));
}
