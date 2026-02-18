"""
Tests for new upload features and UI endpoints
- Document upload for applications (high school cert, ID)
- Course image upload for admins
- Public course endpoints
"""

import pytest
import requests
import os
from pathlib import Path

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://gitb-school.preview.emergentagent.com"

# Test credentials
ADMIN_EMAIL = "admin@unilms.edu"
ADMIN_PASSWORD = "admin123"


class TestAuthSetup:
    """Setup tests for authentication"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_admin_login(self):
        """Test admin can login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "admin"
        print("Admin login: PASSED")


class TestPublicCourseEndpoints:
    """Test public course endpoints (no auth required)"""
    
    def test_get_public_courses(self):
        """Test /api/courses/public returns courses without auth"""
        response = requests.get(f"{BASE_URL}/api/courses/public")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Public courses: PASSED - Found {len(data)} courses")
        return data
    
    def test_get_public_course_detail(self):
        """Test /api/courses/public/{id} returns course details"""
        # First get a course
        courses_response = requests.get(f"{BASE_URL}/api/courses/public")
        assert courses_response.status_code == 200
        courses = courses_response.json()
        
        if len(courses) > 0:
            course_id = courses[0].get("id")
            response = requests.get(f"{BASE_URL}/api/courses/public/{course_id}")
            assert response.status_code == 200
            data = response.json()
            assert "id" in data
            assert "title" in data
            assert "modules" in data
            print(f"Public course detail: PASSED - Course: {data.get('title')}")
        else:
            pytest.skip("No courses available to test")
    
    def test_public_course_404_for_invalid_id(self):
        """Test /api/courses/public/{id} returns 404 for invalid course"""
        response = requests.get(f"{BASE_URL}/api/courses/public/invalid-course-id-123")
        assert response.status_code == 404
        print("Public course 404: PASSED")


class TestDocumentUploadEndpoint:
    """Test document upload endpoint for applications"""
    
    def test_document_upload_endpoint_exists(self):
        """Test /api/upload/document endpoint exists"""
        # Trying without file should give 422 (validation error) not 404
        response = requests.post(f"{BASE_URL}/api/upload/document")
        # 422 = endpoint exists but validation error (missing file)
        # 405 = method not allowed
        # 404 = endpoint doesn't exist
        assert response.status_code in [422, 400, 500], f"Got {response.status_code}"
        print(f"Document upload endpoint: EXISTS - Status {response.status_code}")
    
    def test_document_upload_with_valid_image(self):
        """Test uploading a valid JPG document"""
        # Create a simple test image (1x1 pixel PNG)
        test_image_content = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
            0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
            0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
            0x44, 0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {'file': ('test_document.png', test_image_content, 'image/png')}
        data = {'doc_type': 'high_school_cert'}
        
        response = requests.post(f"{BASE_URL}/api/upload/document", files=files, data=data)
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "filename" in data
        assert data["url"].startswith("/api/uploads/")
        print(f"Document upload with PNG: PASSED - URL: {data['url']}")
    
    def test_document_upload_accepts_pdf(self):
        """Test uploading a PDF document"""
        # Minimal PDF content
        pdf_content = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
        
        files = {'file': ('test.pdf', pdf_content, 'application/pdf')}
        data = {'doc_type': 'identification'}
        
        response = requests.post(f"{BASE_URL}/api/upload/document", files=files, data=data)
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        print(f"Document upload with PDF: PASSED - URL: {data['url']}")
    
    def test_document_upload_rejects_invalid_type(self):
        """Test that invalid file types are rejected"""
        files = {'file': ('test.exe', b'MZ...invalid content', 'application/octet-stream')}
        data = {'doc_type': 'high_school_cert'}
        
        response = requests.post(f"{BASE_URL}/api/upload/document", files=files, data=data)
        assert response.status_code == 400
        print("Document upload invalid type rejection: PASSED")


class TestCourseImageUploadEndpoint:
    """Test course image upload endpoint (requires admin auth)"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_course_image_upload_requires_auth(self):
        """Test /api/upload/course-image requires authentication"""
        files = {'file': ('test.png', b'test', 'image/png')}
        response = requests.post(f"{BASE_URL}/api/upload/course-image", files=files)
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("Course image upload auth required: PASSED")
    
    def test_course_image_upload_with_auth(self, admin_token):
        """Test admin can upload course image"""
        # Create a minimal PNG image
        test_image_content = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
            0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
            0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
            0x44, 0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {'file': ('course_image.png', test_image_content, 'image/png')}
        headers = {'Authorization': f'Bearer {admin_token}'}
        
        response = requests.post(
            f"{BASE_URL}/api/upload/course-image", 
            files=files, 
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert data["url"].startswith("/api/uploads/")
        assert "course_" in data["filename"]
        print(f"Course image upload with auth: PASSED - URL: {data['url']}")
    
    def test_course_image_rejects_invalid_type(self, admin_token):
        """Test that invalid image types are rejected"""
        files = {'file': ('test.gif', b'GIF89a...', 'image/gif')}
        headers = {'Authorization': f'Bearer {admin_token}'}
        
        response = requests.post(
            f"{BASE_URL}/api/upload/course-image", 
            files=files,
            headers=headers
        )
        assert response.status_code == 400
        print("Course image invalid type rejection: PASSED")


class TestServeUploadedFiles:
    """Test serving of uploaded files"""
    
    def test_serve_uploaded_file(self):
        """Test uploaded file can be retrieved"""
        # First upload a file
        test_image = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
            0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
            0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
            0x44, 0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {'file': ('serve_test.png', test_image, 'image/png')}
        data = {'doc_type': 'test'}
        
        upload_response = requests.post(f"{BASE_URL}/api/upload/document", files=files, data=data)
        assert upload_response.status_code == 200
        
        uploaded_url = upload_response.json()["url"]
        filename = uploaded_url.split("/")[-1]
        
        # Now try to retrieve it
        serve_response = requests.get(f"{BASE_URL}/api/uploads/{filename}")
        assert serve_response.status_code == 200
        assert serve_response.headers.get("content-type") == "image/png"
        print(f"Serve uploaded file: PASSED - Retrieved {filename}")
    
    def test_serve_nonexistent_file_returns_404(self):
        """Test 404 for nonexistent file"""
        response = requests.get(f"{BASE_URL}/api/uploads/nonexistent_file_xyz.png")
        assert response.status_code == 404
        print("Serve nonexistent file 404: PASSED")


class TestDashboardEndpoints:
    """Test dashboard stats endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_admin_dashboard_stats(self, admin_token):
        """Test admin dashboard stats endpoint"""
        headers = {'Authorization': f'Bearer {admin_token}'}
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_students" in data
        assert "total_courses" in data
        print(f"Admin dashboard stats: PASSED - {data.get('total_students')} students, {data.get('total_courses')} courses")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
