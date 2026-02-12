import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, API } from "../../App";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { FileText, Download, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const StudentResults = () => {
  const { user, token } = useAuth();
  const [grades, setGrades] = useState([]);
  const [gpaData, setGpaData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const [gradesRes, gpaRes] = await Promise.all([
        axios.get(`${API}/grades`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/results/gpa/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setGrades(gradesRes.data);
      setGpaData(gpaRes.data);
    } catch (error) {
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
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
    <div className="space-y-8" data-testid="student-results">
      {/* GPA Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-slate-200">
          <CardContent className="p-6">
            <p className="text-slate-600 text-sm font-medium mb-2">Cumulative GPA</p>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-heading font-bold text-uni-navy">
                {gpaData?.cgpa?.toFixed(2) || "0.00"}
              </p>
              <span className="text-slate-400 text-sm mb-1">/ 5.00</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
              <TrendingUp size={16} />
              <span>Good Standing</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200">
          <CardContent className="p-6">
            <p className="text-slate-600 text-sm font-medium mb-2">Total Units Completed</p>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-heading font-bold text-uni-red">
                {gpaData?.total_units || 0}
              </p>
              <span className="text-slate-400 text-sm mb-1">units</span>
            </div>
            <div className="mt-2 text-sm text-slate-500">
              {gpaData?.total_courses || 0} courses completed
            </div>
          </CardContent>
        </Card>

        <Card className="stats-navy">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-2">Academic Record</p>
              <p className="text-white font-heading font-semibold">Request Transcript</p>
            </div>
            <Button variant="secondary" className="bg-white text-uni-navy hover:bg-slate-100" data-testid="request-transcript-btn">
              <FileText size={18} className="mr-2" />
              Request
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Grades Table */}
      <Card className="bg-white border border-slate-200" data-testid="grades-table">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-heading">Grade Report</CardTitle>
          <Button variant="outline" className="text-slate-600" data-testid="download-results-btn">
            <Download size={16} className="mr-2" />
            Download PDF
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-uni-navy hover:bg-uni-navy">
                <TableHead className="text-white font-medium">Course Code</TableHead>
                <TableHead className="text-white font-medium">Course Title</TableHead>
                <TableHead className="text-white font-medium">Units</TableHead>
                <TableHead className="text-white font-medium">Score</TableHead>
                <TableHead className="text-white font-medium">Grade</TableHead>
                <TableHead className="text-white font-medium">Grade Point</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.length > 0 ? (
                grades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell className="font-medium text-slate-900">{grade.course?.code}</TableCell>
                    <TableCell className="text-slate-600">{grade.course?.title}</TableCell>
                    <TableCell className="text-slate-600">{grade.course?.units}</TableCell>
                    <TableCell className="text-slate-900 font-medium">{grade.score}</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        grade.grade_letter === 'A' ? 'bg-emerald-100 text-emerald-700' :
                        grade.grade_letter === 'B' ? 'bg-blue-100 text-blue-700' :
                        grade.grade_letter === 'C' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {grade.grade_letter}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-900 font-medium">{grade.grade_point.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                    No grades available yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Semester GPAs */}
      {gpaData?.semester_gpas?.length > 0 && (
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Semester Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {gpaData.semester_gpas.map((sem, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-1">
                    Semester {sem.semester} - {sem.academic_year}
                  </p>
                  <p className="text-2xl font-heading font-bold text-slate-900">
                    {sem.gpa.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400">{sem.units} units</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentResults;
