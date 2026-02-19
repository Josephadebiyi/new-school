"""
GITB LMS Two-Stage Payment System Tests
Tests for:
1. Login endpoints (admin and student)
2. Application creation with Stripe checkout URL
3. Stripe webhook for registration fee
4. Admin approval creating enrollment with pending_payment status
5. /api/my-courses endpoint returning enrollment status
6. /api/tuition/pay endpoint returning Stripe checkout URL
7. /api/tuition/status endpoint
8. Tuition payment webhook unlocking course
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

# Base URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
LOCAL_URL = "http://localhost:8001"

# Test credentials
ADMIN_EMAIL = "taiwojos2@yahoo.com"
ADMIN_PASSWORD = "Passw0rd@1"
STUDENT_EMAIL = "student@gitb.lt"
STUDENT_PASSWORD = "TestStudent@1"


def get_working_url():
    """Get working base URL"""
    try:
        r = requests.get(f"{LOCAL_URL}/api", timeout=5)
        if r.status_code == 200:
            return LOCAL_URL
    except:
        pass
    return BASE_URL


class TestLoginEndpoints:
    """Test login endpoints for admin and student"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        url = get_working_url()
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
        
        # Validate admin user data
        user = data["user"]
        assert user["email"] == ADMIN_EMAIL
        assert user["role"] == "admin"
        assert "id" in user
        assert user["is_active"] == True
        
        print(f"✓ Admin login successful: {user['email']} (role: {user['role']})")
        
    def test_student_login_success(self):
        """Test student login with valid credentials"""
        url = get_working_url()
        response = requests.post(
            f"{url}/api/auth/login",
            json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "access_token" in data
        assert "user" in data
        
        # Validate student user data
        user = data["user"]
        assert user["email"] == STUDENT_EMAIL
        assert user["role"] == "student"
        assert "student_id" in user
        assert "payment_status" in user
        
        print(f"✓ Student login successful: {user['email']} (student_id: {user.get('student_id')})")


class TestApplicationCreation:
    """Test application creation with Stripe checkout URL"""
    
    def test_application_create_returns_stripe_checkout(self):
        """Test that application creation returns Stripe checkout URL"""
        url = get_working_url()
        
        # First get a course ID
        courses_resp = requests.get(f"{url}/api/courses/public")
        courses = courses_resp.json()
        assert len(courses) > 0, "No courses available"
        course_id = courses[0]["id"]
        
        # Create application
        unique_email = f"test_app_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(
            f"{url}/api/applications/create",
            json={
                "first_name": "TEST_Application",
                "last_name": "TEST_User",
                "email": unique_email,
                "phone": "+1234567890",
                "course_id": course_id,
                "origin_url": "https://gitb.lt"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate checkout URL returned
        assert "checkout_url" in data, "Missing checkout_url"
        assert "session_id" in data, "Missing session_id"
        assert "application_id" in data, "Missing application_id"
        
        # Validate checkout URL is Stripe
        assert "checkout.stripe.com" in data["checkout_url"], "Invalid Stripe checkout URL"
        
        print(f"✓ Application created with Stripe checkout URL")
        print(f"  Application ID: {data['application_id']}")
        print(f"  Session ID: {data['session_id']}")
        
        return data


class TestStripeWebhook:
    """Test Stripe webhook for registration fee and tuition payment"""
    
    def get_admin_token(self):
        """Get admin authentication token"""
        url = get_working_url()
        login_resp = requests.post(
            f"{url}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        return login_resp.json()["access_token"], url
    
    def test_webhook_updates_application_to_pending(self):
        """Test that webhook updates application from pending_payment to pending"""
        url = get_working_url()
        token, _ = self.get_admin_token()
        
        # First create a new application
        courses_resp = requests.get(f"{url}/api/courses/public")
        courses = courses_resp.json()
        course_id = courses[0]["id"]
        
        unique_email = f"test_webhook_{uuid.uuid4().hex[:8]}@test.com"
        create_resp = requests.post(
            f"{url}/api/applications/create",
            json={
                "first_name": "TEST_Webhook",
                "last_name": "TEST_User",
                "email": unique_email,
                "course_id": course_id
            }
        )
        app_data = create_resp.json()
        app_id = app_data["application_id"]
        
        # Verify initial status is pending_payment
        app_resp = requests.get(
            f"{url}/api/applications/{app_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert app_resp.json()["status"] == "pending_payment"
        
        # Simulate webhook for registration fee payment
        webhook_resp = requests.post(
            f"{url}/api/webhooks/stripe",
            json={
                "type": "checkout.session.completed",
                "data": {
                    "object": {
                        "id": app_data["session_id"],
                        "payment_status": "paid",
                        "metadata": {
                            "application_id": app_id,
                            "email": unique_email
                        }
                    }
                }
            }
        )
        
        assert webhook_resp.status_code == 200
        assert webhook_resp.json()["received"] == True
        
        # Verify application status changed to pending
        verify_resp = requests.get(
            f"{url}/api/applications/{app_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        verified = verify_resp.json()
        
        assert verified["status"] == "pending", f"Expected pending, got {verified['status']}"
        assert verified["payment_status"] == "paid"
        
        print(f"✓ Webhook updated application to pending status")
        
        return app_id


class TestApprovalFlow:
    """Test admin approval creates enrollment with pending_payment status"""
    
    def get_admin_token(self):
        """Get admin authentication token"""
        url = get_working_url()
        login_resp = requests.post(
            f"{url}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        return login_resp.json()["access_token"], url
    
    def test_approval_creates_enrollment_with_pending_payment(self):
        """Test that approving application creates enrollment with pending_payment status"""
        token, url = self.get_admin_token()
        
        # Create and pay for application
        courses_resp = requests.get(f"{url}/api/courses/public")
        courses = courses_resp.json()
        course_id = courses[0]["id"]
        course_price = courses[0].get("price", 0)
        
        unique_email = f"test_approval_{uuid.uuid4().hex[:8]}@test.com"
        create_resp = requests.post(
            f"{url}/api/applications/create",
            json={
                "first_name": "TEST_Approval",
                "last_name": "TEST_User",
                "email": unique_email,
                "course_id": course_id
            }
        )
        app_data = create_resp.json()
        app_id = app_data["application_id"]
        
        # Simulate registration fee payment
        requests.post(
            f"{url}/api/webhooks/stripe",
            json={
                "type": "checkout.session.completed",
                "data": {
                    "object": {
                        "id": app_data["session_id"],
                        "payment_status": "paid",
                        "metadata": {
                            "application_id": app_id,
                            "email": unique_email
                        }
                    }
                }
            }
        )
        
        # Approve the application
        approve_resp = requests.post(
            f"{url}/api/applications/{app_id}/approve",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert approve_resp.status_code == 200
        data = approve_resp.json()
        
        # Verify response
        assert "message" in data
        assert "student_email" in data
        assert "tuition_amount" in data
        assert data["tuition_amount"] == course_price
        
        # Verify enrollment created with pending_payment
        enrollments_resp = requests.get(
            f"{url}/api/enrollments",
            headers={"Authorization": f"Bearer {token}"}
        )
        enrollments = enrollments_resp.json()
        
        # Find the enrollment for this application
        enrollment = next((e for e in enrollments if e.get("application_id") == app_id), None)
        
        assert enrollment is not None, "Enrollment not created"
        assert enrollment["status"] == "pending_payment", f"Expected pending_payment, got {enrollment['status']}"
        assert enrollment["payment_status"] == "unpaid"
        assert enrollment["tuition_amount"] == course_price
        
        print(f"✓ Approval created enrollment with pending_payment status")
        print(f"  Tuition amount: €{course_price}")
        
        return enrollment["id"], enrollment["user_id"]


class TestMyCoursesEndpoint:
    """Test /api/my-courses endpoint returns student's courses with enrollment status"""
    
    def test_my_courses_returns_enrollment_status(self):
        """Test that /api/my-courses returns courses with enrollment status"""
        url = get_working_url()
        
        # Login as student
        login_resp = requests.post(
            f"{url}/api/auth/login",
            json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD}
        )
        token = login_resp.json()["access_token"]
        
        # Get my courses
        response = requests.get(
            f"{url}/api/my-courses",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        courses = response.json()
        assert isinstance(courses, list)
        
        if len(courses) > 0:
            course = courses[0]
            
            # Validate course structure includes enrollment info
            assert "enrollment_id" in course, "Missing enrollment_id"
            assert "enrollment_status" in course, "Missing enrollment_status"
            assert "payment_status" in course, "Missing payment_status"
            
            # Validate enrollment status is valid
            valid_statuses = ["pending_payment", "paid", "active"]
            assert course["enrollment_status"] in valid_statuses, f"Invalid status: {course['enrollment_status']}"
            
            print(f"✓ My courses returned with enrollment status")
            print(f"  Course: {course.get('title', 'N/A')}")
            print(f"  Enrollment status: {course['enrollment_status']}")
            print(f"  Payment status: {course['payment_status']}")
        else:
            print(f"⚠ No courses enrolled for student")


class TestTuitionPaymentEndpoint:
    """Test /api/tuition/pay endpoint returns Stripe checkout URL"""
    
    def test_tuition_pay_returns_stripe_checkout(self):
        """Test that /api/tuition/pay returns Stripe checkout URL for tuition"""
        url = get_working_url()
        
        # Login as student
        login_resp = requests.post(
            f"{url}/api/auth/login",
            json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD}
        )
        token = login_resp.json()["access_token"]
        
        # Get my courses first to find a course with pending payment
        courses_resp = requests.get(
            f"{url}/api/my-courses",
            headers={"Authorization": f"Bearer {token}"}
        )
        courses = courses_resp.json()
        
        # Find a course with pending_payment status
        pending_course = next((c for c in courses if c.get("enrollment_status") == "pending_payment"), None)
        
        if pending_course is None:
            # If no pending payment, use any course for testing
            if len(courses) > 0:
                course_id = courses[0]["id"]
            else:
                pytest.skip("No courses available for tuition test")
        else:
            course_id = pending_course["id"]
        
        # Request tuition payment
        response = requests.post(
            f"{url}/api/tuition/pay",
            headers={"Authorization": f"Bearer {token}"},
            json={"course_id": course_id}
        )
        
        # Handle already paid case
        if response.status_code == 400:
            data = response.json()
            if "already paid" in data.get("detail", "").lower():
                print(f"✓ Tuition already paid for this course")
                return
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate response
        assert "checkout_url" in data, "Missing checkout_url"
        assert "session_id" in data, "Missing session_id"
        assert "enrollment_id" in data, "Missing enrollment_id"
        assert "course_title" in data, "Missing course_title"
        assert "amount" in data, "Missing amount"
        
        # Validate checkout URL is Stripe
        assert "checkout.stripe.com" in data["checkout_url"], "Invalid Stripe checkout URL"
        
        print(f"✓ Tuition payment returns Stripe checkout URL")
        print(f"  Course: {data['course_title']}")
        print(f"  Amount: €{data['amount']}")


class TestTuitionStatusEndpoint:
    """Test /api/tuition/status/:sessionId endpoint"""
    
    def test_tuition_status_returns_payment_status(self):
        """Test that /api/tuition/status returns payment status"""
        url = get_working_url()
        
        # Login as student
        login_resp = requests.post(
            f"{url}/api/auth/login",
            json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD}
        )
        token = login_resp.json()["access_token"]
        
        # First create a tuition payment session
        courses_resp = requests.get(
            f"{url}/api/my-courses",
            headers={"Authorization": f"Bearer {token}"}
        )
        courses = courses_resp.json()
        
        if len(courses) == 0:
            pytest.skip("No courses available")
            
        pending_course = next((c for c in courses if c.get("enrollment_status") == "pending_payment"), None)
        
        if pending_course:
            # Create payment session
            pay_resp = requests.post(
                f"{url}/api/tuition/pay",
                headers={"Authorization": f"Bearer {token}"},
                json={"course_id": pending_course["id"]}
            )
            
            if pay_resp.status_code == 200:
                session_id = pay_resp.json()["session_id"]
                
                # Check status
                status_resp = requests.get(
                    f"{url}/api/tuition/status/{session_id}",
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                assert status_resp.status_code == 200
                data = status_resp.json()
                
                assert "status" in data, "Missing status"
                assert "payment_status" in data, "Missing payment_status"
                
                print(f"✓ Tuition status endpoint works")
                print(f"  Status: {data['status']}")
                print(f"  Payment status: {data['payment_status']}")
            else:
                print(f"⚠ Could not create payment session: {pay_resp.json()}")
        else:
            print(f"⚠ No pending payment courses for status test")


class TestTuitionWebhookUnlocksCourse:
    """Test that tuition payment webhook unlocks course (status becomes active)"""
    
    def get_admin_token(self):
        """Get admin authentication token"""
        url = get_working_url()
        login_resp = requests.post(
            f"{url}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        return login_resp.json()["access_token"], url
    
    def test_tuition_webhook_unlocks_course(self):
        """Test full flow: application -> approval -> tuition payment -> course unlocked"""
        token, url = self.get_admin_token()
        
        # Create application
        courses_resp = requests.get(f"{url}/api/courses/public")
        courses = courses_resp.json()
        course_id = courses[0]["id"]
        
        unique_email = f"test_unlock_{uuid.uuid4().hex[:8]}@test.com"
        create_resp = requests.post(
            f"{url}/api/applications/create",
            json={
                "first_name": "TEST_Unlock",
                "last_name": "TEST_User",
                "email": unique_email,
                "course_id": course_id
            }
        )
        app_data = create_resp.json()
        app_id = app_data["application_id"]
        
        # Pay registration fee
        requests.post(
            f"{url}/api/webhooks/stripe",
            json={
                "type": "checkout.session.completed",
                "data": {
                    "object": {
                        "id": app_data["session_id"],
                        "payment_status": "paid",
                        "metadata": {"application_id": app_id}
                    }
                }
            }
        )
        
        # Approve application
        approve_resp = requests.post(
            f"{url}/api/applications/{app_id}/approve",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert approve_resp.status_code == 200
        
        # Get the enrollment ID
        enrollments_resp = requests.get(
            f"{url}/api/enrollments",
            headers={"Authorization": f"Bearer {token}"}
        )
        enrollments = enrollments_resp.json()
        enrollment = next((e for e in enrollments if e.get("application_id") == app_id), None)
        
        assert enrollment is not None
        assert enrollment["status"] == "pending_payment"
        
        enrollment_id = enrollment["id"]
        user_id = enrollment["user_id"]
        
        # Simulate tuition payment webhook
        webhook_resp = requests.post(
            f"{url}/api/webhooks/stripe",
            json={
                "type": "checkout.session.completed",
                "data": {
                    "object": {
                        "id": f"cs_tuition_{uuid.uuid4().hex[:8]}",
                        "payment_status": "paid",
                        "metadata": {
                            "type": "tuition",
                            "enrollment_id": enrollment_id,
                            "course_id": course_id,
                            "user_id": user_id,
                            "user_email": unique_email
                        }
                    }
                }
            }
        )
        
        assert webhook_resp.status_code == 200
        
        # Verify enrollment is now active
        verify_resp = requests.get(
            f"{url}/api/enrollments",
            headers={"Authorization": f"Bearer {token}"}
        )
        enrollments = verify_resp.json()
        updated_enrollment = next((e for e in enrollments if e.get("id") == enrollment_id), None)
        
        assert updated_enrollment is not None
        assert updated_enrollment["status"] == "active", f"Expected active, got {updated_enrollment['status']}"
        assert updated_enrollment["payment_status"] == "paid"
        assert "tuition_paid_at" in updated_enrollment
        
        print(f"✓ Tuition webhook unlocked course successfully")
        print(f"  Enrollment status: {updated_enrollment['status']}")
        print(f"  Payment status: {updated_enrollment['payment_status']}")
        print(f"  Tuition paid at: {updated_enrollment['tuition_paid_at']}")


class TestEdgeCases:
    """Test edge cases and error handling"""
    
    def test_tuition_pay_requires_auth(self):
        """Test that tuition pay requires authentication"""
        url = get_working_url()
        
        response = requests.post(
            f"{url}/api/tuition/pay",
            json={"course_id": "some-id"}
        )
        
        assert response.status_code == 401
        print(f"✓ Tuition pay requires authentication")
        
    def test_tuition_pay_requires_course_id(self):
        """Test that tuition pay requires course_id"""
        url = get_working_url()
        
        # Login as student
        login_resp = requests.post(
            f"{url}/api/auth/login",
            json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD}
        )
        token = login_resp.json()["access_token"]
        
        response = requests.post(
            f"{url}/api/tuition/pay",
            headers={"Authorization": f"Bearer {token}"},
            json={}
        )
        
        assert response.status_code == 422
        print(f"✓ Tuition pay requires course_id")
        
    def test_my_courses_requires_auth(self):
        """Test that my-courses requires authentication"""
        url = get_working_url()
        
        response = requests.get(f"{url}/api/my-courses")
        
        assert response.status_code == 401
        print(f"✓ My courses requires authentication")
        
    def test_application_duplicate_rejected(self):
        """Test that duplicate application for same course is rejected"""
        url = get_working_url()
        
        courses_resp = requests.get(f"{url}/api/courses/public")
        courses = courses_resp.json()
        course_id = courses[0]["id"]
        
        # Use existing student email
        response = requests.post(
            f"{url}/api/applications/create",
            json={
                "first_name": "Test",
                "last_name": "Student",
                "email": STUDENT_EMAIL,
                "course_id": course_id
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "already" in data["detail"].lower()
        print(f"✓ Duplicate application rejected: {data['detail']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
