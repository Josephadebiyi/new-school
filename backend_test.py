#!/usr/bin/env python3
"""
LuminaLMS Backend API Testing Suite
Tests all critical API endpoints for the LMS system
"""

import requests
import json
import sys
from datetime import datetime
import time

class LuminaLMSAPITester:
    def __init__(self, base_url="https://lumina-school.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tokens = {}  # Store tokens for different users
        self.users = {}   # Store user data
        self.test_data = {} # Store created test data
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
            if details:
                print(f"   {details}")
        else:
            print(f"❌ {name}")
            if details:
                print(f"   {details}")
            self.failed_tests.append(name)

    def make_request(self, method, endpoint, data=None, token=None, expected_status=200):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            
            success = response.status_code == expected_status
            return success, response
        except Exception as e:
            print(f"   Request error: {str(e)}")
            return False, None

    def test_system_config(self):
        """Test system configuration endpoints"""
        print("\n🔧 Testing System Configuration...")
        
        # Test GET system config
        success, response = self.make_request('GET', 'system-config')
        self.log_test("GET /api/system-config", success)
        
        if success and response:
            config = response.json()
            print(f"   University: {config.get('university_name', 'N/A')}")

    def test_database_seed(self):
        """Test database seeding"""
        print("\n🌱 Testing Database Seeding...")
        
        success, response = self.make_request('POST', 'seed')
        # Accept both 200 (new seed) and error if already seeded
        self.log_test("POST /api/seed", success or (response and response.status_code in [400]), 
                     f"Status: {response.status_code if response else 'No response'}")

    def test_authentication(self):
        """Test authentication for different user types"""
        print("\n🔐 Testing Authentication...")
        
        # Test credentials from review request
        test_users = [
            {"email": "admin@luminalms.edu", "password": "admin123", "role": "admin"},
            {"email": "lecturer@luminalms.edu", "password": "lecturer123", "role": "lecturer"},
            {"email": "student@luminalms.edu", "password": "student123", "role": "student_paid"},
            {"email": "unpaid@luminalms.edu", "password": "unpaid123", "role": "student_unpaid"}
        ]
        
        for user_creds in test_users:
            success, response = self.make_request('POST', 'auth/login', {
                "email": user_creds["email"],
                "password": user_creds["password"]
            })
            
            if success and response:
                data = response.json()
                self.tokens[user_creds["role"]] = data.get("access_token")
                self.users[user_creds["role"]] = data.get("user")
                self.log_test(f"Login {user_creds['role']}", True, 
                            f"Role: {data.get('user', {}).get('role', 'Unknown')}")
            else:
                self.log_test(f"Login {user_creds['role']}", False, 
                            f"Status: {response.status_code if response else 'No response'}")

    def test_auth_me_endpoints(self):
        """Test /auth/me and access control"""
        print("\n👤 Testing User Profile & Access Control...")
        
        for role, token in self.tokens.items():
            if token:
                # Test /auth/me
                success, response = self.make_request('GET', 'auth/me', token=token)
                self.log_test(f"GET /auth/me ({role})", success)
                
                if success and response:
                    user_data = response.json()
                    access_info = user_data.get('access', {})
                    print(f"   Access allowed: {access_info.get('allowed', True)}")
                    if not access_info.get('allowed'):
                        print(f"   Reason: {access_info.get('reason', 'Unknown')}")

    def test_admin_system_config_update(self):
        """Test system configuration updates (admin only)"""
        print("\n⚙️ Testing System Config Updates...")
        
        admin_token = self.tokens.get("admin")
        if not admin_token:
            self.log_test("System config update", False, "No admin token")
            return
        
        # Test system config update
        config_update = {
            "university_name": "LuminaLMS Test University",
            "primary_color": "#1a237e",
            "support_email": "test@luminalms.edu"
        }
        
        success, response = self.make_request('PUT', 'system-config', config_update, admin_token)
        self.log_test("PUT /api/system-config", success)

    def test_user_management(self):
        """Test user management endpoints"""
        print("\n👥 Testing User Management...")
        
        admin_token = self.tokens.get("admin")
        if not admin_token:
            self.log_test("User management", False, "No admin token")
            return
        
        # Test get users
        success, response = self.make_request('GET', 'users', token=admin_token)
        self.log_test("GET /api/users", success)
        
        if success and response:
            users = response.json()
            print(f"   Total users: {len(users)}")
            
            # Find a student to test lock/unlock
            student_user = next((u for u in users if u.get('role') == 'student'), None)
            if student_user:
                user_id = student_user['id']
                
                # Test lock user
                success, response = self.make_request('PUT', f'users/{user_id}/lock', token=admin_token)
                self.log_test(f"PUT /api/users/{user_id}/lock", success)
                
                # Test unlock user
                success, response = self.make_request('PUT', f'users/{user_id}/unlock', token=admin_token)
                self.log_test(f"PUT /api/users/{user_id}/unlock", success)

    def test_admissions_flow(self):
        """Test admissions management"""
        print("\n🎓 Testing Admissions Flow...")
        
        admin_token = self.tokens.get("admin")
        if not admin_token:
            self.log_test("Admissions flow", False, "No admin token")
            return
        
        # Test get admissions
        success, response = self.make_request('GET', 'admissions', token=admin_token)
        self.log_test("GET /api/admissions", success)
        
        # Create test admission application
        test_admission = {
            "first_name": "Test",
            "last_name": "Student", 
            "email": f"testadmission{int(time.time())}@example.com",
            "phone": "+2341234567890",
            "program": "BSc. Computer Science",
            "department": "Computer Science"
        }
        
        success, response = self.make_request('POST', 'admissions/apply', test_admission)
        self.log_test("POST /api/admissions/apply", success)
        
        if success and response:
            admission_data = response.json()
            admission_id = admission_data.get('id')
            self.test_data['admission_id'] = admission_id
            
            # Test grant admission
            success, response = self.make_request('PUT', f'admissions/{admission_id}/grant', token=admin_token)
            self.log_test(f"PUT /api/admissions/{admission_id}/grant", success)
            
            if success and response:
                grant_data = response.json()
                print(f"   Created student ID: {grant_data.get('student_id', 'N/A')}")

    def test_payment_management(self):
        """Test payment/transaction management"""
        print("\n💰 Testing Payment Management...")
        
        admin_token = self.tokens.get("admin")
        if not admin_token:
            self.log_test("Payment management", False, "No admin token")
            return
        
        # Test get transactions
        success, response = self.make_request('GET', 'transactions', token=admin_token)
        self.log_test("GET /api/transactions", success)
        
        # Find an unpaid student for payment test
        unpaid_student = self.users.get('student_unpaid')
        if unpaid_student:
            # Create a transaction
            transaction_data = {
                "student_id": unpaid_student['id'],
                "amount": 500000.00,
                "description": "Tuition Fee - Semester 1",
                "payment_type": "tuition",
                "semester": 1
            }
            
            success, response = self.make_request('POST', 'transactions', transaction_data, admin_token)
            self.log_test("POST /api/transactions", success)
            
            if success and response:
                transaction = response.json()
                transaction_id = transaction.get('id')
                
                # Test confirm payment
                success, response = self.make_request('PUT', f'transactions/{transaction_id}/confirm', token=admin_token)
                self.log_test(f"PUT /api/transactions/{transaction_id}/confirm", success)

    def test_course_management(self):
        """Test course and module management"""
        print("\n📚 Testing Course Management...")
        
        admin_token = self.tokens.get("admin")
        lecturer_token = self.tokens.get("lecturer")
        
        # Test get courses (any authenticated user)
        for role, token in [("admin", admin_token), ("lecturer", lecturer_token)]:
            if token:
                success, response = self.make_request('GET', 'courses', token=token)
                self.log_test(f"GET /api/courses ({role})", success)
                break

    def test_dashboard_stats(self):
        """Test dashboard statistics for different roles"""
        print("\n📊 Testing Dashboard Stats...")
        
        for role, token in self.tokens.items():
            if token:
                success, response = self.make_request('GET', 'dashboard/stats', token=token)
                self.log_test(f"GET /api/dashboard/stats ({role})", success)
                
                if success and response:
                    stats = response.json()
                    if role == "admin":
                        print(f"   Total students: {stats.get('total_students', 0)}")
                        print(f"   Locked accounts: {stats.get('locked_accounts', 0)}")
                        print(f"   Unpaid students: {stats.get('unpaid_students', 0)}")

    def test_access_control(self):
        """Test access control for unpaid/locked accounts"""
        print("\n🔒 Testing Access Control...")
        
        # Test unpaid student access
        unpaid_token = self.tokens.get('student_unpaid')
        if unpaid_token:
            success, response = self.make_request('GET', 'auth/check-access', token=unpaid_token)
            self.log_test("Access check - unpaid student", success)
            
            if success and response:
                access = response.json()
                print(f"   Access allowed: {access.get('allowed', True)}")
                print(f"   Reason: {access.get('reason', 'None')}")

    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 LuminaLMS Backend API Test Suite")
        print("=" * 50)
        
        # Test sequence
        self.test_database_seed()
        time.sleep(1)  # Allow seeding to complete
        
        self.test_system_config()
        self.test_authentication()
        self.test_auth_me_endpoints()
        self.test_admin_system_config_update()
        self.test_user_management()
        self.test_admissions_flow()
        self.test_payment_management()
        self.test_course_management()
        self.test_dashboard_stats()
        self.test_access_control()
        
        # Final report
        print("\n" + "=" * 50)
        print("📋 TEST SUMMARY")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {len(self.failed_tests)}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print("\n❌ Failed tests:")
            for test in self.failed_tests:
                print(f"  - {test}")
        
        return len(self.failed_tests) == 0

def main():
    tester = LuminaLMSAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())