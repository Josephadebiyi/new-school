"""
Test cases for Forgot Password and Reset Password API endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://learning-hub-297.preview.emergentagent.com').rstrip('/')


class TestForgotPassword:
    """Test Forgot Password API endpoint"""
    
    def test_forgot_password_valid_email(self):
        """Test forgot password with any email - should return success message"""
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={"email": "test@example.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        # Security: Always returns success message even if email doesn't exist
        assert "email" in data["message"].lower() or "sent" in data["message"].lower() or "exists" in data["message"].lower()
        print(f"✓ Forgot password endpoint returns: {data['message']}")
    
    def test_forgot_password_invalid_email_format(self):
        """Test forgot password with invalid email format"""
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={"email": "not-an-email"}
        )
        # Should return 422 for validation error
        assert response.status_code == 422
        print("✓ Invalid email format correctly rejected with 422")
    
    def test_forgot_password_missing_email(self):
        """Test forgot password with missing email"""
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={}
        )
        # Should return 422 for missing required field
        assert response.status_code == 422
        print("✓ Missing email correctly rejected with 422")


class TestResetPassword:
    """Test Reset Password API endpoint"""
    
    def test_reset_password_invalid_token(self):
        """Test reset password with invalid token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            json={
                "token": "invalid-token-12345",
                "new_password": "NewPassword123!"
            }
        )
        # Should return 400 for invalid token
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"✓ Invalid token correctly rejected: {data['detail']}")
    
    def test_reset_password_missing_token(self):
        """Test reset password with missing token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            json={"new_password": "NewPassword123!"}
        )
        # Should return 422 for missing required field
        assert response.status_code == 422
        print("✓ Missing token correctly rejected with 422")
    
    def test_reset_password_missing_password(self):
        """Test reset password with missing password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            json={"token": "some-token"}
        )
        # Should return 422 for missing required field
        assert response.status_code == 422
        print("✓ Missing password correctly rejected with 422")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
