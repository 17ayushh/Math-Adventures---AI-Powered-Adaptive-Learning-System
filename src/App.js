import React, { useState, useEffect } from 'react';
import { Brain, Trophy, Clock, Target, TrendingUp, Award } from 'lucide-react';

// Puzzle Generator
const generatePuzzle = (difficulty, operation) => {
  const ranges = {
    easy: { min: 1, max: 10 },
    medium: { min: 10, max: 50 },
    hard: { min: 50, max: 100 }
  };
  
  const range = ranges[difficulty];
  const num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  const num2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  
  let question, answer;
  
  switch(operation) {
    case 'addition':
      question = `${num1} + ${num2}`;
      answer = num1 + num2;
      break;
    case 'subtraction':
      const larger = Math.max(num1, num2);
      const smaller = Math.min(num1, num2);
      question = `${larger} - ${smaller}`;
      answer = larger - smaller;
      break;
    case 'multiplication':
      const m1 = difficulty === 'easy' ? Math.floor(Math.random() * 10) + 1 : num1;
      const m2 = difficulty === 'easy' ? Math.floor(Math.random() * 10) + 1 : 
                 difficulty === 'medium' ? Math.floor(Math.random() * 12) + 1 : num2;
      question = `${m1} × ${m2}`;
      answer = m1 * m2;
      break;
    case 'division':
      const divisor = difficulty === 'easy' ? Math.floor(Math.random() * 9) + 2 :
                     difficulty === 'medium' ? Math.floor(Math.random() * 12) + 2 :
                     Math.floor(Math.random() * 20) + 2;
      const quotient = Math.floor(Math.random() * 10) + 1;
      const dividend = divisor * quotient;
      question = `${dividend} ÷ ${divisor}`;
      answer = quotient;
      break;
    default:
      question = `${num1} + ${num2}`;
      answer = num1 + num2;
  }
  
  return { question, answer };
};

// Adaptive Engine using Logistic Regression-style updates
class AdaptiveEngine {
  constructor() {
    this.weights = { easy: 0, medium: 0, hard: 0 };
    this.learningRate = 0.1;
    this.performanceHistory = [];
  }
  
  updateWeights(difficulty, isCorrect, responseTime) {
    // Feature extraction
    const timeScore = Math.max(0, 1 - (responseTime / 30000)); // 30s baseline
    const performance = isCorrect ? 1 : 0;
    const combinedScore = (performance * 0.7) + (timeScore * 0.3);
    
    this.performanceHistory.push({ difficulty, score: combinedScore, time: responseTime });
    
    // Update weights based on performance
    if (combinedScore > 0.7) {
      // Doing well, increase weight for harder levels
      this.weights.hard += this.learningRate * combinedScore;
      this.weights.medium += this.learningRate * combinedScore * 0.5;
      this.weights.easy -= this.learningRate * combinedScore * 0.3;
    } else if (combinedScore < 0.4) {
      // Struggling, increase weight for easier levels
      this.weights.easy += this.learningRate * (1 - combinedScore);
      this.weights.medium += this.learningRate * (1 - combinedScore) * 0.5;
      this.weights.hard -= this.learningRate * (1 - combinedScore) * 0.3;
    }
    
    // Keep weights bounded
    Object.keys(this.weights).forEach(key => {
      this.weights[key] = Math.max(-2, Math.min(2, this.weights[key]));
    });
  }
  
  predictNextDifficulty(currentDifficulty) {
    // Calculate recent performance (last 3 attempts)
    const recent = this.performanceHistory.slice(-3);
    if (recent.length === 0) return currentDifficulty;
    
    const avgScore = recent.reduce((sum, h) => sum + h.score, 0) / recent.length;
    const avgTime = recent.reduce((sum, h) => sum + h.time, 0) / recent.length;
    
    // Decision logic with ML-influenced weights
    const scores = {
      easy: Math.exp(this.weights.easy) * (avgScore < 0.4 ? 2 : 0.5),
      medium: Math.exp(this.weights.medium) * (avgScore >= 0.4 && avgScore <= 0.7 ? 2 : 1),
      hard: Math.exp(this.weights.hard) * (avgScore > 0.7 && avgTime < 15000 ? 2 : 0.5)
    };
    
    // Normalize and select
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const probabilities = Object.fromEntries(
      Object.entries(scores).map(([k, v]) => [k, v / total])
    );
    
    // Select highest probability
    return Object.entries(probabilities).reduce((a, b) => b[1] > a[1] ? b : a)[0];
  }
  
  getSessionStats() {
    if (this.performanceHistory.length === 0) return null;
    
    const correct = this.performanceHistory.filter(h => h.score >= 0.7).length;
    const total = this.performanceHistory.length;
    const accuracy = (correct / total * 100).toFixed(1);
    const avgTime = (this.performanceHistory.reduce((sum, h) => sum + h.time, 0) / total / 1000).toFixed(1);
    
    return { correct, total, accuracy, avgTime };
  }
}

const MathAdventures = () => {
  const [gameState, setGameState] = useState('setup');
  const [userName, setUserName] = useState('');
  const [operation, setOperation] = useState('addition');
  const [difficulty, setDifficulty] = useState('easy');
  const [puzzle, setPuzzle] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [adaptiveEngine] = useState(() => new AdaptiveEngine());
  const [puzzleCount, setPuzzleCount] = useState(0);
  const [sessionLog, setSessionLog] = useState([]);

  useEffect(() => {
    if (gameState === 'playing' && !puzzle) {
      startNewPuzzle();
    }
  }, [gameState]);

  const startNewPuzzle = () => {
    const newPuzzle = generatePuzzle(difficulty, operation);
    setPuzzle(newPuzzle);
    setUserAnswer('');
    setFeedback('');
    setStartTime(Date.now());
  };

  const handleSubmit = () => {
    if (!userAnswer || feedback) return;
    
    const responseTime = Date.now() - startTime;
    const isCorrect = parseInt(userAnswer) === puzzle.answer;
    
    // Update adaptive engine
    adaptiveEngine.updateWeights(difficulty, isCorrect, responseTime);
    
    // Log attempt
    const logEntry = {
      puzzleNum: puzzleCount + 1,
      question: puzzle.question,
      correctAnswer: puzzle.answer,
      userAnswer: parseInt(userAnswer),
      isCorrect,
      responseTime: (responseTime / 1000).toFixed(1),
      difficulty
    };
    setSessionLog([...sessionLog, logEntry]);
    
    // Show feedback
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    setTimeout(() => {
      const newCount = puzzleCount + 1;
      setPuzzleCount(newCount);
      
      if (newCount >= 10) {
        setGameState('summary');
      } else {
        // Predict next difficulty
        const nextDifficulty = adaptiveEngine.predictNextDifficulty(difficulty);
        setDifficulty(nextDifficulty);
        startNewPuzzle();
      }
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const startGame = () => {
    if (userName.trim()) {
      setGameState('playing');
      setPuzzleCount(0);
      setSessionLog([]);
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setUserName('');
    setPuzzle(null);
    setPuzzleCount(0);
    setSessionLog([]);
    setDifficulty('easy');
  };

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-center mb-6">
              <Brain className="w-16 h-16 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
              Math Adventures
            </h1>
            <p className="text-center text-gray-600 mb-8">AI-Powered Adaptive Learning</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && startGame()}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-lg"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Operation
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['addition', 'subtraction', 'multiplication', 'division'].map(op => (
                    <button
                      key={op}
                      onClick={() => setOperation(op)}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                        operation === op
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {op.charAt(0).toUpperCase() + op.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Difficulty
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['easy', 'medium', 'hard'].map(level => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                        difficulty === level
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={startGame}
                disabled={!userName.trim()}
                className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Start Adventure!
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'summary') {
    const stats = adaptiveEngine.getSessionStats();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-center mb-6">
              <Trophy className="w-20 h-20 text-yellow-500" />
            </div>
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
              Great Job, {userName}!
            </h1>
            <p className="text-center text-gray-600 mb-8">Session Complete</p>
            
            {stats && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 p-6 rounded-xl text-center">
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-blue-600">{stats.accuracy}%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl text-center">
                  <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-purple-600">{stats.avgTime}s</div>
                  <div className="text-sm text-gray-600">Avg Time</div>
                </div>
                <div className="bg-green-50 p-6 rounded-xl text-center">
                  <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-green-600">{stats.correct}/{stats.total}</div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div className="bg-indigo-50 p-6 rounded-xl text-center">
                  <TrendingUp className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-indigo-600 capitalize">{difficulty}</div>
                  <div className="text-sm text-gray-600">Final Level</div>
                </div>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-xl p-6 mb-6 max-h-80 overflow-y-auto">
              <h3 className="font-bold text-lg mb-4">Performance Log</h3>
              <div className="space-y-2">
                {sessionLog.map((log, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${log.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        #{log.puzzleNum}: {log.question} = {log.correctAnswer}
                      </span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">{log.responseTime}s</span>
                        <span className={`px-2 py-1 rounded ${log.isCorrect ? 'bg-green-200' : 'bg-red-200'}`}>
                          {log.isCorrect ? '✓' : '✗'}
                        </span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded uppercase">
                          {log.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={resetGame}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Hello, {userName}!</h2>
              <p className="text-gray-600">Question {puzzleCount + 1} of 10</p>
            </div>
            <div className="text-right">
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {difficulty.toUpperCase()}
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-12 mb-8 text-center">
            <div className="text-6xl font-bold mb-4">
              {puzzle?.question}
            </div>
            <div className="text-xl opacity-90">What's the answer?</div>
          </div>
          
          {feedback && (
            <div className={`mb-6 p-4 rounded-lg text-center font-bold text-lg ${
              feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {feedback === 'correct' ? '🎉 Correct!' : '❌ Try again next time!'}
            </div>
          )}
          
          <div className="space-y-4">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-2xl text-center"
              placeholder="Type your answer"
              disabled={!!feedback}
              autoFocus
            />
            <button
              onClick={handleSubmit}
              disabled={!userAnswer || !!feedback}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Submit Answer
            </button>
          </div>
          
          <div className="mt-6 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${(puzzleCount / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathAdventures;
