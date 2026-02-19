import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, API } from "../../App";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { ClipboardList, Plus, Save } from "lucide-react";
import { toast } from "sonner";

const LecturerGrades = () => {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [gradeForm, setGradeForm] = useState({ score: "", grade_letter: "", grade_point: "" });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const myCourses = response.data.filter(c => c.lecturer_id === user.id);
      setCourses(myCourses);
    } catch (error) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async (courseId) => {
    try {
      const response = await axios.get(`${API}/enrollments?course_id=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrollments(response.data);
    } catch (error) {
      toast.error("Failed to load enrollments");
    }
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourse(courseId);
    fetchEnrollments(courseId);
  };

  const calculateGrade = (score) => {
    if (score >= 70) return { letter: "A", point: 5.0 };
    if (score >= 60) return { letter: "B", point: 4.0 };
    if (score >= 50) return { letter: "C", point: 3.0 };
    if (score >= 45) return { letter: "D", point: 2.0 };
    if (score >= 40) return { letter: "E", point: 1.0 };
    return { letter: "F", point: 0.0 };
  };

  const handleScoreChange = (score) => {
    const numScore = parseFloat(score) || 0;
    const { letter, point } = calculateGrade(numScore);
    setGradeForm({
      score: score,
      grade_letter: letter,
      grade_point: point.toFixed(2)
    });
  };

  const submitGrade = async () => {
    if (!selectedEnrollment || !gradeForm.score) {
      toast.error("Please enter a score");
      return;
    }

    try {
      await axios.post(`${API}/grades`, {
        enrollment_id: selectedEnrollment.id,
        score: parseFloat(gradeForm.score),
        grade_letter: gradeForm.grade_letter,
        grade_point: parseFloat(gradeForm.grade_point)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Grade submitted successfully");
      setGradeDialogOpen(false);
      setGradeForm({ score: "", grade_letter: "", grade_point: "" });
      fetchEnrollments(selectedCourse);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to submit grade");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="lecturer-grades">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-slate-900">Grade Entry</h2>
      </div>

      {/* Course Selection */}
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-6">
          <Label className="text-slate-700 mb-2 block">Select Course</Label>
          <Select onValueChange={handleCourseSelect} data-testid="course-select">
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Choose a course to grade" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.code} - {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Enrollments Table */}
      {selectedCourse && (
        <Card className="bg-white border border-slate-200" data-testid="enrollments-table">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Student Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-uni-navy hover:bg-uni-navy">
                  <TableHead className="text-white font-medium">Student ID</TableHead>
                  <TableHead className="text-white font-medium">Status</TableHead>
                  <TableHead className="text-white font-medium">Enrolled Date</TableHead>
                  <TableHead className="text-white font-medium">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.length > 0 ? (
                  enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium text-slate-900">
                        {enrollment.student_id}
                      </TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          enrollment.status === 'completed' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {enrollment.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        {enrollment.status === 'enrolled' && (
                          <Dialog open={gradeDialogOpen && selectedEnrollment?.id === enrollment.id} onOpenChange={(open) => {
                            setGradeDialogOpen(open);
                            if (open) setSelectedEnrollment(enrollment);
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" className="bg-uni-navy hover:bg-uni-navy-light text-white" data-testid={`grade-btn-${enrollment.id}`}>
                                <Plus size={14} className="mr-1" />
                                Add Grade
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Enter Grade</DialogTitle>
                                <DialogDescription>
                                  Enter the score for this student. Grade letter and point will be calculated automatically.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label>Score (0-100)</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={gradeForm.score}
                                    onChange={(e) => handleScoreChange(e.target.value)}
                                    placeholder="Enter score"
                                    data-testid="score-input"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Grade Letter</Label>
                                    <Input value={gradeForm.grade_letter} disabled className="bg-slate-50" />
                                  </div>
                                  <div>
                                    <Label>Grade Point</Label>
                                    <Input value={gradeForm.grade_point} disabled className="bg-slate-50" />
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setGradeDialogOpen(false)}>Cancel</Button>
                                <Button onClick={submitGrade} className="bg-uni-navy hover:bg-uni-navy-light" data-testid="submit-grade-btn">
                                  <Save size={16} className="mr-2" />
                                  Submit Grade
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        {enrollment.status === 'completed' && (
                          <span className="text-sm text-slate-500">Graded</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                      No students enrolled in this course
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {!selectedCourse && (
        <Card className="bg-white border border-slate-200">
          <CardContent className="p-12 text-center">
            <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">Select a Course</h3>
            <p className="text-slate-500">Choose a course from the dropdown above to view and grade students.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LecturerGrades;
