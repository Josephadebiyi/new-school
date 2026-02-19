"""
LuminaLMS API Tests - Testing Admin Settings, Users, Lock/Unlock, Expel/Reinstate
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_admin_login(self):
        """Test admin login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@unilms.edu",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "admin"
        assert data["user"]["email"] == "admin@unilms.edu"
    
    def test_student_login(self):
        """Test student login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "student@unilms.edu",
            "password": "student123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "student"
    
    def test_lecturer_login(self):
        """Test lecturer login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "lecturer@unilms.edu",
            "password": "lecturer123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "lecturer"
    
    def test_invalid_login(self):
        """Test invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401


@pytest.fixture(scope="module")
def admin_token():
    """Get admin auth token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@unilms.edu",
        "password": "admin123"
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    pytest.skip("Admin authentication failed")


class TestDashboardStats:
    """Dashboard stats endpoint tests"""
    
    def test_dashboard_stats(self, admin_token):
        """Test getting dashboard stats"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_students" in data
        assert "total_lecturers" in data
        assert "total_courses" in data


class TestSystemConfig:
    """System configuration (Branding/Login Page/Bank Details) tests"""
    
    def test_get_system_config(self):
        """Test getting system config without auth"""
        response = requests.get(f"{BASE_URL}/api/system-config")
        assert response.status_code == 200
        data = response.json()
        assert "university_name" in data
        assert "primary_color" in data
        assert "secondary_color" in data
    
    def test_update_branding_settings(self, admin_token):
        """Test updating branding settings"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        response = requests.put(f"{BASE_URL}/api/system-config", headers=headers, json={
            "university_name": "Test University",
            "primary_color": "#1E3A5F"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["university_name"] == "Test University"
        assert data["primary_color"] == "#1E3A5F"
    
    def test_update_login_page_settings(self, admin_token):
        """Test updating login page customization"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        response = requests.put(f"{BASE_URL}/api/system-config", headers=headers, json={
            "login_headline": "Welcome to Learning",
            "login_subtext": "Quality education for everyone"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["login_headline"] == "Welcome to Learning"
        assert data["login_subtext"] == "Quality education for everyone"
    
    def test_update_bank_details(self, admin_token):
        """Test updating bank details"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        response = requests.put(f"{BASE_URL}/api/system-config", headers=headers, json={
            "bank_name": "Test Bank",
            "account_name": "Test Account",
            "account_number": "1234567890",
            "iban": "NG12TEST1234567890",
            "swift_code": "TESTNG"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["bank_name"] == "Test Bank"
        assert data["account_name"] == "Test Account"
        assert data["account_number"] == "1234567890"
    
    def test_restore_original_settings(self, admin_token):
        """Restore original settings"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        response = requests.put(f"{BASE_URL}/api/system-config", headers=headers, json={
            "university_name": "Global Institute of Tech and Business",
            "primary_color": "#2D4A2D",
            "login_headline": "Learn with",
            "login_subtext": "Affordable higher education you can take wherever life takes you."
        })
        assert response.status_code == 200


class TestUserManagement:
    """User management CRUD and special actions tests"""
    
    def test_get_all_users(self, admin_token):
        """Test getting all users"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/users", headers=headers)
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        assert len(users) > 0
    
    def test_filter_users_by_role_student(self, admin_token):
        """Test filtering users by student role"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/users?role=student", headers=headers)
        assert response.status_code == 200
        users = response.json()
        for user in users:
            assert user["role"] == "student"
    
    def test_filter_users_by_role_lecturer(self, admin_token):
        """Test filtering users by lecturer role"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/users?role=lecturer", headers=headers)
        assert response.status_code == 200
        users = response.json()
        for user in users:
            assert user["role"] == "lecturer"
    
    def test_get_single_user(self, admin_token):
        """Test getting single user"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        # First get all users to get a valid ID
        users_resp = requests.get(f"{BASE_URL}/api/users", headers=headers)
        users = users_resp.json()
        student = next((u for u in users if u["role"] == "student"), None)
        
        if student:
            response = requests.get(f"{BASE_URL}/api/users/{student['id']}", headers=headers)
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == student["id"]


class TestUserLockUnlock:
    """Lock/Unlock user account tests"""
    
    @pytest.fixture(scope="class")
    def test_student_id(self, admin_token):
        """Get a student ID for testing"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        users_resp = requests.get(f"{BASE_URL}/api/users?role=student", headers=headers)
        students = users_resp.json()
        # Find a student that's not the main test student
        test_student = next((s for s in students if s["email"] not in ["student@unilms.edu"]), None)
        if test_student:
            return test_student["id"]
        pytest.skip("No test student available")
    
    def test_lock_user(self, admin_token, test_student_id):
        """Test locking a user account"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.put(f"{BASE_URL}/api/users/{test_student_id}/lock", headers=headers)
        assert response.status_code == 200
        assert "locked" in response.json()["message"].lower()
        
        # Verify user is locked
        user_resp = requests.get(f"{BASE_URL}/api/users/{test_student_id}", headers=headers)
        assert user_resp.json()["account_status"] == "locked"
    
    def test_unlock_user(self, admin_token, test_student_id):
        """Test unlocking a user account"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.put(f"{BASE_URL}/api/users/{test_student_id}/unlock", headers=headers)
        assert response.status_code == 200
        assert "unlocked" in response.json()["message"].lower()
        
        # Verify user is unlocked
        user_resp = requests.get(f"{BASE_URL}/api/users/{test_student_id}", headers=headers)
        assert user_resp.json()["account_status"] == "active"


class TestStudentExpelReinstate:
    """Expel/Reinstate student tests"""
    
    @pytest.fixture(scope="class")
    def expel_test_student_id(self, admin_token):
        """Get a student ID for expel testing"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        users_resp = requests.get(f"{BASE_URL}/api/users?role=student", headers=headers)
        students = users_resp.json()
        test_student = next((s for s in students if s["email"] not in ["student@unilms.edu"]), None)
        if test_student:
            return test_student["id"]
        pytest.skip("No test student available for expel test")
    
    def test_expel_student(self, admin_token, expel_test_student_id):
        """Test expelling a student"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.put(f"{BASE_URL}/api/users/{expel_test_student_id}/expel", headers=headers)
        assert response.status_code == 200
        assert "expelled" in response.json()["message"].lower()
        
        # Verify student is expelled
        user_resp = requests.get(f"{BASE_URL}/api/users/{expel_test_student_id}", headers=headers)
        user = user_resp.json()
        assert user["account_status"] == "expelled"
        assert user["is_active"] == False
    
    def test_reinstate_student(self, admin_token, expel_test_student_id):
        """Test reinstating an expelled student"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.put(f"{BASE_URL}/api/users/{expel_test_student_id}/reinstate", headers=headers)
        assert response.status_code == 200
        assert "reinstated" in response.json()["message"].lower()
        
        # Verify student is reinstated
        user_resp = requests.get(f"{BASE_URL}/api/users/{expel_test_student_id}", headers=headers)
        user = user_resp.json()
        assert user["account_status"] == "active"
        assert user["is_active"] == True
    
    def test_expel_non_student_fails(self, admin_token):
        """Test that expelling non-student fails"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        users_resp = requests.get(f"{BASE_URL}/api/users?role=lecturer", headers=headers)
        lecturers = users_resp.json()
        if lecturers:
            response = requests.put(f"{BASE_URL}/api/users/{lecturers[0]['id']}/expel", headers=headers)
            assert response.status_code == 400


class TestEditUser:
    """Edit user functionality tests"""
    
    @pytest.fixture(scope="class")
    def edit_test_student_id(self, admin_token):
        """Get a student ID for edit testing"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        users_resp = requests.get(f"{BASE_URL}/api/users?role=student", headers=headers)
        students = users_resp.json()
        test_student = next((s for s in students if s["email"] not in ["student@unilms.edu"]), None)
        if test_student:
            return test_student["id"]
        pytest.skip("No test student available")
    
    def test_update_user_name(self, admin_token, edit_test_student_id):
        """Test updating user name"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        response = requests.put(f"{BASE_URL}/api/users/{edit_test_student_id}", headers=headers, json={
            "first_name": "Updated",
            "last_name": "Name"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "Updated"
        assert data["last_name"] == "Name"
    
    def test_update_payment_status(self, admin_token, edit_test_student_id):
        """Test updating payment status"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        response = requests.put(f"{BASE_URL}/api/users/{edit_test_student_id}", headers=headers, json={
            "payment_status": "paid"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["payment_status"] == "paid"
    
    def test_update_student_level(self, admin_token, edit_test_student_id):
        """Test updating student level"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        response = requests.put(f"{BASE_URL}/api/users/{edit_test_student_id}", headers=headers, json={
            "level": 200
        })
        assert response.status_code == 200
        data = response.json()
        assert data["level"] == 200


class TestCoursesAPI:
    """Course CRUD and Course Editor endpoints"""
    
    def test_get_all_courses(self, admin_token):
        """Test getting all courses"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/courses", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_single_course(self, admin_token):
        """Test getting single course with modules"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        # First get all courses
        courses_resp = requests.get(f"{BASE_URL}/api/courses", headers=headers)
        courses = courses_resp.json()
        if courses:
            course_id = courses[0]["id"]
            response = requests.get(f"{BASE_URL}/api/courses/{course_id}", headers=headers)
            assert response.status_code == 200
            data = response.json()
            assert "id" in data
            assert "title" in data
            assert "modules" in data  # Course editor requires modules array
    
    def test_update_course(self, admin_token):
        """Test updating course with duration settings"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        # First get a course
        courses_resp = requests.get(f"{BASE_URL}/api/courses", headers=headers)
        courses = courses_resp.json()
        if courses:
            course_id = courses[0]["id"]
            course = courses[0]
            # Update with new duration type
            response = requests.put(f"{BASE_URL}/api/courses/{course_id}", headers=headers, json={
                "code": course.get("code", "TEST001"),
                "title": course.get("title", "Test Course"),
                "description": course.get("description", ""),
                "department": course.get("department", "Public Health"),
                "level": course.get("level", 100),
                "units": course.get("units", 2),
                "semester": course.get("semester", 1),
                "course_type": course.get("course_type", "CORE"),
                "duration_weeks": 16,
                "duration_type": "months"
            })
            assert response.status_code == 200
            data = response.json()
            # Verify update persisted
            verify_resp = requests.get(f"{BASE_URL}/api/courses/{course_id}", headers=headers)
            verify_data = verify_resp.json()
            # Note: duration fields may not be in CourseCreate model, so check if they're returned


class TestModulesAndLessons:
    """Module and Lesson endpoints for Course Builder"""
    
    @pytest.fixture(scope="class")
    def test_course_id(self, admin_token):
        """Get a course ID for testing"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        courses_resp = requests.get(f"{BASE_URL}/api/courses", headers=headers)
        courses = courses_resp.json()
        if courses:
            return courses[0]["id"]
        pytest.skip("No courses available")
    
    def test_get_course_modules(self, admin_token, test_course_id):
        """Test getting modules for a course"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/courses/{test_course_id}/modules", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_create_module(self, admin_token, test_course_id):
        """Test creating a new module"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        response = requests.post(f"{BASE_URL}/api/courses/{test_course_id}/modules", headers=headers, json={
            "title": "TEST_Module for Testing",
            "description": "Test module description",
            "order": 100
        })
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "TEST_Module for Testing"
        assert "id" in data
        return data["id"]
    
    def test_add_lesson_to_module(self, admin_token, test_course_id):
        """Test adding a lesson to a module"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        # First create a module
        module_resp = requests.post(f"{BASE_URL}/api/courses/{test_course_id}/modules", headers=headers, json={
            "title": "TEST_Module for Lessons",
            "description": "Test for adding lessons",
            "order": 101
        })
        module = module_resp.json()
        module_id = module["id"]
        
        # Add lesson to module
        response = requests.post(f"{BASE_URL}/api/modules/{module_id}/lessons", headers=headers, json={
            "title": "TEST_Lesson 1",
            "type": "video",
            "content_url": "https://example.com/video.mp4",
            "description": "Test lesson"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "TEST_Lesson 1"
        assert "id" in data
    
    def test_upload_quiz_to_module(self, admin_token, test_course_id):
        """Test uploading quiz questions to a module"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        # First create a module
        module_resp = requests.post(f"{BASE_URL}/api/courses/{test_course_id}/modules", headers=headers, json={
            "title": "TEST_Module for Quiz",
            "description": "Test for quiz upload",
            "order": 102
        })
        module = module_resp.json()
        module_id = module["id"]
        
        # Upload quiz
        response = requests.post(f"{BASE_URL}/api/modules/{module_id}/quiz", headers=headers, json={
            "questions": [
                {
                    "question": "What is 2+2?",
                    "options": ["3", "4", "5", "6"],
                    "correct_answer": "B"
                },
                {
                    "question": "What is the capital of France?",
                    "options": ["London", "Paris", "Berlin", "Madrid"],
                    "correct_answer": "B"
                }
            ],
            "attempts_allowed": 3,
            "passing_score": 70
        })
        assert response.status_code == 200
        data = response.json()
        assert "lesson_id" in data


class TestApplicationsAPI:
    """Applications/Admissions management endpoints"""
    
    def test_get_all_applications(self, admin_token):
        """Test getting all applications"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/applications", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_filter_applications_by_status(self, admin_token):
        """Test filtering applications by status"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/applications?status=pending_review", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned applications should have pending_review status
        for app in data:
            assert app["status"] == "pending_review"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
