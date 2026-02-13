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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { 
  BookOpen, Plus, ArrowLeft, Save, Trash2, Upload, FileText, 
  Video, HelpCircle, GripVertical, Edit, Clock, Calendar,
  FileSpreadsheet, Download, Image, X
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

const CourseEditor = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const isNew = courseId === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [lecturers, setLecturers] = useState([]);
  const [course, setCourse] = useState({
    code: "",
    title: "",
    description: "",
    department: "Public Health",
    level: 100,
    units: 2,
    semester: 1,
    course_type: "CORE",
    lecturer_id: "",
    image_url: "",
    duration_weeks: 12,
    duration_type: "weeks",
    modules: []
  });
  
  const [moduleDialog, setModuleDialog] = useState(false);
  const [lessonDialog, setLessonDialog] = useState(false);
  const [quizDialog, setQuizDialog] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  
  const [newModule, setNewModule] = useState({ title: "", description: "" });
  const [newLesson, setNewLesson] = useState({ title: "", type: "video", content_url: "", description: "" });
  const [quizQuestions, setQuizQuestions] = useState([]);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const lecturersRes = await axios.get(`${API}/users?role=lecturer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLecturers(lecturersRes.data);
      
      if (!isNew) {
        const courseRes = await axios.get(`${API}/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourse(courseRes.data);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCourse = async () => {
    setSaving(true);
    try {
      const courseData = {
        code: course.code,
        title: course.title,
        description: course.description,
        department: course.department,
        level: course.level,
        units: course.units,
        semester: course.semester,
        course_type: course.course_type,
        lecturer_id: course.lecturer_id,
        image_url: course.image_url,
        duration_weeks: course.duration_weeks,
        duration_type: course.duration_type
      };
      
      if (isNew) {
        const res = await axios.post(`${API}/courses`, courseData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Course created successfully");
        navigate(`/admin/courses/${res.data.id}/edit`);
      } else {
        await axios.put(`${API}/courses/${courseId}`, courseData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Course updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const handleAddModule = async () => {
    if (!newModule.title) {
      toast.error("Module title is required");
      return;
    }
    
    try {
      const res = await axios.post(`${API}/courses/${courseId}/modules`, {
        title: newModule.title,
        description: newModule.description,
        order: (course.modules?.length || 0) + 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCourse({
        ...course,
        modules: [...(course.modules || []), res.data]
      });
      setNewModule({ title: "", description: "" });
      setModuleDialog(false);
      toast.success("Module added");
    } catch (error) {
      toast.error("Failed to add module");
    }
  };

  const handleAddLesson = async () => {
    if (!newLesson.title || !selectedModule) {
      toast.error("Lesson title is required");
      return;
    }
    
    try {
      const res = await axios.post(`${API}/modules/${selectedModule.id}/lessons`, {
        title: newLesson.title,
        type: newLesson.type,
        content_url: newLesson.content_url,
        description: newLesson.description,
        order: (selectedModule.lessons?.length || 0) + 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      const updatedModules = course.modules.map(m => {
        if (m.id === selectedModule.id) {
          return {
            ...m,
            lessons: [...(m.lessons || []), res.data]
          };
        }
        return m;
      });
      
      setCourse({ ...course, modules: updatedModules });
      setNewLesson({ title: "", type: "video", content_url: "", description: "" });
      setLessonDialog(false);
      toast.success("Lesson added");
    } catch (error) {
      toast.error("Failed to add lesson");
    }
  };

  const handleQuizUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      
      // Expected format: Question, Option A, Option B, Option C, Option D, Correct Answer
      const questions = jsonData.map((row, idx) => ({
        id: idx + 1,
        question: row.Question || row.question || '',
        options: [
          row['Option A'] || row.option_a || '',
          row['Option B'] || row.option_b || '',
          row['Option C'] || row.option_c || '',
          row['Option D'] || row.option_d || ''
        ].filter(Boolean),
        correct_answer: row['Correct Answer'] || row.correct_answer || row.Answer || ''
      }));
      
      setQuizQuestions(questions);
      toast.success(`Loaded ${questions.length} questions from Excel`);
    };
    reader.readAsBinaryString(file);
  };

  const handleSaveQuiz = async () => {
    if (quizQuestions.length === 0 || !selectedModule) {
      toast.error("No questions to save");
      return;
    }
    
    try {
      await axios.post(`${API}/modules/${selectedModule.id}/quiz`, {
        questions: quizQuestions,
        attempts_allowed: 3,
        passing_score: 70
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Quiz saved successfully");
      setQuizDialog(false);
      setQuizQuestions([]);
    } catch (error) {
      toast.error("Failed to save quiz");
    }
  };

  const downloadQuizTemplate = () => {
    const templateData = [
      {
        'Question': 'What is the capital of France?',
        'Option A': 'London',
        'Option B': 'Paris',
        'Option C': 'Berlin',
        'Option D': 'Madrid',
        'Correct Answer': 'B'
      },
      {
        'Question': 'Which planet is closest to the sun?',
        'Option A': 'Venus',
        'Option B': 'Earth',
        'Option C': 'Mercury',
        'Option D': 'Mars',
        'Correct Answer': 'C'
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Quiz Questions');
    XLSX.writeFile(wb, 'quiz_template.xlsx');
    toast.success("Template downloaded");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="course-editor">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isNew ? 'Create New Course' : 'Edit Course'}
            </h2>
            <p className="text-sm text-gray-500">
              {isNew ? 'Set up your course details and content' : course.title}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleSaveCourse} 
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700"
          data-testid="save-course-btn"
        >
          <Save size={18} className="mr-2" />
          {saving ? 'Saving...' : 'Save Course'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Course Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen size={20} className="text-emerald-600" />
                Course Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Course Code *</Label>
                  <Input
                    value={course.code}
                    onChange={(e) => setCourse({...course, code: e.target.value})}
                    placeholder="PHS301"
                    data-testid="edit-course-code"
                  />
                </div>
                <div>
                  <Label>Units</Label>
                  <Input
                    type="number"
                    value={course.units}
                    onChange={(e) => setCourse({...course, units: parseInt(e.target.value) || 2})}
                    min="1"
                    max="6"
                  />
                </div>
              </div>
              
              <div>
                <Label>Course Title *</Label>
                <Input
                  value={course.title}
                  onChange={(e) => setCourse({...course, title: e.target.value})}
                  placeholder="Introduction to Public Health"
                  data-testid="edit-course-title"
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={course.description}
                  onChange={(e) => setCourse({...course, description: e.target.value})}
                  placeholder="Describe what students will learn..."
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <Input
                    value={course.department}
                    onChange={(e) => setCourse({...course, department: e.target.value})}
                    placeholder="Public Health"
                  />
                </div>
                <div>
                  <Label>Assigned Lecturer</Label>
                  <Select 
                    value={course.lecturer_id || "unassigned"} 
                    onValueChange={(value) => setCourse({...course, lecturer_id: value === "unassigned" ? "" : value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select lecturer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {lecturers.map(l => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.first_name} {l.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Duration Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} className="text-blue-600" />
                Duration Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration</Label>
                  <Input
                    type="number"
                    value={course.duration_weeks || 12}
                    onChange={(e) => setCourse({...course, duration_weeks: parseInt(e.target.value) || 12})}
                    min="1"
                  />
                </div>
                <div>
                  <Label>Duration Type</Label>
                  <Select 
                    value={course.duration_type || "weeks"} 
                    onValueChange={(value) => setCourse({...course, duration_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="years">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules & Content */}
          {!isNew && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText size={20} className="text-purple-600" />
                  Course Content
                </CardTitle>
                <Button 
                  size="sm" 
                  onClick={() => setModuleDialog(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus size={16} className="mr-1" /> Add Module
                </Button>
              </CardHeader>
              <CardContent>
                {course.modules?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen size={40} className="mx-auto mb-2 opacity-50" />
                    <p>No modules yet. Add your first module to get started.</p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {course.modules?.map((module, idx) => (
                      <AccordionItem key={module.id} value={module.id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                              {idx + 1}
                            </span>
                            <span className="font-medium">{module.title}</span>
                            <span className="text-xs text-gray-400">
                              {module.lessons?.length || 0} lessons
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-11 space-y-3">
                            {module.lessons?.map((lesson, lidx) => (
                              <div key={lesson.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                {lesson.type === 'video' && <Video size={16} className="text-blue-500" />}
                                {lesson.type === 'pdf' && <FileText size={16} className="text-red-500" />}
                                {lesson.type === 'quiz' && <HelpCircle size={16} className="text-green-500" />}
                                <span className="text-sm">{lesson.title}</span>
                              </div>
                            ))}
                            
                            <div className="flex gap-2 pt-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedModule(module);
                                  setLessonDialog(true);
                                }}
                              >
                                <Plus size={14} className="mr-1" /> Add Lesson
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedModule(module);
                                  setQuizDialog(true);
                                }}
                              >
                                <FileSpreadsheet size={14} className="mr-1" /> Upload Quiz
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Course Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Level</Label>
                <Select 
                  value={String(course.level)} 
                  onValueChange={(value) => setCourse({...course, level: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100 Level</SelectItem>
                    <SelectItem value="200">200 Level</SelectItem>
                    <SelectItem value="300">300 Level</SelectItem>
                    <SelectItem value="400">400 Level</SelectItem>
                    <SelectItem value="500">500 Level (Masters)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Semester</Label>
                <Select 
                  value={String(course.semester)} 
                  onValueChange={(value) => setCourse({...course, semester: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First Semester</SelectItem>
                    <SelectItem value="2">Second Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Course Type</Label>
                <Select 
                  value={course.course_type} 
                  onValueChange={(value) => setCourse({...course, course_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CORE">Core</SelectItem>
                    <SelectItem value="ELECTIVE">Elective</SelectItem>
                    <SelectItem value="REQUIRED">Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Cover Image URL</Label>
                <Input
                  value={course.image_url}
                  onChange={(e) => setCourse({...course, image_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Course Preview Card */}
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-800">Course Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Code:</span> {course.code || '-'}</p>
                <p><span className="font-medium">Title:</span> {course.title || '-'}</p>
                <p><span className="font-medium">Duration:</span> {course.duration_weeks || 12} {course.duration_type || 'weeks'}</p>
                <p><span className="font-medium">Modules:</span> {course.modules?.length || 0}</p>
                <p><span className="font-medium">Application Fee:</span> €50</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Module Dialog */}
      <Dialog open={moduleDialog} onOpenChange={setModuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Module</DialogTitle>
            <DialogDescription>Create a new module for this course</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Module Title *</Label>
              <Input
                value={newModule.title}
                onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                placeholder="e.g., Introduction to the Course"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newModule.description}
                onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                placeholder="What students will learn in this module..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialog(false)}>Cancel</Button>
            <Button onClick={handleAddModule} className="bg-purple-600 hover:bg-purple-700">
              Add Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Dialog */}
      <Dialog open={lessonDialog} onOpenChange={setLessonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lesson to {selectedModule?.title}</DialogTitle>
            <DialogDescription>Add a video, PDF, or other content</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Lesson Title *</Label>
              <Input
                value={newLesson.title}
                onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                placeholder="e.g., Introduction Video"
              />
            </div>
            <div>
              <Label>Content Type</Label>
              <Select 
                value={newLesson.type} 
                onValueChange={(value) => setNewLesson({...newLesson, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="text">Text Content</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Content URL</Label>
              <Input
                value={newLesson.content_url}
                onChange={(e) => setNewLesson({...newLesson, content_url: e.target.value})}
                placeholder="https://... (YouTube, PDF link, etc.)"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newLesson.description}
                onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                placeholder="Brief description of this lesson..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialog(false)}>Cancel</Button>
            <Button onClick={handleAddLesson} className="bg-blue-600 hover:bg-blue-700">
              Add Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quiz Upload Dialog */}
      <Dialog open={quizDialog} onOpenChange={setQuizDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Quiz for {selectedModule?.title}</DialogTitle>
            <DialogDescription>
              Upload an Excel file with quiz questions or download our template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-4">
              <Button variant="outline" onClick={downloadQuizTemplate}>
                <Download size={16} className="mr-2" /> Download Template
              </Button>
              <label className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>
                    <Upload size={16} className="mr-2" /> Upload Excel
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleQuizUpload}
                      className="hidden"
                    />
                  </span>
                </Button>
              </label>
            </div>
            
            {quizQuestions.length > 0 && (
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                <p className="font-medium mb-2">{quizQuestions.length} questions loaded:</p>
                {quizQuestions.map((q, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 rounded mb-2">
                    <p className="font-medium text-sm">{idx + 1}. {q.question}</p>
                    <p className="text-xs text-gray-500">
                      Options: {q.options.join(', ')} | Answer: {q.correct_answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setQuizDialog(false);
              setQuizQuestions([]);
            }}>Cancel</Button>
            <Button 
              onClick={handleSaveQuiz} 
              disabled={quizQuestions.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              Save Quiz ({quizQuestions.length} questions)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseEditor;
