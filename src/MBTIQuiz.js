import { useState } from 'react';
import { Share2, RotateCcw, CheckCircle } from 'lucide-react';
import questions from './constants/questions';
import candidateNames from './constants/candidateNames';
import vectors from './constants/vectors';

export function MBTIQuiz() {
    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [result, setResult] = useState(null);
    const [scores, setScores] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);

  const handleAnswer = (choice) => {
    setIsAnimating(true);
    setAnswers(prev => ({ ...prev, [currentQuestion]: choice }));
    
    setTimeout(() => {
      if (currentQuestion === questions.length) {
        calculateResult({ ...answers, [currentQuestion]: choice });
      } else {
        setCurrentQuestion(prev => prev + 1);
        setIsAnimating(false);
      }
    }, 300);
  };

  const calculateResult = (finalAnswers) => {
    const scoreArray = Array(6).fill(0);
    for (const [qid, choice] of Object.entries(finalAnswers)) {
      const vec = vectors[+qid][choice];
      vec.forEach((v, i) => {
        scoreArray[i] += v;
      });
    }
    const maxScore = Math.max(...scoreArray);
    const topIndex = scoreArray.findIndex(score => score === maxScore);
    
    // 점수를 퍼센트로 변환
    const total = scoreArray.reduce((sum, score) => sum + score, 0);
    const percentScores = scoreArray.map(score => 
      total > 0 ? Math.round((score / total) * 100) : 0
    );
    
    setScores(percentScores);
    setResult(candidateNames[topIndex]);
    setIsAnimating(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '정책 MBTI 테스트 결과',
          text: `나와 가장 가까운 정치 성향은 "${result}"입니다!`,
          url: window.location.href
        });
      } catch (err) {
        console.log('공유 실패:', err);
      }
    } else {
      // 클립보드에 복사
      const text = `정책 MBTI 테스트 결과: ${result}\n${window.location.href}`;
      navigator.clipboard.writeText(text);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setCurrentQuestion(1);
    setResult(null);
    setScores([]);
    setIsAnimating(false);
  };

  // 시작 화면
  if (currentQuestion === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🗳️</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              정책 MBTI
            </h1>
            <p className="text-gray-600">
              10가지 질문으로 알아보는<br/>
              나와 가장 가까운 정치 성향
            </p>
          </div>
          
          <div className="space-y-4 text-sm text-gray-500 mb-8">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>총 10문항, 약 2분 소요</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>익명으로 진행됩니다</span>
            </div>
          </div>

          <button
            onClick={() => setCurrentQuestion(1)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            테스트 시작하기
          </button>
        </div>
      </div>
    );
  }

  // 결과 화면
  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center border border-white/20">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🎯</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">테스트 완료!</h2>
            <p className="text-gray-600">당신과 가장 가까운 정치 성향은</p>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              {result}
            </h1>
            
            {/* 점수 시각화 */}
            <div className="space-y-3">
              {candidateNames.map((name, index) => (
                <div key={index} className="text-left">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={name === result ? 'font-semibold text-purple-600' : 'text-gray-600'}>
                      {name}
                    </span>
                    <span className={name === result ? 'font-semibold text-purple-600' : 'text-gray-500'}>
                      {scores[index]}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                        name === result 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                          : 'bg-gray-300'
                      }`}
                      style={{ width: `${scores[index]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              공유하기
            </button>
            <button
              onClick={resetQuiz}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              다시하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 질문 화면
  const q = questions[currentQuestion - 1];
  const progress = (currentQuestion / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-xl w-full border border-white/20 transition-all duration-300 ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
        {/* 프로그레스 바 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>질문 {currentQuestion}</span>
            <span>{questions.length}개 중</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 질문 */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 leading-relaxed">
            {q.text}
          </h2>
        </div>

        {/* 선택지 */}
        <div className="space-y-4">
          <button
            onClick={() => handleAnswer('A')}
            disabled={isAnimating}
            className="w-full p-6 bg-white border-2 border-purple-200 rounded-2xl text-left hover:border-purple-400 hover:bg-purple-50 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md disabled:hover:scale-100 disabled:hover:bg-white"
          >
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full border-2 border-purple-300 flex items-center justify-center mt-1 flex-shrink-0">
                <span className="text-purple-600 font-semibold text-sm">A</span>
              </div>
              <span className="text-gray-700 leading-relaxed">{q.options.A}</span>
            </div>
          </button>
          
          <button
            onClick={() => handleAnswer('B')}
            disabled={isAnimating}
            className="w-full p-6 bg-white border-2 border-pink-200 rounded-2xl text-left hover:border-pink-400 hover:bg-pink-50 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md disabled:hover:scale-100 disabled:hover:bg-white"
          >
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full border-2 border-pink-300 flex items-center justify-center mt-1 flex-shrink-0">
                <span className="text-pink-600 font-semibold text-sm">B</span>
              </div>
              <span className="text-gray-700 leading-relaxed">{q.options.B}</span>
            </div>
          </button>
        </div>

        {/* 뒤로가기 버튼 */}
        {currentQuestion > 1 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors duration-200"
            >
              ← 이전 질문으로
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MBTIQuiz;
