import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import QuizScreen from './src/screens/QuizScreen';
import ResultScreen from './src/screens/ResultScreen';
import type { Answer, Screen } from './src/types';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [quizKey, setQuizKey] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number | null>(null);

  const startQuiz = () => {
    setQuizKey((k) => k + 1); // remonta o quiz e sorteia novas perguntas
    setScreen('quiz');
  };

  const finishQuiz = (finalAnswers: Answer[]) => {
    const score = finalAnswers.filter((a) => a.correct).length;
    setBestScore((prev) => (prev === null || score > prev ? score : prev));
    setAnswers(finalAnswers);
    setScreen('result');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        {screen === 'home' && <HomeScreen onStart={startQuiz} bestScore={bestScore} />}
        {screen === 'quiz' && (
          <QuizScreen key={quizKey} onFinish={finishQuiz} onExit={() => setScreen('home')} />
        )}
        {screen === 'result' && (
          <ResultScreen
            answers={answers}
            onRestart={startQuiz}
            onHome={() => setScreen('home')}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
});
