import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import type { Answer } from '../types';

const pad = (n: number): string => String(n).padStart(3, '0');

function getMessage(score: number, total: number): string {
  const ratio = score / total;
  if (ratio === 1) return 'Mestre Pokémon! 🏆';
  if (ratio >= 0.7) return 'Ótimo treinador! 🔥';
  if (ratio >= 0.4) return 'Está no caminho certo! 💪';
  return 'Continue treinando! 📖';
}

type Props = {
  answers: Answer[];
  onRestart: () => void;
  onHome: () => void;
};

export default function ResultScreen({ answers, onRestart, onHome }: Props) {
  const total = answers.length;
  const score = answers.filter((a) => a.correct).length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Resultado</Text>

      <View style={styles.scoreCard}>
        <Text style={styles.score}>
          {score}/{total}
        </Text>
        <Text style={styles.message}>{getMessage(score, total)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Revisão das respostas</Text>

      {answers.map((a, i) => {
        const chosen = a.question.options.find((o) => o.id === a.selectedId);
        return (
          <View
            key={a.question.id}
            style={[styles.row, a.correct ? styles.rowCorrect : styles.rowWrong]}
          >
            <Text style={styles.rowIcon}>{a.correct ? '✅' : '❌'}</Text>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>
                {i + 1}. #{pad(a.question.id)} — {a.question.name}
              </Text>
              {!a.correct && (
                <Text style={styles.rowSub}>Sua resposta: {chosen ? chosen.label : '-'}</Text>
              )}
            </View>
          </View>
        );
      })}

      <TouchableOpacity style={styles.primaryButton} onPress={onRestart}>
        <Text style={styles.primaryButtonText}>Jogar novamente</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={onHome}>
        <Text style={styles.linkText}>Voltar ao início</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
  },
  scoreCard: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 22,
  },
  score: { color: colors.text, fontSize: 56, fontWeight: '900' },
  message: { color: colors.muted, fontSize: 18, marginTop: 4 },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  rowCorrect: { backgroundColor: '#052e16', borderColor: '#166534' },
  rowWrong: { backgroundColor: '#450a0a', borderColor: '#991b1b' },
  rowIcon: { fontSize: 20, marginRight: 10 },
  rowContent: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  rowSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  primaryButtonText: { color: colors.primaryText, fontSize: 17, fontWeight: '800' },
  linkButton: { alignItems: 'center', marginTop: 14 },
  linkText: { color: colors.muted, fontSize: 15 },
});
