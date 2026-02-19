import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth, API } from "../../App";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Play,
  FileText,
  HelpCircle,
  BookOpen,
  Save,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

const CourseBuilder = () => {
  const { courseId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  
  const [moduleDialog, setModuleDialog] = useState({ open: false, editId: null });
  const [moduleForm, setModuleForm] = useState({ title: "", description: "", order: 0 });
  
  const [lessonDialog, setLessonDialog] = useState({ open: false, moduleId: null, editId: null });
  const [lessonForm, setLessonForm] = useState({
    title: "",
    content_type: "video",
    url: "",
    description: "",
    order: 0,
    quiz_attempts_allowed: 3,
    quiz_passing_score: 60,
    quiz_data: { questions: [] }
  });

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`${API}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourse(response.data);
      setModules(response.data.modules || []);
      
      // Expand all modules by default
      const expanded = {};
      (response.data.modules || []).forEach(m => { expanded[m.id] = true; });
      setExpandedModules(expanded);
    } catch (error) {
      toast.error("Failed to load course");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const openModuleDialog = (module = null) => {
    if (module) {
      setModuleForm({ title: module.title, description: module.description || "", order: module.order });
      setModuleDialog({ open: true, editId: module.id });
    } else {
      setModuleForm({ title: "", description: "", order: modules.length });
      setModuleDialog({ open: true, editId: null });
    }
  };

  const saveModule = async () => {
    setSaving(true);
    try {
      if (moduleDialog.editId) {
        await axios.put(`${API}/modules/${moduleDialog.editId}`, moduleForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Module updated");
      } else {
        await axios.post(`${API}/courses/${courseId}/modules`, moduleForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Module created");
      }
      setModuleDialog({ open: false, editId: null });
      fetchCourse();
    } catch (error) {
      toast.error("Failed to save module");
    } finally {
      setSaving(false);
    }
  };

  const deleteModule = async (moduleId) => {
    if (!window.confirm("Delete this module and all its lessons?")) return;
    
    try {
      await axios.delete(`${API}/modules/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Module deleted");
      fetchCourse();
    } catch (error) {
      toast.error("Failed to delete module");
    }
  };

  const openLessonDialog = (moduleId, lesson = null) => {
    if (lesson) {
      setLessonForm({
        title: lesson.title,
        content_type: lesson.content_type,
        url: lesson.url || "",
        description: lesson.description || "",
        order: lesson.order
      });
      setLessonDialog({ open: true, moduleId, editId: lesson.id });
    } else {
      const module = modules.find(m => m.id === moduleId);
      const lessonCount = module?.lessons?.length || 0;
      setLessonForm({
        title: "",
        content_type: "video",
        url: "",
        description: "",
        order: lessonCount
      });
      setLessonDialog({ open: true, moduleId, editId: null });
    }
  };

  const saveLesson = async () => {
    setSaving(true);
    try {
      const module = modules.find(m => m.id === lessonDialog.moduleId);
      if (!module) return;
      
      let updatedLessons = [...(module.lessons || [])];
      
      if (lessonDialog.editId) {
        updatedLessons = updatedLessons.map(l => 
          l.id === lessonDialog.editId ? { ...l, ...lessonForm } : l
        );
      } else {
        updatedLessons.push({ ...lessonForm, id: `temp-${Date.now()}` });
      }
      
      await axios.put(`${API}/modules/${lessonDialog.moduleId}`, {
        title: module.title,
        description: module.description,
        order: module.order,
        lessons: updatedLessons
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(lessonDialog.editId ? "Lesson updated" : "Lesson added");
      setLessonDialog({ open: false, moduleId: null, editId: null });
      fetchCourse();
    } catch (error) {
      toast.error("Failed to save lesson");
    } finally {
      setSaving(false);
    }
  };

  const deleteLesson = async (moduleId, lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;
    
    try {
      const module = modules.find(m => m.id === moduleId);
      if (!module) return;
      
      const updatedLessons = module.lessons.filter(l => l.id !== lessonId);
      
      await axios.put(`${API}/modules/${moduleId}`, {
        title: module.title,
        description: module.description,
        order: module.order,
        lessons: updatedLessons
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Lesson deleted");
      fetchCourse();
    } catch (error) {
      toast.error("Failed to delete lesson");
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <Play size={16} className="text-blue-500" />;
      case 'pdf': return <FileText size={16} className="text-red-500" />;
      case 'quiz': return <HelpCircle size={16} className="text-purple-500" />;
      case 'reading': return <BookOpen size={16} className="text-emerald-500" />;
      default: return <FileText size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="course-builder">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} className="mr-2" />
              Back
            </Button>
            <div>
              <h1 className="font-heading font-bold text-lg text-slate-900">{course?.title}</h1>
              <p className="text-sm text-slate-500">{course?.code} • Course Builder</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">
              {modules.length} modules • {modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)} lessons
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-8">
        <div className="space-y-4">
          {modules.map((module, moduleIdx) => (
            <Card key={module.id} className="bg-white border border-slate-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => toggleModule(module.id)}
                    className="flex items-center gap-3 text-left"
                  >
                    {expandedModules[module.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <div>
                      <CardTitle className="text-base font-heading">{module.title}</CardTitle>
                      <p className="text-sm text-slate-500">{module.lessons?.length || 0} lessons</p>
                    </div>
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openModuleDialog(module)}>
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-600"
                      onClick={() => deleteModule(module.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {expandedModules[module.id] && (
                <CardContent className="pt-2">
                  <div className="space-y-2">
                    {module.lessons?.map((lesson, lessonIdx) => (
                      <div 
                        key={lesson.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg group"
                      >
                        <GripVertical size={16} className="text-slate-300" />
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                          {getLessonIcon(lesson.content_type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 text-sm">{lesson.title}</p>
                          <p className="text-xs text-slate-500 capitalize">{lesson.content_type}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openLessonDialog(module.id, lesson)}>
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-600"
                            onClick={() => deleteLesson(module.id, lesson.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="mt-4 w-full border-dashed"
                    onClick={() => openLessonDialog(module.id)}
                    data-testid={`add-lesson-btn-${module.id}`}
                  >
                    <Plus size={16} className="mr-2" />
                    Add Lesson
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
          
          <Button 
            className="w-full bg-uni-navy hover:bg-uni-navy-light"
            onClick={() => openModuleDialog()}
            data-testid="add-module-btn"
          >
            <Plus size={18} className="mr-2" />
            Add Module
          </Button>
        </div>
      </div>

      {/* Module Dialog */}
      <Dialog open={moduleDialog.open} onOpenChange={(open) => setModuleDialog({ open, editId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{moduleDialog.editId ? 'Edit Module' : 'Add Module'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Module Title</Label>
              <Input
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="Week 1: Introduction"
                data-testid="module-title-input"
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="What students will learn..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialog({ open: false, editId: null })}>
              Cancel
            </Button>
            <Button onClick={saveModule} disabled={saving} className="bg-uni-navy hover:bg-uni-navy-light">
              {saving ? <div className="spinner w-4 h-4 mr-2"></div> : <Save size={16} className="mr-2" />}
              Save Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialog.open} onOpenChange={(open) => setLessonDialog({ open, moduleId: null, editId: null })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{lessonDialog.editId ? 'Edit Lesson' : 'Add Lesson'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Lesson Title</Label>
              <Input
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="Introduction to the topic"
                data-testid="lesson-title-input"
              />
            </div>
            <div>
              <Label>Content Type</Label>
              <Select 
                value={lessonForm.content_type} 
                onValueChange={(v) => setLessonForm({ ...lessonForm, content_type: v })}
              >
                <SelectTrigger data-testid="content-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(lessonForm.content_type === 'video' || lessonForm.content_type === 'pdf') && (
              <div>
                <Label>URL</Label>
                <Input
                  value={lessonForm.url}
                  onChange={(e) => setLessonForm({ ...lessonForm, url: e.target.value })}
                  placeholder="https://..."
                  data-testid="lesson-url-input"
                />
              </div>
            )}
            
            {/* Quiz Configuration */}
            {lessonForm.content_type === 'quiz' && (
              <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900">Quiz Settings</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Attempts Allowed</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={lessonForm.quiz_attempts_allowed || 3}
                      onChange={(e) => setLessonForm({ ...lessonForm, quiz_attempts_allowed: parseInt(e.target.value) })}
                      data-testid="quiz-attempts-input"
                    />
                  </div>
                  <div>
                    <Label>Passing Score (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={lessonForm.quiz_passing_score || 60}
                      onChange={(e) => setLessonForm({ ...lessonForm, quiz_passing_score: parseFloat(e.target.value) })}
                      data-testid="quiz-passing-score-input"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Questions ({(lessonForm.quiz_data?.questions || []).length})</Label>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const questions = lessonForm.quiz_data?.questions || [];
                        setLessonForm({
                          ...lessonForm,
                          quiz_data: {
                            ...lessonForm.quiz_data,
                            questions: [...questions, { q: '', options: ['', '', '', ''], answer: 0 }]
                          }
                        });
                      }}
                    >
                      <Plus size={14} className="mr-1" />
                      Add Question
                    </Button>
                  </div>
                  
                  {(lessonForm.quiz_data?.questions || []).map((question, qIdx) => (
                    <div key={qIdx} className="border rounded-lg p-3 bg-white space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">Question {qIdx + 1}</Label>
                          <Input
                            value={question.q}
                            onChange={(e) => {
                              const questions = [...(lessonForm.quiz_data?.questions || [])];
                              questions[qIdx] = { ...questions[qIdx], q: e.target.value };
                              setLessonForm({
                                ...lessonForm,
                                quiz_data: { ...lessonForm.quiz_data, questions }
                              });
                            }}
                            placeholder="Enter your question..."
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 mt-5"
                          onClick={() => {
                            const questions = [...(lessonForm.quiz_data?.questions || [])];
                            questions.splice(qIdx, 1);
                            setLessonForm({
                              ...lessonForm,
                              quiz_data: { ...lessonForm.quiz_data, questions }
                            });
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {(question.options || ['', '', '', '']).map((option, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={question.answer === oIdx}
                              onChange={() => {
                                const questions = [...(lessonForm.quiz_data?.questions || [])];
                                questions[qIdx] = { ...questions[qIdx], answer: oIdx };
                                setLessonForm({
                                  ...lessonForm,
                                  quiz_data: { ...lessonForm.quiz_data, questions }
                                });
                              }}
                              className="text-emerald-600"
                            />
                            <Input
                              value={option}
                              onChange={(e) => {
                                const questions = [...(lessonForm.quiz_data?.questions || [])];
                                const options = [...(questions[qIdx].options || ['', '', '', ''])];
                                options[oIdx] = e.target.value;
                                questions[qIdx] = { ...questions[qIdx], options };
                                setLessonForm({
                                  ...lessonForm,
                                  quiz_data: { ...lessonForm.quiz_data, questions }
                                });
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                              className="text-sm"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">Select the radio button next to the correct answer</p>
                    </div>
                  ))}
                  
                  {(lessonForm.quiz_data?.questions || []).length === 0 && (
                    <p className="text-center text-slate-500 py-4 text-sm">No questions added yet. Click "Add Question" to start.</p>
                  )}
                </div>
              </div>
            )}
            
            <div>
              <Label>Description (optional)</Label>
              <Textarea
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="Brief description of this lesson..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialog({ open: false, moduleId: null, editId: null })}>
              Cancel
            </Button>
            <Button onClick={saveLesson} disabled={saving} className="bg-uni-navy hover:bg-uni-navy-light">
              {saving ? <div className="spinner w-4 h-4 mr-2"></div> : <Save size={16} className="mr-2" />}
              Save Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseBuilder;
