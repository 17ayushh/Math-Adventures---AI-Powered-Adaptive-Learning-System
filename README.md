# 🧮 Math Adventures - AI-Powered Adaptive Learning System

An intelligent math learning platform that dynamically adjusts difficulty based on user performance using machine learning algorithms.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Adaptive Learning Algorithm](#adaptive-learning-algorithm)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Future Enhancements](#future-enhancements)

## 🎯 Overview

Math Adventures is an adaptive learning prototype designed for children aged 5-10 to practice basic arithmetic operations. The system uses a **logistic regression-style algorithm** to personalize difficulty levels based on real-time performance metrics.

### Assignment Details
- **Course**: Adaptive Learning Systems
- **Objective**: Build an AI-powered math learning system with dynamic difficulty adjustment
- **Technology**: React.js with custom ML algorithm

## ✨ Features

### Core Functionality
- ✅ **4 Math Operations**: Addition, Subtraction, Multiplication, Division
- ✅ **3 Difficulty Levels**: Easy, Medium, Hard
- ✅ **Real-time Adaptation**: AI adjusts difficulty based on performance
- ✅ **Performance Tracking**: Records correctness and response time
- ✅ **Session Analytics**: Comprehensive statistics and insights
- ✅ **Interactive UI**: Child-friendly, responsive design

### Adaptive Learning Features
- **Machine Learning Algorithm**: Custom implementation using weight updates
- **Performance Metrics**: Combines accuracy (70%) and speed (30%)
- **Dynamic Difficulty**: Analyzes last 3 attempts for prediction
- **Personalized Experience**: Keeps learners in optimal challenge zone

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend Framework | React 18.2.0 |
| UI Styling | Tailwind CSS 3.x |
| Icons | Lucide React |
| Build Tool | Create React App |
| ML Algorithm | Custom Logistic Regression |
| State Management | React Hooks (useState, useEffect) |

## 🏗️ Architecture

### System Components

1. **Puzzle Generator** (`generatePuzzle`)
   - Creates random math problems
   - Adjusts number ranges based on difficulty
   - Supports 4 arithmetic operations

2. **Adaptive Engine** (`AdaptiveEngine` class)
   - Implements ML-based difficulty prediction
   - Updates weights based on performance
   - Calculates probability distributions for next difficulty

3. **Performance Tracker**
   - Records correctness and response time
   - Maintains session history
   - Generates performance statistics

4. **UI Components**
   - Setup screen (name, operation, difficulty selection)
   - Playing screen (puzzle display and answer input)
   - Summary screen (session analytics and performance log)

### Adaptive Learning Flow

```
Start → Select Difficulty → Generate Puzzle → User Answers
   ↓
Record Performance (Correctness + Time)
   ↓
Update ML Weights
   ↓
Predict Next Difficulty → Generate New Puzzle
   ↓
Repeat for 10 Questions → Show Summary
```

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup Instructions

```bash
# Clone the repository
git clone https://github.com/yourusername/math-adaptive-learning.git

# Navigate to project directory
cd math-adaptive-learning

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

## 🎮 Usage

### Getting Started

1. **Enter your name** on the welcome screen
2. **Choose a math operation** (Addition, Subtraction, Multiplication, Division)
3. **Select starting difficulty** (Easy, Medium, Hard)
4. Click **"Start Adventure!"**

### During Session

- Solve 10 math problems
- Type your answer and press Enter or click Submit
- Watch as the difficulty adapts to your performance
- Green feedback = Correct, Red feedback = Incorrect

### After Session

View your comprehensive performance report:
- **Accuracy Percentage**
- **Average Response Time**
- **Correct/Total Questions**
- **Final Difficulty Level**
- **Detailed Performance Log**

## 🧠 Adaptive Learning Algorithm

### Algorithm Overview

The system uses a **custom logistic regression-style algorithm** with the following components:

#### 1. Feature Extraction
```javascript
timeScore = max(0, 1 - (responseTime / 30000))
performance = isCorrect ? 1 : 0
combinedScore = (performance × 0.7) + (timeScore × 0.3)
```

#### 2. Weight Updates
```
if combinedScore > 0.7:
    → Increase weights for harder difficulties
    → Decrease weights for easier difficulties
    
if combinedScore < 0.4:
    → Increase weights for easier difficulties
    → Decrease weights for harder difficulties
```

#### 3. Difficulty Prediction
```javascript
// Calculate scores using exponential weighting
scores = {
  easy: exp(weight_easy) × context_multiplier,
  medium: exp(weight_medium) × context_multiplier,
  hard: exp(weight_hard) × context_multiplier
}

// Normalize to probabilities
probabilities = scores / sum(scores)

// Select highest probability
nextDifficulty = argmax(probabilities)
```

### Key Parameters

| Parameter | Value | Purpose |
|-----------|-------|---------|
| Learning Rate | 0.1 | Controls weight update speed |
| Weight Bounds | [-2, 2] | Prevents extreme values |
| Time Baseline | 30 seconds | Reference for speed scoring |
| History Window | 3 attempts | Recent performance analysis |
| Accuracy Weight | 70% | Importance of correctness |
| Speed Weight | 30% | Importance of response time |

## 📸 Screenshots

### Setup Screen
![Setup Screen](screenshots/setup.png)
*Welcome screen with name input and difficulty selection*

### Playing Screen
![Playing Screen](screenshots/playing.png)
*Active puzzle with real-time difficulty indicator*

### Summary Screen
![Summary Screen](screenshots/summary.png)
*Comprehensive performance analytics and session log*

> **Note**: Add actual screenshots to a `screenshots/` folder in your repository

## 📁 Project Structure

```
math-adaptive-learning/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── App.js                  # Main application component
│   │   ├── generatePuzzle()    # Puzzle generation logic
│   │   ├── AdaptiveEngine      # ML algorithm class
│   │   └── MathAdventures      # React component
│   ├── index.js                # React entry point
│   └── index.css               # Global styles
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies & scripts
├── package-lock.json           # Dependency lock file
└── README.md                   # Project documentation
```

## 🔬 Technical Implementation Details

### Puzzle Generation Logic

**Easy Mode:**
- Addition/Subtraction: 1-10
- Multiplication: 1-10 × 1-10
- Division: Simple divisors (2-10)

**Medium Mode:**
- Addition/Subtraction: 10-50
- Multiplication: 1-50 × 1-12
- Division: Divisors 2-12

**Hard Mode:**
- Addition/Subtraction: 50-100
- Multiplication: 50-100 × 50-100
- Division: Divisors 2-20

### State Management

React hooks used:
- `useState`: Game state, user inputs, performance data
- `useEffect`: Puzzle initialization, side effects

### Performance Optimization

- Memoized adaptive engine instance
- Efficient state updates
- Minimal re-renders
- Optimized difficulty calculations

## 🚀 Future Enhancements

### Planned Features
- [ ] User authentication and profile management
- [ ] Progress tracking across sessions
- [ ] Leaderboard for competitive learning
- [ ] More operations (fractions, decimals, exponents)
- [ ] Audio feedback and animations
- [ ] Parent/teacher dashboard
- [ ] Multi-language support
- [ ] Mobile application (React Native)
- [ ] Advanced ML models (Neural Networks)
- [ ] Gamification (badges, achievements, rewards)

### Algorithm Improvements
- [ ] Implement reinforcement learning
- [ ] Add long-term memory of user patterns
- [ ] Multi-objective optimization
- [ ] Adaptive learning rate
- [ ] Personalized difficulty curves

## 📊 Performance Metrics

The system tracks and displays:
- **Accuracy**: Percentage of correct answers
- **Average Time**: Mean response time per question
- **Difficulty Progression**: Visual tracking of level changes
- **Question Log**: Detailed history of all attempts

## 🤝 Contributing

This is an academic assignment project. However, suggestions and feedback are welcome!

## 📄 License

This project is created for educational purposes as part of an Adaptive Learning Systems course assignment.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com
- Course: Adaptive Learning Systems
- Institution: Your University Name

## 🙏 Acknowledgments

- Assignment designed by [Professor Name]
- Inspired by adaptive learning research in educational technology
- React documentation and community
- Tailwind CSS for rapid UI development

## 📚 References

1. Educational Technology Literature on Adaptive Learning
2. React Documentation - https://react.dev
3. Machine Learning Algorithms for Personalized Learning
4. Logistic Regression in Adaptive Systems

---

**⭐ If you find this project useful, please star the repository!**

**📝 For questions or issues, please open an issue in the GitHub repository.**

Last Updated: November 2025
