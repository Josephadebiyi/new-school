#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class UniversityLMSAPITester:
    def __init__(self, base_url="https://lms-emergent-build.preview.emergentagent.com"):
        self.base_url = base_url
        self.tokens = {}
        self.users = {}
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, test_role=""):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name} [{test_role}]...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    return response.json() if response.content else {}
                except:
                    return {}
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text}")
                self.failed_tests.append({
                    "test": name,
                    "role": test_role,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "endpoint": endpoint
                })
                return {}

        except requests.exceptions.Timeout:
            print(f"❌ FAILED - Request timeout (30s)")
            self.failed_tests.append({"test": name, "role": test_role, "error": "Timeout"})
            return {}
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            self.failed_tests.append({"test": name, "role": test_role, "error": str(e)})
            return {}

    def authenticate_user(self, role, email, password):
        """Authenticate user and store token"""
        response = self.run_test(f"Login as {role}", "POST", "auth/login", 200, 
                               {"email": email, "password": password}, test_role=role)
        if response and "access_token" in response:
            self.tokens[role] = response["access_token"]
            self.users[role] = response["user"]
            return True
        return False

    def get_auth_header(self, role):
        """Get authorization header for role"""
        return {'Authorization': f'Bearer {self.tokens[role]}'}

    def test_authentication(self):
        """Test authentication for all roles"""
        print("\n" + "="*50)
        print("🔐 TESTING AUTHENTICATION")
        print("="*50)
        
        credentials = {
            "student": {"email": "student@unilms.edu", "password": "student123"},
            "admin": {"email": "admin@unilms.edu", "password": "admin123"},
            "lecturer": {"email": "lecturer@unilms.edu", "password": "lecturer123"},
            "admissions": {"email": "admissions@unilms.edu", "password": "admissions123"},
            "finance": {"email": "finance@unilms.edu", "password": "finance123"},
            "registrar": {"email": "registrar@unilms.edu", "password": "registrar123"},
            "support": {"email": "support@unilms.edu", "password": "support123"}
        }

        # Seed database first
        self.run_test("Seed Database", "POST", "seed", 200, test_role="system")

        for role, creds in credentials.items():
            self.authenticate_user(role, creds["email"], creds["password"])

        # Test /auth/me endpoint
        for role in self.tokens:
            self.run_test(f"Get user profile", "GET", "auth/me", 200, 
                         headers=self.get_auth_header(role), test_role=role)

    def test_dashboard_stats(self):
        """Test dashboard stats for all roles"""
        print("\n" + "="*50)
        print("📊 TESTING DASHBOARD STATS")
        print("="*50)

        for role in self.tokens:
            self.run_test(f"Dashboard Stats", "GET", "dashboard/stats", 200,
                         headers=self.get_auth_header(role), test_role=role)

    def test_user_management(self):
        """Test user management (Admin & Registrar only)"""
        print("\n" + "="*50)
        print("👥 TESTING USER MANAGEMENT")
        print("="*50)

        admin_roles = ['admin', 'registrar']
        for role in admin_roles:
            if role in self.tokens:
                # Get users list
                self.run_test(f"Get Users List", "GET", "users", 200,
                             headers=self.get_auth_header(role), test_role=role)
                
                # Create new user
                new_user_data = {
                    "email": f"test_user_{datetime.now().strftime('%H%M%S')}@unilms.edu",
                    "password": "testpass123",
                    "first_name": "Test",
                    "last_name": "User",
                    "role": "student",
                    "department": "Public Health",
                    "program": "BSc. Public Health",
                    "level": 100
                }
                self.run_test(f"Create User", "POST", "users", 200,
                             data=new_user_data, headers=self.get_auth_header(role), test_role=role)

    def test_course_management(self):
        """Test course management"""
        print("\n" + "="*50)
        print("📚 TESTING COURSE MANAGEMENT")
        print("="*50)

        # Get courses (available to all authenticated users)
        for role in ['student', 'lecturer', 'admin']:
            if role in self.tokens:
                self.run_test(f"Get Courses", "GET", "courses", 200,
                             headers=self.get_auth_header(role), test_role=role)

        # Create course (Admin/Registrar only)
        admin_roles = ['admin', 'registrar']
        for role in admin_roles:
            if role in self.tokens:
                new_course_data = {
                    "code": f"TEST{datetime.now().strftime('%H%M%S')}",
                    "title": "Test Course",
                    "description": "A test course",
                    "department": "Public Health",
                    "level": 300,
                    "units": 2,
                    "semester": 1,
                    "course_type": "CORE"
                }
                self.run_test(f"Create Course", "POST", "courses", 200,
                             data=new_course_data, headers=self.get_auth_header(role), test_role=role)

    def test_student_features(self):
        """Test student-specific features"""
        print("\n" + "="*50)
        print("🎓 TESTING STUDENT FEATURES")
        print("="*50)

        if 'student' in self.tokens:
            student_id = self.users['student']['id']
            
            # Test enrollments
            self.run_test("Get Enrollments", "GET", "enrollments", 200,
                         headers=self.get_auth_header('student'), test_role='student')
            
            # Test grades
            self.run_test("Get Grades", "GET", "grades", 200,
                         headers=self.get_auth_header('student'), test_role='student')
            
            # Test GPA
            self.run_test("Get Student GPA", "GET", f"results/gpa/{student_id}", 200,
                         headers=self.get_auth_header('student'), test_role='student')
            
            # Test payments
            self.run_test("Get Payments", "GET", "payments", 200,
                         headers=self.get_auth_header('student'), test_role='student')
            
            # Test payment summary
            self.run_test("Get Payment Summary", "GET", f"payments/summary/{student_id}", 200,
                         headers=self.get_auth_header('student'), test_role='student')

    def test_admissions(self):
        """Test admissions functionality"""
        print("\n" + "="*50)
        print("🎯 TESTING ADMISSIONS")
        print("="*50)

        if 'admissions' in self.tokens:
            # Get admissions
            self.run_test("Get Admissions", "GET", "admissions", 200,
                         headers=self.get_auth_header('admissions'), test_role='admissions')

        # Test public application (no auth needed)
        application_data = {
            "first_name": "New",
            "last_name": "Applicant",
            "email": f"applicant_{datetime.now().strftime('%H%M%S')}@example.com",
            "phone": "+234 801 234 5678",
            "program": "BSc. Public Health",
            "department": "Public Health"
        }
        response = self.run_test("Submit Application", "POST", "admissions/apply", 200,
                               data=application_data, test_role='public')

    def test_payments_and_finance(self):
        """Test payment and finance functionality"""
        print("\n" + "="*50)
        print("💰 TESTING PAYMENTS & FINANCE")
        print("="*50)

        if 'finance' in self.tokens:
            # Test finance officer endpoints
            self.run_test("Get All Payments", "GET", "payments", 200,
                         headers=self.get_auth_header('finance'), test_role='finance')

    def test_lecturer_features(self):
        """Test lecturer-specific features"""
        print("\n" + "="*50)
        print("👨‍🏫 TESTING LECTURER FEATURES")
        print("="*50)

        if 'lecturer' in self.tokens:
            # Test lecturer courses
            self.run_test("Get Lecturer Courses", "GET", "courses", 200,
                         headers=self.get_auth_header('lecturer'), test_role='lecturer')
            
            # Test assessments
            self.run_test("Get Assessments", "GET", "assessments", 200,
                         headers=self.get_auth_header('lecturer'), test_role='lecturer')
            
            # Test live classes
            self.run_test("Get Live Classes", "GET", "live-classes", 200,
                         headers=self.get_auth_header('lecturer'), test_role='lecturer')

    def test_invalid_endpoints(self):
        """Test invalid endpoints and unauthorized access"""
        print("\n" + "="*50)
        print("🚫 TESTING SECURITY & ERROR HANDLING")
        print("="*50)

        # Test 404 for non-existent endpoint
        self.run_test("Invalid Endpoint", "GET", "invalid/endpoint", 404, test_role="security")
        
        # Test unauthorized access
        self.run_test("Unauthorized Access", "GET", "users", 401, test_role="security")
        
        # Test invalid login
        self.run_test("Invalid Login", "POST", "auth/login", 401,
                     {"email": "invalid@test.com", "password": "wrongpass"}, test_role="security")

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting University LMS API Testing...")
        print(f"📍 Backend URL: {self.base_url}")
        
        try:
            # Run tests in order
            self.test_authentication()
            self.test_dashboard_stats()
            self.test_user_management()
            self.test_course_management()
            self.test_student_features()
            self.test_admissions()
            self.test_payments_and_finance()
            self.test_lecturer_features()
            self.test_invalid_endpoints()
            
        except KeyboardInterrupt:
            print("\n⏹️  Testing interrupted by user")
        except Exception as e:
            print(f"\n💥 Unexpected error: {str(e)}")
        
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("📋 TEST SUMMARY")
        print("="*60)
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {len(self.failed_tests)}")
        print(f"📊 Total Tests: {self.tests_run}")
        print(f"🎯 Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for failure in self.failed_tests:
                print(f"   • {failure.get('test', 'Unknown')} [{failure.get('role', 'N/A')}]")
                if 'expected' in failure:
                    print(f"     Expected: {failure['expected']}, Got: {failure['actual']}")
                if 'error' in failure:
                    print(f"     Error: {failure['error']}")
        
        print("="*60)
        
        return len(self.failed_tests) == 0

def main():
    """Main function"""
    tester = UniversityLMSAPITester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())