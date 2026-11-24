import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors } from '../theme';
import TypeChip from '../components/TypeChip';
import { generateQuiz, artworkUrl, TOTAL_QUESTIONS } from '../api/pokeapi';
import type { Answer, PokemonOption, Question } from '../types';

const pad = (n: number): string => String(n).padStart(3, '0');

type Props = {
  onFinish: (answers: Answer[]) => void;
  onExit: () => void;
};

export default function QuizScreen({ onFinish, onExit }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const quiz = await generateQuiz();
      setQuestions(quiz);
      setIndex(0);
      setSelected(null);
      setAnswers([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar o quiz.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Procurando Pokémon na Pokédex...</Text>
      </View>
    );
  }

  if (error || questions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Ops! Algo deu errado</Text>
        <Text style={styles.errorText}>{error ?? 'Nenhuma pergunta disponível.'}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={load}>
          <Text style={styles.primaryButtonText}>Tentar de novo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={onExit}>
          <Text style={styles.linkText}>Voltar ao início</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const question = questions[index];
  const answered = selected !== null;
  const isLast = index === questions.length - 1;

  const handleSelect = (optionId: number) => {
    if (answered) return;
    setSelected(optionId);
  };

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers: Answer[] = [
      ...answers,
      {
        question,
        selectedId: selected,
        correct: selected === question.correctId,
      },
    ];
    if (isLast) {
      onFinish(newAnswers);
    } else {
      setAnswers(newAnswers);
      setIndex(index + 1);
      setSelected(null);
    }
  };

  const optionStyle = (opt: PokemonOption): StyleProp<ViewStyle> => {
    if (!answered) return styles.option;
    if (opt.id === question.correctId) return [styles.option, styles.optionCorrect];
    if (opt.id === selected) return [styles.option, styles.optionWrong];
    return [styles.option, styles.optionDim];
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit}>
          <Text style={styles.exit}>✕ Sair</Text>
        </TouchableOpacity>
        <Text style={styles.progressText}>
          Pergunta {index + 1}/{TOTAL_QUESTIONS}
        </Text>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` },
          ]}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.dexNumber}>Pokédex #{pad(question.id)}</Text>
        <View style={styles.typesRow}>
          {question.types.map((t) => (
            <TypeChip key={t} type={t} />
          ))}
        </View>
        <Text style={styles.description}>“{question.description}”</Text>

        {answered && (
          <Image
            source={{ uri: artworkUrl(question.id) }}
            style={styles.artwork}
            resizeMode="contain"
          />
        )}
      </View>

      <Text style={styles.prompt}>Qual é o nome desse Pokémon?</Text>

      {question.options.map((opt) => (
        <TouchableOpacity
          key={opt.id}
          style={optionStyle(opt)}
          onPress={() => handleSelect(opt.id)}
          activeOpacity={answered ? 1 : 0.8}
        >
          <Text style={styles.optionText}>{opt.label}</Text>
        </TouchableOpacity>
      ))}

      {answered && (
        <View style={styles.feedback}>
          <Text
            style={[
              styles.feedbackText,
              { color: selected === question.correctId ? colors.correct : colors.wrong },
            ]}
          >
            {selected === question.correctId ? 'Acertou! 🎉' : `Errou! Era ${question.name}.`}
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>
              {isLast ? 'Ver resultado' : 'Próxima pergunta'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: { color: colors.muted, marginTop: 16, fontSize: 16 },
  errorTitle: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  errorText: { color: colors.muted, textAlign: 'center', marginBottom: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exit: { color: colors.muted, fontSize: 15 },
  progressText: { color: colors.text, fontWeight: '700', fontSize: 15 },
  progressBar: {
    height: 8,
    backgroundColor: colors.card,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },
  dexNumber: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
  },
  typesRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  description: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 25,
    fontStyle: 'italic',
  },
  artwork: { width: '100%', height: 180, marginTop: 14 },
  prompt: {
    color: colors.muted,
    fontSize: 15,
    marginBottom: 10,
    fontWeight: '600',
  },
  option: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  optionCorrect: { backgroundColor: '#14532d', borderColor: colors.correct },
  optionWrong: { backgroundColor: '#7f1d1d', borderColor: colors.wrong },
  optionDim: { opacity: 0.45 },
  optionText: { color: colors.text, fontSize: 17, fontWeight: '600' },
  feedback: { alignItems: 'center', marginTop: 10 },
  feedbackText: { fontSize: 19, fontWeight: '800', marginBottom: 14 },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
  },
  primaryButtonText: { color: colors.primaryText, fontSize: 17, fontWeight: '800' },
  linkButton: { marginTop: 14 },
  linkText: { color: colors.muted, fontSize: 15 },
});
