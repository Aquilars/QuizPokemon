import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { TOTAL_QUESTIONS } from '../api/pokeapi';

type Props = {
  onStart: () => void;
  bestScore: number | null;
};

export default function HomeScreen({ onStart, bestScore }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚡</Text>
      <Text style={styles.title}>PokéQuiz</Text>
      <Text style={styles.subtitle}>Quem é esse Pokémon?</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Como jogar</Text>
        <Text style={styles.rule}>• {TOTAL_QUESTIONS} perguntas, 4 alternativas cada</Text>
        <Text style={styles.rule}>• Você vê o número na Pokédex, o tipo e a descrição</Text>
        <Text style={styles.rule}>• A descrição não revela o nome — adivinhe qual é o Pokémon!</Text>
        <Text style={styles.rule}>• Apenas uma alternativa está correta</Text>
      </View>

      {bestScore !== null && (
        <Text style={styles.best}>
          Melhor pontuação: {bestScore}/{TOTAL_QUESTIONS}
        </Text>
      )}

      <TouchableOpacity style={styles.button} onPress={onStart} activeOpacity={0.85}>
        <Text style={styles.buttonText}>Começar quiz</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Dados: PokéAPI (pokeapi.co)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji: { fontSize: 56 },
  title: {
    color: colors.primary,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 18,
    marginBottom: 28,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    width: '100%',
    marginBottom: 20,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  rule: {
    color: colors.muted,
    fontSize: 15,
    marginBottom: 4,
    lineHeight: 21,
  },
  best: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
  },
  buttonText: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: '800',
  },
  footer: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 24,
  },
});
