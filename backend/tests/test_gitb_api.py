"""
GITB LMS Backend API Tests
Tests for authentication, admin dashboard, applications, roles, and user management
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
# Fallback to localhost if external URL doesn't work
LOCAL_URL = "http://localhost:8001"

# Test credentials
ADMIN_EMAIL = "taiwojos2@yahoo.com"
ADMIN_PASSWORD = "Passw0rd@1"


class TestAPIHealth:
    """Test API health and basic connectivity"""
    
    def test_api_health_check(self):
        """Test the API health endpoint"""
        try:
            response = requests.get(f"{BASE_URL}/api", timeout=10)
            if response.status_code == 404:
                # Fallback to localhost
                response = requests.get(f"{LOCAL_URL}/api", timeout=10)
        except:
            response = requests.get(f"{LOCAL_URL}/api", timeout=10)
            
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["database"] == "connected"
        print(f"✓ API health check passed: {data}")
        
    def test_system_config_public(self):
        """Test public system config endpoint"""
        try:
            response = requests.get(f"{BASE_URL}/api/system-config", timeout=10)
            if response.status_code == 404:
                response = requests.get(f"{LOCAL_URL}/api/system-config", timeout=10)
        except:
            response = requests.get(f"{LOCAL_URL}/api/system-config", timeout=10)
            
        assert response.status_code == 200
        data = response.json()
        assert "university_name" in data
        print(f"✓ System config: {data.get('university_name')}")


class TestAuthentication:
    """Test authentication endpoints"""
    
    def get_base_url(self):
        """Get working base URL"""
        try:
            r = requests.get(f"{BASE_URL}/api", timeout=5)
            if r.status_code == 200:
                return BASE_URL
        except:
            pass
        return LOCAL_URL
    
    def test_login_success(self):
        """Test admin login with valid credentials"""
        url = self.get_base_url()
        response = requests.post(
            f"{url}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        
        # Validate user data
        user = data["user"]
        assert user["email"] == ADMIN_EMAIL
        assert user["role"] == "admin"
        assert "id" in user
        assert "first_name" in user
        assert "last_name" in user
        assert user["is_active"] == True
        
        # Validate system_config is included
        assert "system_config" in data
        
        print(f"✓ Login successful for {user['first_name']} {user['last_name']} (role: {user['role']})")
        
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        url = self.get_base_url()
        response = requests.post(
            f"{url}/api/auth/login",
            json={"email": "wrong@example.com", "password": "wrongpass"}
        )
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ Invalid credentials rejected: {data['detail']}")
        
    def test_login_missing_fields(self):
        """Test login with missing fields returns 422"""
        url = self.get_base_url()
        response = requests.post(
            f"{url}/api/auth/login",
            json={"email": ADMIN_EMAIL}
        )
        
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data
        print(f"✓ Missing fields rejected: {data['detail']}")
        
    def test_get_current_user(self):
        """Test /auth/me returns current user data"""
        url = self.get_base_url()
        
        # Login first
        login_resp = requests.post(
            f"{url}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login_resp.json()["access_token"]
        
        # Get current user
        response = requests.get(
            f"{url}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert "access" in data
        assert "system_config" in data
        print(f"✓ /auth/me returned user: {data['email']}")
        
    def test_unauthorized_access_without_token(self):
        """Test protected endpoints reject requests without token"""
        url = self.get_base_url()
        response = requests.get(f"{url}/api/auth/me")
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ Unauthorized access blocked: {data['detail']}")


class TestAdminDashboard:
    """Test admin dashboard endpoint"""
    
    def get_auth_header(self):
        """Get authentication header"""
        try:
            r = requests.get(f"{BASE_URL}/api", timeout=5)
            url = BASE_URL if r.status_code == 200 else LOCAL_URL
        except:
            url = LOCAL_URL
            
        login_resp = requests.post(
            f"{url}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login_resp.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}, url
    
    def test_admin_dashboard_stats(self):
        """Test admin dashboard returns correct statistics"""
        headers, url = self.get_auth_header()
        
        response = requests.get(
            f"{url}/api/dashboard/admin",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate all expected stats are present
        expected_fields = [
            "total_students", "total_lecturers", "total_courses",
            "active_courses", "pending_admissions", "locked_accounts",
            "unpaid_students", "total_users", "recent_users"
        ]
        
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
            
        # Validate data types
        assert isinstance(data["total_students"], int)
        assert isinstance(data["total_courses"], int)
        assert isinstance(data["pending_admissions"], int)
        assert isinstance(data["recent_users"], list)
        
        print(f"✓ Admin dashboard stats: students={data['total_students']}, courses={data['total_courses']}, pending={data['pending_admissions']}")
        
    def test_admin_dashboard_requires_auth(self):
        """Test admin dashboard requires authentication"""
        try:
            r = requests.get(f"{BASE_URL}/api", timeout=5)
            url = BASE_URL if r.status_code == 200 else LOCAL_URL
        except:
            url = LOCAL_URL
            
        response = requests.get(f"{url}/api/dashboard/admin")
        
        assert response.status_code == 401
        print(f"✓ Admin dashboard blocked without auth")


class TestApplications:
    """Test application management endpoints"""
    
    def get_auth_header(self):
        """Get authentication header"""
        try:
            r = requests.get(f"{BASE_URL}/api", timeout=5)
            url = BASE_URL if r.status_code == 200 else LOCAL_URL
        except:
            url = LOCAL_URL
            
        login_resp = requests.post(
            f"{url}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login_resp.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}, url
    
    def test_list_all_applications(self):
        """Test listing all applications"""
        headers, url = self.get_auth_header()
        
        response = requests.get(
            f"{url}/api/applications",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            app = data[0]
            # Validate application structure
            expected_fields = ["id", "first_name", "last_name", "email", "course_id", "status"]
            for field in expected_fields:
                assert field in app, f"Missing field in application: {field}"
                
        print(f"✓ Applications list: {len(data)} applications found")
        return data
        
    def test_list_applications_by_status(self):
        """Test filtering applications by status"""
        headers, url = self.get_auth_header()
        
        # Test pending status filter
        response = requests.get(
            f"{url}/api/applications?status=pending",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # All returned applications should be pending
        for app in data:
            assert app["status"] == "pending"
            
        print(f"✓ Filtered applications (pending): {len(data)} found")
        
    def test_get_single_application(self):
        """Test getting a single application by ID"""
        headers, url = self.get_auth_header()
        
        # First get list to find an application ID
        list_resp = requests.get(f"{url}/api/applications", headers=headers)
        applications = list_resp.json()
        
        if len(applications) == 0:
            pytest.skip("No applications available to test")
            
        app_id = applications[0]["id"]
        
        response = requests.get(
            f"{url}/api/applications/{app_id}",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == app_id
        print(f"✓ Got application: {data['first_name']} {data['last_name']} - {data['status']}")
        
    def test_application_not_found(self):
        """Test 404 for non-existent application"""
        headers, url = self.get_auth_header()
        
        response = requests.get(
            f"{url}/api/applications/nonexistent-id-12345",
            headers=headers
        )
        
        assert response.status_code == 404
        print(f"✓ Non-existent application returns 404")


class TestApplicationApprovalRejection:
    """Test application approval and rejection flow"""
    
    def get_auth_header(self):
        """Get authentication header"""
        try:
            r = requests.get(f"{BASE_URL}/api", timeout=5)
            url = BASE_URL if r.status_code == 200 else LOCAL_URL
        except:
            url = LOCAL_URL
            
        login_resp = requests.post(
            f"{url}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login_resp.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}, url
    
    def test_approve_pending_application(self):
        """Test approving a pending application creates user and sends email"""
        headers, url = self.get_auth_header()
        
        # Find a pending application
        list_resp = requests.get(
            f"{url}/api/applications?status=pending",
            headers=headers
        )
        pending_apps = list_resp.json()
        
        if len(pending_apps) == 0:
            print("⚠ No pending applications to test approval - skipping")
            pytest.skip("No pending applications available for approval test")
            
        app_id = pending_apps[0]["id"]
        app_email = pending_apps[0]["email"]
        
        # Approve the application
        response = requests.post(
            f"{url}/api/applications/{app_id}/approve",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "student_email" in data
        assert data["student_email"] == app_email
        
        print(f"✓ Application approved for {app_email}")
        print(f"  Message: {data['message']}")
        
        # Verify the application status changed
        verify_resp = requests.get(
            f"{url}/api/applications/{app_id}",
            headers=headers
        )
        verified = verify_resp.json()
        assert verified["status"] == "approved"
        print(f"✓ Application status verified as 'approved'")
        
    def test_reject_pending_application(self):
        """Test rejecting a pending application"""
        headers, url = self.get_auth_header()
        
        # Find a pending application
        list_resp = requests.get(
            f"{url}/api/applications?status=pending",
            headers=headers
        )
        pending_apps = list_resp.json()
        
        if len(pending_apps) == 0:
            print("⚠ No pending applications to test rejection - skipping")
            pytest.skip("No pending applications available for rejection test")
            
        app_id = pending_apps[0]["id"]
        
        # Reject the application
        response = requests.post(
            f"{url}/api/applications/{app_id}/reject",
            headers=headers,
            json={"reason": "TEST rejection - documents incomplete"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        
        print(f"✓ Application rejected")
        
        # Verify the application status changed
        verify_resp = requests.get(
            f"{url}/api/applications/{app_id}",
            headers=headers
        )
        verified = verify_resp.json()
        assert verified["status"] == "rejected"
        assert verified.get("rejection_reason") == "TEST rejection - documents incomplete"
        print(f"✓ Application status verified as 'rejected'")
        
    def test_approve_non_pending_returns_error(self):
        """Test that approving non-pending application returns error"""
        headers, url = self.get_auth_header()
        
        # Find a non-pending application
        list_resp = requests.get(f"{url}/api/applications", headers=headers)
        all_apps = list_resp.json()
        
        non_pending = [a for a in all_apps if a["status"] != "pending"]
        
        if len(non_pending) == 0:
            pytest.skip("No non-pending applications to test")
            
        app_id = non_pending[0]["id"]
        
        response = requests.post(
            f"{url}/api/applications/{app_id}/approve",
            headers=headers
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"✓ Non-pending approval blocked: {data['detail']}")


class TestRoles:
    """Test roles and permissions endpoints"""
    
    def get_auth_header(self):
        """Get authentication header"""
        try:
            r = requests.get(f"{BASE_URL}/api", timeout=5)
            url = BASE_URL if r.status_code == 200 else LOCAL_URL
        except:
            url = LOCAL_URL
            
        login_resp = requests.post(
            f"{url}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login_resp.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}, url
    
    def test_get_available_roles(self):
        """Test fetching available roles"""
        headers, url = self.get_auth_header()
        
        response = requests.get(
            f"{url}/api/roles",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Validate role structure
        expected_roles = ["admin", "registrar", "lecturer", "staff", "student"]
        role_ids = [r["id"] for r in data]
        
        for role in expected_roles:
            assert role in role_ids, f"Missing role: {role}"
            
        # Validate each role has required fields
        for role in data:
            assert "id" in role
            assert "name" in role
            assert "description" in role
            assert "permissions" in role
            
        print(f"✓ Available roles: {', '.join(role_ids)}")
        
    def test_roles_requires_admin(self):
        """Test that roles endpoint requires admin role"""
        try:
            r = requests.get(f"{BASE_URL}/api", timeout=5)
            url = BASE_URL if r.status_code == 200 else LOCAL_URL
        except:
            url = LOCAL_URL
            
        response = requests.get(f"{url}/api/roles")
        
        assert response.status_code == 401
        print(f"✓ Roles endpoint requires authentication")


class TestUserRoleUpdate:
    """Test user role update functionality"""
    
    def get_auth_header(self):
        """Get authentication header"""
        try:
            r = requests.get(f"{BASE_URL}/api", timeout=5)
            url = BASE_URL if r.status_code == 200 else LOCAL_URL
        except:
            url = LOCAL_URL
            
        login_resp = requests.post(
            f"{url}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login_resp.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}, url
    
    def test_update_user_role(self):
        """Test updating a user's role"""
        headers, url = self.get_auth_header()
        
        # Get list of users
        users_resp = requests.get(f"{url}/api/users", headers=headers)
        users = users_resp.json()
        
        # Find a non-admin user to update
        test_user = None
        for user in users:
            if user["role"] != "admin" and user.get("id"):
                test_user = user
                break
                
        if not test_user:
            pytest.skip("No non-admin users to test role update")
            
        user_id = test_user["id"]
        original_role = test_user["role"]
        new_role = "staff" if original_role != "staff" else "student"
        
        # Update the role
        response = requests.put(
            f"{url}/api/users/{user_id}/role",
            headers=headers,
            json={"role": new_role, "permissions": ["view_users"]}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == new_role
        
        print(f"✓ User role updated from '{original_role}' to '{new_role}'")
        
        # Revert the role back
        requests.put(
            f"{url}/api/users/{user_id}/role",
            headers=headers,
            json={"role": original_role}
        )
        print(f"✓ Role reverted back to '{original_role}'")
        
    def test_update_role_invalid_role(self):
        """Test that invalid role returns error"""
        headers, url = self.get_auth_header()
        
        # Get any user
        users_resp = requests.get(f"{url}/api/users", headers=headers)
        users = users_resp.json()
        
        if len(users) == 0:
            pytest.skip("No users to test")
            
        user_id = users[0]["id"]
        
        response = requests.put(
            f"{url}/api/users/{user_id}/role",
            headers=headers,
            json={"role": "invalid_role"}
        )
        
        assert response.status_code == 400
        print(f"✓ Invalid role rejected")


class TestLoginLogs:
    """Test login logs endpoint"""
    
    def get_auth_header(self):
        """Get authentication header"""
        try:
            r = requests.get(f"{BASE_URL}/api", timeout=5)
            url = BASE_URL if r.status_code == 200 else LOCAL_URL
        except:
            url = LOCAL_URL
            
        login_resp = requests.post(
            f"{url}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login_resp.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}, url
    
    def test_get_login_logs(self):
        """Test fetching login logs"""
        headers, url = self.get_auth_header()
        
        response = requests.get(
            f"{url}/api/login-logs",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            log = data[0]
            # Validate log structure
            expected_fields = ["user_id", "email", "ip", "location", "timestamp"]
            for field in expected_fields:
                assert field in log, f"Missing field in log: {field}"
                
        print(f"✓ Login logs: {len(data)} entries found")
        
    def test_get_login_logs_with_limit(self):
        """Test fetching login logs with limit"""
        headers, url = self.get_auth_header()
        
        response = requests.get(
            f"{url}/api/login-logs?limit=5",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 5
        print(f"✓ Login logs with limit: {len(data)} entries")
        
    def test_login_logs_requires_admin(self):
        """Test that login logs requires admin role"""
        try:
            r = requests.get(f"{BASE_URL}/api", timeout=5)
            url = BASE_URL if r.status_code == 200 else LOCAL_URL
        except:
            url = LOCAL_URL
            
        response = requests.get(f"{url}/api/login-logs")
        
        assert response.status_code == 401
        print(f"✓ Login logs requires authentication")


class TestPasswordChange:
    """Test password change functionality"""
    
    def get_auth_header(self):
        """Get authentication header"""
        try:
            r = requests.get(f"{BASE_URL}/api", timeout=5)
            url = BASE_URL if r.status_code == 200 else LOCAL_URL
        except:
            url = LOCAL_URL
            
        login_resp = requests.post(
            f"{url}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login_resp.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}, url
    
    def test_change_password_wrong_current(self):
        """Test password change with wrong current password"""
        headers, url = self.get_auth_header()
        
        response = requests.post(
            f"{url}/api/auth/change-password",
            headers=headers,
            json={
                "current_password": "wrongpassword",
                "new_password": "NewPassword123!"
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"✓ Wrong current password rejected: {data['detail']}")
        
    def test_change_password_missing_fields(self):
        """Test password change with missing fields"""
        headers, url = self.get_auth_header()
        
        response = requests.post(
            f"{url}/api/auth/change-password",
            headers=headers,
            json={"current_password": ADMIN_PASSWORD}
        )
        
        assert response.status_code == 422
        print(f"✓ Missing new_password rejected")
        
    def test_forgot_password_endpoint(self):
        """Test forgot password endpoint returns success message"""
        try:
            r = requests.get(f"{BASE_URL}/api", timeout=5)
            url = BASE_URL if r.status_code == 200 else LOCAL_URL
        except:
            url = LOCAL_URL
            
        response = requests.post(
            f"{url}/api/auth/forgot-password",
            json={"email": "test@example.com"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Forgot password: {data['message']}")


class TestUserManagement:
    """Test user CRUD operations"""
    
    def get_auth_header(self):
        """Get authentication header"""
        try:
            r = requests.get(f"{BASE_URL}/api", timeout=5)
            url = BASE_URL if r.status_code == 200 else LOCAL_URL
        except:
            url = LOCAL_URL
            
        login_resp = requests.post(
            f"{url}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login_resp.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}, url
    
    def test_list_users(self):
        """Test listing all users"""
        headers, url = self.get_auth_header()
        
        response = requests.get(f"{url}/api/users", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            user = data[0]
            # Validate user structure (no password field)
            assert "password" not in user
            assert "email" in user
            assert "role" in user
            
        print(f"✓ Users list: {len(data)} users found")
        
    def test_list_users_by_role(self):
        """Test filtering users by role"""
        headers, url = self.get_auth_header()
        
        response = requests.get(
            f"{url}/api/users?role=student",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        for user in data:
            assert user["role"] == "student"
            
        print(f"✓ Filtered users (student): {len(data)} found")
        
    def test_get_single_user(self):
        """Test getting a single user by ID"""
        headers, url = self.get_auth_header()
        
        # Get users list first
        list_resp = requests.get(f"{url}/api/users", headers=headers)
        users = list_resp.json()
        
        if len(users) == 0:
            pytest.skip("No users to test")
            
        user_id = users[0]["id"]
        
        response = requests.get(
            f"{url}/api/users/{user_id}",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
        assert "password" not in data
        print(f"✓ Got user: {data['email']}")


class TestCourses:
    """Test courses endpoints"""
    
    def get_auth_header(self):
        """Get authentication header"""
        try:
            r = requests.get(f"{BASE_URL}/api", timeout=5)
            url = BASE_URL if r.status_code == 200 else LOCAL_URL
        except:
            url = LOCAL_URL
            
        login_resp = requests.post(
            f"{url}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login_resp.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}, url
    
    def test_list_public_courses(self):
        """Test listing public courses (no auth required)"""
        try:
            r = requests.get(f"{BASE_URL}/api", timeout=5)
            url = BASE_URL if r.status_code == 200 else LOCAL_URL
        except:
            url = LOCAL_URL
            
        response = requests.get(f"{url}/api/courses/public")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public courses: {len(data)} courses available")
        
    def test_list_courses_authenticated(self):
        """Test listing courses with authentication"""
        headers, url = self.get_auth_header()
        
        response = requests.get(f"{url}/api/courses", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Authenticated courses list: {len(data)} courses")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
