import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth, API } from "../../App";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  FileText,
  HelpCircle,
  BookOpen,
  Check,
  Lock,
  Award,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const CoursePlayer = () => {
  const { enrollmentId } = useParams();
  const { token, accessInfo } = useAuth();
  const navigate = useNavigate();
  
  const [enrollment, setEnrollment] = useState(null);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  useEffect(() => {
    // Check payment status
    if (accessInfo?.reason === "unpaid") {
      toast.error("Please complete your payment to access course content");
      navigate("/billing");
      return;
    }
    fetchEnrollment();
  }, [enrollmentId, accessInfo]);

  const fetchEnrollment = async () => {
    try {
      const response = await axios.get(`${API}/enrollments/${enrollmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrollment(response.data);
      setCourse(response.data.course);
      setModules(response.data.course?.modules || []);
      
      // Set initial lesson
      if (response.data.course?.modules?.length > 0) {
        const firstModule = response.data.course.modules[0];
        if (firstModule.lessons?.length > 0) {
          setCurrentLesson(firstModule.lessons[0]);
        }
      }
    } catch (error) {
      toast.error("Failed to load course");
      navigate("/student/courses");
    } finally {
      setLoading(false);
    }
  };

  const isLessonCompleted = (lessonId) => {
    return enrollment?.completed_lessons?.includes(lessonId);
  };

  const isLessonUnlocked = (moduleIdx, lessonIdx) => {
    // First lesson is always unlocked
    if (moduleIdx === 0 && lessonIdx === 0) return true;
    
    // Check if previous lesson is completed
    if (lessonIdx > 0) {
      const prevLesson = modules[moduleIdx]?.lessons?.[lessonIdx - 1];
      return prevLesson && isLessonCompleted(prevLesson.id);
    }
    
    // Check if last lesson of previous module is completed
    if (moduleIdx > 0) {
      const prevModule = modules[moduleIdx - 1];
      const lastLesson = prevModule?.lessons?.[prevModule.lessons.length - 1];
      return lastLesson && isLessonCompleted(lastLesson.id);
    }
    
    return false;
  };

  const completeLesson = async () => {
    if (!currentLesson || isLessonCompleted(currentLesson.id)) return;
    
    setCompleting(true);
    try {
      const response = await axios.post(
        `${API}/enrollments/${enrollmentId}/complete-lesson?lesson_id=${currentLesson.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update enrollment state
      setEnrollment(prev => ({
        ...prev,
        completed_lessons: response.data.completed_lessons,
        progress: response.data.progress
      }));
      
      // Check if course completed
      if (response.data.is_complete) {
        triggerCelebration();
      } else {
        toast.success("Lesson completed!");
        // Auto advance to next lesson
        goToNextLesson();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to complete lesson");
    } finally {
      setCompleting(false);
    }
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    
    // Fire confetti
    const duration = 3000;
    const end = Date.now() + duration;
    
    const colors = ['#0F172A', '#D32F2F', '#10B981', '#F59E0B'];
    
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const goToNextLesson = () => {
    const currentModule = modules[currentModuleIndex];
    if (currentLessonIndex < currentModule?.lessons?.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      setCurrentLesson(currentModule.lessons[currentLessonIndex + 1]);
    } else if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLessonIndex(0);
      setCurrentLesson(modules[currentModuleIndex + 1]?.lessons?.[0]);
    }
  };

  const goToPrevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      setCurrentLesson(modules[currentModuleIndex]?.lessons?.[currentLessonIndex - 1]);
    } else if (currentModuleIndex > 0) {
      const prevModule = modules[currentModuleIndex - 1];
      setCurrentModuleIndex(currentModuleIndex - 1);
      setCurrentLessonIndex(prevModule.lessons.length - 1);
      setCurrentLesson(prevModule.lessons[prevModule.lessons.length - 1]);
    }
  };

  const selectLesson = (moduleIdx, lessonIdx) => {
    if (!isLessonUnlocked(moduleIdx, lessonIdx)) {
      toast.error("Complete previous lessons to unlock this one");
      return;
    }
    setCurrentModuleIndex(moduleIdx);
    setCurrentLessonIndex(lessonIdx);
    setCurrentLesson(modules[moduleIdx]?.lessons?.[lessonIdx]);
  };

  const downloadCertificate = async () => {
    try {
      const response = await axios.get(`${API}/certificates/${enrollmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${course?.code || 'course'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Certificate downloaded!");
    } catch (error) {
      toast.error("Failed to download certificate");
    }
  };

  // Quiz functions
  const handleQuizSubmit = async () => {
    if (!currentLesson?.quiz_data?.questions) return;
    
    const questions = currentLesson.quiz_data.questions;
    const answeredCount = Object.keys(quizAnswers).length;
    
    if (answeredCount < questions.length) {
      toast.error("Please answer all questions before submitting");
      return;
    }
    
    setSubmittingQuiz(true);
    
    // Calculate score locally
    let correct = 0;
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answer) {
        correct++;
      }
    });
    
    const score = (correct / questions.length) * 100;
    const passingScore = currentLesson.quiz_passing_score || 60;
    const passed = score >= passingScore;
    
    setQuizResult({
      score,
      correct,
      total: questions.length,
      passed,
      passingScore
    });
    setQuizSubmitted(true);
    setSubmittingQuiz(false);
    
    if (passed) {
      toast.success(`Quiz passed! Score: ${score.toFixed(0)}%`);
      // Auto-complete if passed
      await completeLesson();
    } else {
      toast.error(`Quiz failed. Score: ${score.toFixed(0)}%. You need ${passingScore}% to pass.`);
    }
  };
  
  const handleQuizRetry = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
  };
  
  // Reset quiz state when lesson changes
  useEffect(() => {
    if (currentLesson?.content_type === 'quiz') {
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizResult(null);
    }
  }, [currentLesson?.id]);

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <Play size={16} />;
      case 'pdf': return <FileText size={16} />;
      case 'quiz': return <HelpCircle size={16} />;
      case 'reading': return <BookOpen size={16} />;
      default: return <FileText size={16} />;
    }
  };

  // Quiz Component
  const QuizComponent = ({ lesson, quizAnswers, setQuizAnswers, quizSubmitted, quizResult, submittingQuiz, onSubmit, onRetry, isCompleted }) => {
    const questions = lesson?.quiz_data?.questions || [];
    
    if (questions.length === 0) {
      return (
        <div className="text-center py-12">
          <HelpCircle size={48} className="mx-auto mb-4 text-slate-400" />
          <p className="text-slate-300 mb-4">No questions available for this quiz</p>
        </div>
      );
    }
    
    // Show result screen
    if (quizSubmitted && quizResult) {
      return (
        <div className="space-y-6" data-testid="quiz-result">
          <div className={`p-6 rounded-lg text-center ${quizResult.passed ? 'bg-emerald-900/30' : 'bg-red-900/30'}`}>
            {quizResult.passed ? (
              <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-400" />
            ) : (
              <XCircle size={48} className="mx-auto mb-4 text-red-400" />
            )}
            <h3 className="text-xl font-bold text-white mb-2">
              {quizResult.passed ? 'Quiz Passed!' : 'Quiz Failed'}
            </h3>
            <p className="text-slate-300">
              You scored <strong>{quizResult.score.toFixed(0)}%</strong> ({quizResult.correct}/{quizResult.total} correct)
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Passing score: {quizResult.passingScore}%
            </p>
          </div>
          
          {/* Show answers review */}
          <div className="space-y-4">
            {questions.map((q, qIdx) => {
              const userAnswer = quizAnswers[qIdx];
              const isCorrect = userAnswer === q.answer;
              
              return (
                <div key={qIdx} className={`p-4 rounded-lg border ${isCorrect ? 'border-emerald-600 bg-emerald-900/20' : 'border-red-600 bg-red-900/20'}`}>
                  <div className="flex items-start gap-2 mb-3">
                    {isCorrect ? (
                      <CheckCircle2 size={18} className="text-emerald-400 mt-1" />
                    ) : (
                      <XCircle size={18} className="text-red-400 mt-1" />
                    )}
                    <p className="text-white font-medium">{q.q}</p>
                  </div>
                  <div className="pl-6 space-y-1">
                    {(q.options || []).map((opt, oIdx) => (
                      <p key={oIdx} className={`text-sm ${
                        oIdx === q.answer ? 'text-emerald-400 font-medium' : 
                        oIdx === userAnswer && !isCorrect ? 'text-red-400 line-through' : 
                        'text-slate-400'
                      }`}>
                        {String.fromCharCode(65 + oIdx)}. {opt}
                        {oIdx === q.answer && ' ✓'}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          
          {!quizResult.passed && !isCompleted && (
            <Button onClick={onRetry} className="w-full bg-blue-600 hover:bg-blue-700" data-testid="retry-quiz-btn">
              Try Again
            </Button>
          )}
        </div>
      );
    }
    
    // Show quiz questions
    return (
      <div className="space-y-6" data-testid="quiz-questions">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium">Assessment</h3>
            <p className="text-slate-400 text-sm">
              {questions.length} questions • Passing score: {lesson.quiz_passing_score || 60}%
            </p>
          </div>
          {lesson.quiz_attempts_allowed && (
            <span className="text-slate-400 text-sm">
              Attempts: {lesson.quiz_attempts_allowed}
            </span>
          )}
        </div>
        
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="p-4 bg-slate-700/50 rounded-lg space-y-3">
            <p className="text-white font-medium">
              {qIdx + 1}. {q.q}
            </p>
            <RadioGroup 
              value={String(quizAnswers[qIdx] ?? '')} 
              onValueChange={(value) => setQuizAnswers({...quizAnswers, [qIdx]: parseInt(value)})}
            >
              {(q.options || []).map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center space-x-3 p-2 rounded hover:bg-slate-600/50">
                  <RadioGroupItem value={String(oIdx)} id={`q${qIdx}-o${oIdx}`} />
                  <Label htmlFor={`q${qIdx}-o${oIdx}`} className="text-slate-300 cursor-pointer flex-1">
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
        
        <Button 
          onClick={onSubmit} 
          disabled={submittingQuiz}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          data-testid="submit-quiz-btn"
        >
          {submittingQuiz ? (
            <div className="spinner w-4 h-4 mr-2"></div>
          ) : (
            <Check size={18} className="mr-2" />
          )}
          Submit Quiz
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="spinner border-white"></div>
      </div>
    );
  }

  // Celebration Modal
  if (showCelebration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4" data-testid="celebration-modal">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="p-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-emerald-600" />
            </div>
            
            <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2">
              Congratulations! 🎉
            </h1>
            
            <p className="text-slate-600 mb-6">
              You have successfully completed <strong>{course?.title}</strong>
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={downloadCertificate}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                data-testid="claim-certificate-btn"
              >
                <Download size={18} className="mr-2" />
                Claim Certificate
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate("/student/courses")}
                className="w-full"
              >
                Back to Courses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex" data-testid="course-player">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Course Header */}
        <div className="p-4 border-b border-slate-700">
          <Button 
            variant="ghost" 
            className="text-slate-400 hover:text-white mb-4 -ml-2"
            onClick={() => navigate("/student/courses")}
          >
            <ChevronLeft size={18} className="mr-1" />
            Back to Courses
          </Button>
          
          <h2 className="font-heading font-bold text-white text-lg mb-2">{course?.title}</h2>
          <p className="text-slate-400 text-sm">{course?.code}</p>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">Progress</span>
              <span className="text-white font-medium">{Math.round(enrollment?.progress || 0)}%</span>
            </div>
            <Progress value={enrollment?.progress || 0} className="h-2" />
          </div>
        </div>
        
        {/* Module List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {modules.map((module, moduleIdx) => (
            <div key={module.id} className="space-y-1">
              <h3 className="text-slate-300 font-medium text-sm px-2 py-1">
                {module.title}
              </h3>
              
              {module.lessons?.map((lesson, lessonIdx) => {
                const completed = isLessonCompleted(lesson.id);
                const unlocked = isLessonUnlocked(moduleIdx, lessonIdx);
                const isActive = currentLesson?.id === lesson.id;
                
                return (
                  <button
                    key={lesson.id}
                    onClick={() => selectLesson(moduleIdx, lessonIdx)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : unlocked 
                          ? 'text-slate-300 hover:bg-slate-700' 
                          : 'text-slate-500 cursor-not-allowed'
                    }`}
                    disabled={!unlocked}
                    data-testid={`lesson-${lesson.id}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      completed 
                        ? 'bg-emerald-500 text-white' 
                        : isActive 
                          ? 'bg-white/20' 
                          : 'bg-slate-700'
                    }`}>
                      {completed ? <Check size={14} /> : !unlocked ? <Lock size={12} /> : getLessonIcon(lesson.content_type)}
                    </div>
                    <span className="text-sm truncate">{lesson.title}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {currentLesson ? (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <span className="text-blue-400 text-sm font-medium">
                  {modules[currentModuleIndex]?.title}
                </span>
                <h1 className="font-heading text-2xl font-bold text-white mt-1">
                  {currentLesson.title}
                </h1>
              </div>
              
              {/* Content based on type */}
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  {currentLesson.content_type === 'video' && (
                    <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
                      {currentLesson.url ? (
                        <iframe
                          src={currentLesson.url.replace('watch?v=', 'embed/')}
                          className="w-full h-full rounded-lg"
                          allowFullScreen
                        />
                      ) : (
                        <div className="text-slate-400 text-center">
                          <Play size={48} className="mx-auto mb-2" />
                          <p>Video content</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {currentLesson.content_type === 'reading' && (
                    <div className="prose prose-invert max-w-none">
                      <div className="text-slate-300 leading-relaxed">
                        {currentLesson.description || "Reading content for this lesson."}
                      </div>
                    </div>
                  )}
                  
                  {currentLesson.content_type === 'pdf' && (
                    <div className="text-center py-12">
                      <FileText size={48} className="mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-300 mb-4">PDF Document</p>
                      {currentLesson.url && (
                        <Button asChild>
                          <a href={currentLesson.url} target="_blank" rel="noopener noreferrer">
                            Open PDF
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {currentLesson.content_type === 'quiz' && (
                    <QuizComponent 
                      lesson={currentLesson}
                      quizAnswers={quizAnswers}
                      setQuizAnswers={setQuizAnswers}
                      quizSubmitted={quizSubmitted}
                      quizResult={quizResult}
                      submittingQuiz={submittingQuiz}
                      onSubmit={handleQuizSubmit}
                      onRetry={handleQuizRetry}
                      isCompleted={isLessonCompleted(currentLesson?.id)}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              Select a lesson to begin
            </div>
          )}
        </div>
        
        {/* Bottom Navigation */}
        <div className="bg-slate-800 border-t border-slate-700 px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={goToPrevLesson}
              disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
              className="text-slate-300 hover:text-white"
            >
              <ChevronLeft size={18} className="mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center gap-4">
              {!isLessonCompleted(currentLesson?.id) && (
                <Button
                  onClick={completeLesson}
                  disabled={completing}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  data-testid="complete-lesson-btn"
                >
                  {completing ? (
                    <div className="spinner w-4 h-4 mr-2"></div>
                  ) : (
                    <Check size={18} className="mr-2" />
                  )}
                  Mark Complete
                </Button>
              )}
              
              {isLessonCompleted(currentLesson?.id) && (
                <span className="text-emerald-400 flex items-center gap-2">
                  <Check size={18} />
                  Completed
                </span>
              )}
            </div>
            
            <Button
              variant="ghost"
              onClick={goToNextLesson}
              disabled={
                currentModuleIndex === modules.length - 1 && 
                currentLessonIndex === (modules[currentModuleIndex]?.lessons?.length - 1)
              }
              className="text-slate-300 hover:text-white"
            >
              Next
              <ChevronRight size={18} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
