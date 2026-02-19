"""
GITB LMS Backend API Tests
Tests for: System Config, Auth, Course CRUD, Applications, Public Courses

Test credentials:
- Admin: taiwojos2@yahoo.com / Passw0rd@1
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://learning-hub-297.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "taiwojos2@yahoo.com"
ADMIN_PASSWORD = "Passw0rd@1"
TEST_COURSE_ID = "09a73d8c-b9b3-40fa-9724-97832306657b"


class TestSystemConfig:
    """System configuration endpoint tests"""
    
    def test_get_system_config(self):
        """GET /api/system-config - Returns system configuration"""
        response = requests.get(f"{BASE_URL}/api/system-config")
        assert response.status_code == 200
        
        data = response.json()
        assert "university_name" in data
        assert "primary_color" in data
        assert "secondary_color" in data
        assert data["university_name"] == "GITB - Student LMS"
        print(f"✓ System config: university_name={data['university_name']}")


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """POST /api/auth/login - Successful admin login"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        assert data["token_type"] == "bearer"
        print(f"✓ Admin login successful: {data['user']['email']}")
    
    def test_login_invalid_credentials(self):
        """POST /api/auth/login - Invalid credentials returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "invalid@example.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✓ Invalid credentials rejected with 401")
    
    def test_login_missing_email(self):
        """POST /api/auth/login - Missing email returns 422"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"password": "somepassword"}
        )
        assert response.status_code == 422
        print("✓ Missing email rejected with 422")
    
    def test_forgot_password(self):
        """POST /api/auth/forgot-password - Request password reset"""
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={"email": ADMIN_EMAIL}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Forgot password: {data['message']}")
    
    def test_forgot_password_invalid_email(self):
        """POST /api/auth/forgot-password - Invalid email format returns 422"""
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={"email": "not-an-email"}
        )
        assert response.status_code == 422
        print("✓ Invalid email format rejected with 422")
    
    def test_reset_password_invalid_token(self):
        """POST /api/auth/reset-password - Invalid token returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            json={"token": "invalid-token", "new_password": "NewPass123!"}
        )
        assert response.status_code == 400
        print("✓ Invalid reset token rejected with 400")


class TestPublicCourses:
    """Public courses endpoint tests (no auth required)"""
    
    def test_get_public_courses(self):
        """GET /api/courses/public - Returns list of public courses"""
        response = requests.get(f"{BASE_URL}/api/courses/public")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public courses: {len(data)} courses returned")
        
        if len(data) > 0:
            course = data[0]
            assert "id" in course
            assert "title" in course
            assert "code" in course
            print(f"✓ First course: {course['title']} ({course['code']})")
    
    def test_get_public_course_by_id(self):
        """GET /api/courses/public/{course_id} - Returns single course"""
        response = requests.get(f"{BASE_URL}/api/courses/public/{TEST_COURSE_ID}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == TEST_COURSE_ID
        assert "title" in data
        assert "modules" in data
        print(f"✓ Course details: {data['title']}")
    
    def test_get_public_course_not_found(self):
        """GET /api/courses/public/{invalid_id} - Returns 404"""
        response = requests.get(f"{BASE_URL}/api/courses/public/nonexistent-id")
        assert response.status_code == 404
        print("✓ Non-existent course returns 404")


class TestCourseCRUD:
    """Course CRUD tests (admin only)"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Admin authentication failed")
        return response.json()["access_token"]
    
    def test_get_courses_authenticated(self, admin_token):
        """GET /api/courses - Returns courses for authenticated admin"""
        response = requests.get(
            f"{BASE_URL}/api/courses",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin courses: {len(data)} courses returned")
    
    def test_create_course(self, admin_token):
        """POST /api/courses - Create new course"""
        unique_code = f"TEST-{str(uuid.uuid4())[:8].upper()}"
        course_data = {
            "code": unique_code,
            "title": "Test Course Created by Pytest",
            "description": "A test course for API testing",
            "department": "Test Department",
            "level": 100,
            "units": 3,
            "semester": 1,
            "course_type": "ELECTIVE"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/courses",
            json=course_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["code"] == unique_code
        assert data["title"] == "Test Course Created by Pytest"
        assert "id" in data
        print(f"✓ Course created: {data['title']} (ID: {data['id']})")
        
        # Store for cleanup - note: not deleting to avoid side effects
        return data["id"]
    
    def test_get_course_by_id(self, admin_token):
        """GET /api/courses/{course_id} - Get single course"""
        response = requests.get(
            f"{BASE_URL}/api/courses/{TEST_COURSE_ID}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == TEST_COURSE_ID
        assert "modules" in data
        print(f"✓ Course retrieved: {data['title']}")
    
    def test_get_courses_unauthenticated(self):
        """GET /api/courses - Unauthenticated request returns 403"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 403
        print("✓ Unauthenticated course access rejected with 403")


class TestApplicationsWithStripe:
    """Application submission with Stripe checkout tests"""
    
    def test_create_application(self):
        """POST /api/applications/create - Creates application and returns Stripe checkout URL"""
        unique_email = f"test.{str(uuid.uuid4())[:8]}@example.com"
        
        application_data = {
            "first_name": "Test",
            "last_name": "Applicant",
            "email": unique_email,
            "phone": "+1234567890",
            "course_id": TEST_COURSE_ID,
            "origin_url": "https://learning-hub-297.preview.emergentagent.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/applications/create",
            json=application_data
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "checkout_url" in data
        assert "session_id" in data
        assert data["checkout_url"].startswith("https://checkout.stripe.com")
        print(f"✓ Application created with Stripe checkout URL")
        print(f"✓ Session ID: {data['session_id'][:30]}...")
    
    def test_create_application_invalid_course(self):
        """POST /api/applications/create - Invalid course returns 404"""
        application_data = {
            "first_name": "Test",
            "last_name": "Applicant",
            "email": "test@example.com",
            "phone": "+1234567890",
            "course_id": "nonexistent-course-id",
            "origin_url": "https://learning-hub-297.preview.emergentagent.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/applications/create",
            json=application_data
        )
        assert response.status_code == 404
        print("✓ Invalid course ID rejected with 404")
    
    def test_create_application_missing_fields(self):
        """POST /api/applications/create - Missing fields returns 422"""
        application_data = {
            "first_name": "Test",
            # Missing required fields
        }
        
        response = requests.post(
            f"{BASE_URL}/api/applications/create",
            json=application_data
        )
        assert response.status_code == 422
        print("✓ Missing fields rejected with 422")
    
    def test_get_application_status(self):
        """GET /api/applications/status/{session_id} - Check application status"""
        # First create an application to get a session ID
        unique_email = f"status.test.{str(uuid.uuid4())[:8]}@example.com"
        
        create_response = requests.post(
            f"{BASE_URL}/api/applications/create",
            json={
                "first_name": "Status",
                "last_name": "Test",
                "email": unique_email,
                "phone": "+1234567890",
                "course_id": TEST_COURSE_ID,
                "origin_url": "https://learning-hub-297.preview.emergentagent.com"
            }
        )
        assert create_response.status_code == 200
        session_id = create_response.json()["session_id"]
        
        # Check the status
        status_response = requests.get(
            f"{BASE_URL}/api/applications/status/{session_id}"
        )
        assert status_response.status_code == 200
        
        data = status_response.json()
        assert "status" in data
        assert "payment_status" in data
        print(f"✓ Application status: {data['status']}, payment: {data['payment_status']}")


class TestAdminFeatures:
    """Admin-only feature tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Admin authentication failed")
        return response.json()["access_token"]
    
    def test_get_auth_me(self, admin_token):
        """GET /api/auth/me - Returns current user info"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert "access" in data
        assert "system_config" in data
        print(f"✓ Auth me: {data['email']} ({data['role']})")
    
    def test_get_users(self, admin_token):
        """GET /api/users - Admin can list users"""
        response = requests.get(
            f"{BASE_URL}/api/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Users list: {len(data)} users")
    
    def test_get_applications(self, admin_token):
        """GET /api/applications - Admin can list applications"""
        response = requests.get(
            f"{BASE_URL}/api/applications",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Applications list: {len(data)} applications")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
