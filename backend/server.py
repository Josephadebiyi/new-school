from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'uni-lms-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI(title="University LMS API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class UserRole:
    STUDENT = "student"
    LECTURER = "lecturer"
    ADMIN = "admin"
    REGISTRAR = "registrar"
    FINANCE_OFFICER = "finance_officer"
    ADMISSIONS_OFFICER = "admissions_officer"
    SUPPORT = "support"

# User Models
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: str
    department: Optional[str] = None
    program: Optional[str] = None
    level: Optional[int] = None
    student_id: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None
    program: Optional[str] = None
    level: Optional[int] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: str
    department: Optional[str] = None
    program: Optional[str] = None
    level: Optional[int] = None
    student_id: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool

# Auth Models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Course Models
class CourseContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content_type: str  # video, pdf, document, link
    url: Optional[str] = None
    description: Optional[str] = None
    order: int = 0

class CourseCreate(BaseModel):
    code: str
    title: str
    description: Optional[str] = None
    department: str
    level: int
    units: int
    semester: int  # 1 or 2
    course_type: str = "CORE"  # CORE or ELECTIVE
    lecturer_id: Optional[str] = None
    image_url: Optional[str] = None

class Course(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    title: str
    description: Optional[str] = None
    department: str
    level: int
    units: int
    semester: int
    course_type: str = "CORE"
    lecturer_id: Optional[str] = None
    image_url: Optional[str] = None
    content: List[CourseContent] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Enrollment Models
class EnrollmentCreate(BaseModel):
    student_id: str
    course_id: str

class Enrollment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    course_id: str
    status: str = "enrolled"  # enrolled, completed, dropped
    enrolled_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None

# Grade Models
class GradeCreate(BaseModel):
    enrollment_id: str
    score: float
    grade_letter: str  # A, B, C, D, E, F
    grade_point: float

class Grade(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    enrollment_id: str
    student_id: str
    course_id: str
    score: float
    grade_letter: str
    grade_point: float
    semester: int
    academic_year: str
    entered_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Payment Models
class PaymentCreate(BaseModel):
    student_id: str
    amount: float
    description: str
    payment_type: str  # tuition, registration, exam, other

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    amount: float
    description: str
    payment_type: str
    status: str = "pending"  # pending, paid, overdue
    due_date: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Admission Models
class AdmissionCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    program: str
    department: str

class Admission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    first_name: str
    last_name: str
    email: str
    phone: str
    program: str
    department: str
    status: str = "pending"  # pending, under_review, interview, accepted, declined
    documents: List[dict] = []
    notes: List[dict] = []
    reviewed_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Live Class Models
class LiveClassCreate(BaseModel):
    course_id: str
    title: str
    scheduled_at: datetime
    duration_minutes: int = 60
    meeting_url: Optional[str] = None

class LiveClass(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    course_id: str
    title: str
    scheduled_at: datetime
    duration_minutes: int = 60
    meeting_url: Optional[str] = None
    status: str = "scheduled"  # scheduled, ongoing, completed, cancelled
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Assessment Models
class AssessmentCreate(BaseModel):
    course_id: str
    title: str
    assessment_type: str  # quiz, assignment, exam
    total_marks: float
    due_date: Optional[datetime] = None
    instructions: Optional[str] = None

class Assessment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    course_id: str
    title: str
    assessment_type: str
    total_marks: float
    due_date: Optional[datetime] = None
    instructions: Optional[str] = None
    is_active: bool = True
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============== HELPER FUNCTIONS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(user_id: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {"sub": user_id, "role": role, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_roles(allowed_roles: List[str]):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

def serialize_doc(doc: dict) -> dict:
    """Remove MongoDB _id and convert datetime to ISO string"""
    if doc is None:
        return None
    result = {k: v for k, v in doc.items() if k != "_id"}
    for key, value in result.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
    return result

# ============== AUTH ENDPOINTS ==============

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user = await db.users.find_one({"email": request.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(request.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account is inactive")
    
    token = create_access_token(user["id"], user["role"])
    user_response = {k: v for k, v in user.items() if k != "password"}
    
    return LoginResponse(access_token=token, user=UserResponse(**user_response))

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

# ============== USER ENDPOINTS ==============

@api_router.get("/users", response_model=List[UserResponse])
async def get_users(
    role: Optional[str] = None,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.REGISTRAR]))
):
    query = {}
    if role:
        query["role"] = role
    users = await db.users.find(query, {"_id": 0, "password": 0}).to_list(1000)
    return [UserResponse(**u) for u in users]

@api_router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.ADMISSIONS_OFFICER]))
):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user_data.model_dump()
    user_dict["password"] = hash_password(user_dict["password"])
    user_dict["id"] = str(uuid.uuid4())
    user_dict["is_active"] = True
    user_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    if user_data.role == UserRole.STUDENT:
        count = await db.users.count_documents({"role": UserRole.STUDENT})
        user_dict["student_id"] = f"STU{datetime.now().year}{count + 1:05d}"
    
    await db.users.insert_one(user_dict)
    user_dict.pop("password", None)
    user_dict.pop("_id", None)
    return UserResponse(**user_dict)

@api_router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in [UserRole.ADMIN, UserRole.REGISTRAR] and current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)

@api_router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.REGISTRAR]))
):
    update_dict = {k: v for k, v in user_data.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.users.update_one({"id": user_id}, {"$set": update_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    return UserResponse(**user)

@api_router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_roles([UserRole.ADMIN]))
):
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

# ============== COURSE ENDPOINTS ==============

@api_router.get("/courses", response_model=List[Course])
async def get_courses(
    department: Optional[str] = None,
    level: Optional[int] = None,
    semester: Optional[int] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"is_active": True}
    if department:
        query["department"] = department
    if level:
        query["level"] = level
    if semester:
        query["semester"] = semester
    
    courses = await db.courses.find(query, {"_id": 0}).to_list(1000)
    return [Course(**serialize_doc(c)) for c in courses]

@api_router.post("/courses", response_model=Course)
async def create_course(
    course_data: CourseCreate,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.REGISTRAR]))
):
    existing = await db.courses.find_one({"code": course_data.code})
    if existing:
        raise HTTPException(status_code=400, detail="Course code already exists")
    
    course_dict = course_data.model_dump()
    course_dict["id"] = str(uuid.uuid4())
    course_dict["content"] = []
    course_dict["is_active"] = True
    course_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.courses.insert_one(course_dict)
    course_dict.pop("_id", None)
    return Course(**course_dict)

@api_router.get("/courses/{course_id}", response_model=Course)
async def get_course(course_id: str, current_user: dict = Depends(get_current_user)):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return Course(**serialize_doc(course))

@api_router.put("/courses/{course_id}", response_model=Course)
async def update_course(
    course_id: str,
    course_data: CourseCreate,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.REGISTRAR, UserRole.LECTURER]))
):
    update_dict = course_data.model_dump()
    result = await db.courses.update_one({"id": course_id}, {"$set": update_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    return Course(**serialize_doc(course))

@api_router.post("/courses/{course_id}/content")
async def add_course_content(
    course_id: str,
    content: CourseContent,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.LECTURER]))
):
    content_dict = content.model_dump()
    result = await db.courses.update_one(
        {"id": course_id},
        {"$push": {"content": content_dict}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Content added successfully"}

# ============== ENROLLMENT ENDPOINTS ==============

@api_router.get("/enrollments")
async def get_enrollments(
    student_id: Optional[str] = None,
    course_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if current_user["role"] == UserRole.STUDENT:
        query["student_id"] = current_user["id"]
    elif student_id:
        query["student_id"] = student_id
    if course_id:
        query["course_id"] = course_id
    
    enrollments = await db.enrollments.find(query, {"_id": 0}).to_list(1000)
    
    # Enrich with course data
    for enrollment in enrollments:
        course = await db.courses.find_one({"id": enrollment["course_id"]}, {"_id": 0})
        if course:
            enrollment["course"] = serialize_doc(course)
    
    return enrollments

@api_router.post("/enrollments")
async def create_enrollment(
    enrollment_data: EnrollmentCreate,
    current_user: dict = Depends(get_current_user)
):
    # Students can only enroll themselves
    if current_user["role"] == UserRole.STUDENT and enrollment_data.student_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Cannot enroll other students")
    
    # Check if already enrolled
    existing = await db.enrollments.find_one({
        "student_id": enrollment_data.student_id,
        "course_id": enrollment_data.course_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    
    enrollment_dict = enrollment_data.model_dump()
    enrollment_dict["id"] = str(uuid.uuid4())
    enrollment_dict["status"] = "enrolled"
    enrollment_dict["enrolled_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.enrollments.insert_one(enrollment_dict)
    enrollment_dict.pop("_id", None)
    return enrollment_dict

@api_router.put("/enrollments/{enrollment_id}/complete")
async def complete_enrollment(
    enrollment_id: str,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.REGISTRAR, UserRole.LECTURER]))
):
    result = await db.enrollments.update_one(
        {"id": enrollment_id},
        {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return {"message": "Enrollment marked as completed"}

# ============== GRADE ENDPOINTS ==============

@api_router.get("/grades")
async def get_grades(
    student_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if current_user["role"] == UserRole.STUDENT:
        query["student_id"] = current_user["id"]
    elif student_id:
        query["student_id"] = student_id
    
    grades = await db.grades.find(query, {"_id": 0}).to_list(1000)
    
    # Enrich with course data
    for grade in grades:
        course = await db.courses.find_one({"id": grade["course_id"]}, {"_id": 0})
        if course:
            grade["course"] = serialize_doc(course)
    
    return grades

@api_router.post("/grades")
async def create_grade(
    grade_data: GradeCreate,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.LECTURER, UserRole.REGISTRAR]))
):
    # Get enrollment to extract student_id and course_id
    enrollment = await db.enrollments.find_one({"id": grade_data.enrollment_id}, {"_id": 0})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    # Get course for semester info
    course = await db.courses.find_one({"id": enrollment["course_id"]}, {"_id": 0})
    
    grade_dict = grade_data.model_dump()
    grade_dict["id"] = str(uuid.uuid4())
    grade_dict["student_id"] = enrollment["student_id"]
    grade_dict["course_id"] = enrollment["course_id"]
    grade_dict["semester"] = course["semester"] if course else 1
    grade_dict["academic_year"] = f"{datetime.now().year}/{datetime.now().year + 1}"
    grade_dict["entered_by"] = current_user["id"]
    grade_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.grades.insert_one(grade_dict)
    grade_dict.pop("_id", None)
    
    # Mark enrollment as completed
    await db.enrollments.update_one(
        {"id": grade_data.enrollment_id},
        {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return grade_dict

@api_router.get("/results/gpa/{student_id}")
async def get_student_gpa(student_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] == UserRole.STUDENT and current_user["id"] != student_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    grades = await db.grades.find({"student_id": student_id}, {"_id": 0}).to_list(1000)
    
    if not grades:
        return {"cgpa": 0.0, "total_units": 0, "total_courses": 0, "semester_gpas": []}
    
    # Calculate CGPA
    total_points = 0
    total_units = 0
    semester_data = {}
    
    for grade in grades:
        course = await db.courses.find_one({"id": grade["course_id"]}, {"_id": 0})
        if course:
            units = course.get("units", 0)
            total_points += grade["grade_point"] * units
            total_units += units
            
            semester_key = f"{grade['semester']}_{grade['academic_year']}"
            if semester_key not in semester_data:
                semester_data[semester_key] = {"points": 0, "units": 0, "semester": grade["semester"], "year": grade["academic_year"]}
            semester_data[semester_key]["points"] += grade["grade_point"] * units
            semester_data[semester_key]["units"] += units
    
    cgpa = total_points / total_units if total_units > 0 else 0.0
    
    semester_gpas = []
    for key, data in semester_data.items():
        gpa = data["points"] / data["units"] if data["units"] > 0 else 0.0
        semester_gpas.append({
            "semester": data["semester"],
            "academic_year": data["year"],
            "gpa": round(gpa, 2),
            "units": data["units"]
        })
    
    return {
        "cgpa": round(cgpa, 2),
        "total_units": total_units,
        "total_courses": len(grades),
        "semester_gpas": semester_gpas
    }

# ============== PAYMENT ENDPOINTS ==============

@api_router.get("/payments")
async def get_payments(
    student_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if current_user["role"] == UserRole.STUDENT:
        query["student_id"] = current_user["id"]
    elif student_id:
        query["student_id"] = student_id
    if status:
        query["status"] = status
    
    payments = await db.payments.find(query, {"_id": 0}).to_list(1000)
    return [serialize_doc(p) for p in payments]

@api_router.post("/payments")
async def create_payment(
    payment_data: PaymentCreate,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.FINANCE_OFFICER]))
):
    payment_dict = payment_data.model_dump()
    payment_dict["id"] = str(uuid.uuid4())
    payment_dict["status"] = "pending"
    payment_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    payment_dict["due_date"] = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    
    await db.payments.insert_one(payment_dict)
    payment_dict.pop("_id", None)
    return payment_dict

@api_router.put("/payments/{payment_id}/pay")
async def mark_payment_paid(
    payment_id: str,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.FINANCE_OFFICER]))
):
    result = await db.payments.update_one(
        {"id": payment_id},
        {"$set": {"status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"message": "Payment marked as paid"}

@api_router.get("/payments/summary/{student_id}")
async def get_payment_summary(student_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] == UserRole.STUDENT and current_user["id"] != student_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    payments = await db.payments.find({"student_id": student_id}, {"_id": 0}).to_list(1000)
    
    total_due = sum(p["amount"] for p in payments if p["status"] == "pending")
    total_paid = sum(p["amount"] for p in payments if p["status"] == "paid")
    total_overdue = sum(p["amount"] for p in payments if p["status"] == "overdue")
    
    return {
        "total_due": total_due,
        "total_paid": total_paid,
        "total_overdue": total_overdue,
        "outstanding": total_due + total_overdue
    }

# ============== ADMISSION ENDPOINTS ==============

@api_router.get("/admissions")
async def get_admissions(
    status: Optional[str] = None,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.ADMISSIONS_OFFICER]))
):
    query = {}
    if status:
        query["status"] = status
    
    admissions = await db.admissions.find(query, {"_id": 0}).to_list(1000)
    return [serialize_doc(a) for a in admissions]

@api_router.post("/admissions/apply")
async def apply_for_admission(admission_data: AdmissionCreate):
    # Check if email already applied
    existing = await db.admissions.find_one({"email": admission_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Application already exists for this email")
    
    admission_dict = admission_data.model_dump()
    admission_dict["id"] = str(uuid.uuid4())
    admission_dict["status"] = "pending"
    admission_dict["documents"] = []
    admission_dict["notes"] = []
    admission_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.admissions.insert_one(admission_dict)
    admission_dict.pop("_id", None)
    return admission_dict

@api_router.get("/admissions/{admission_id}")
async def get_admission(
    admission_id: str,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.ADMISSIONS_OFFICER]))
):
    admission = await db.admissions.find_one({"id": admission_id}, {"_id": 0})
    if not admission:
        raise HTTPException(status_code=404, detail="Application not found")
    return serialize_doc(admission)

@api_router.put("/admissions/{admission_id}/status")
async def update_admission_status(
    admission_id: str,
    status: str,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.ADMISSIONS_OFFICER]))
):
    valid_statuses = ["pending", "under_review", "interview", "accepted", "declined"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    result = await db.admissions.update_one(
        {"id": admission_id},
        {"$set": {"status": status, "reviewed_by": current_user["id"]}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # If accepted, create user account
    if status == "accepted":
        admission = await db.admissions.find_one({"id": admission_id}, {"_id": 0})
        if admission:
            # Generate student account
            count = await db.users.count_documents({"role": UserRole.STUDENT})
            student_id = f"STU{datetime.now().year}{count + 1:05d}"
            default_password = f"Welcome{datetime.now().year}!"
            
            user_dict = {
                "id": str(uuid.uuid4()),
                "email": admission["email"],
                "password": hash_password(default_password),
                "first_name": admission["first_name"],
                "last_name": admission["last_name"],
                "role": UserRole.STUDENT,
                "department": admission["department"],
                "program": admission["program"],
                "level": 100,
                "student_id": student_id,
                "phone": admission["phone"],
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_dict)
            
            return {
                "message": "Application accepted. Student account created.",
                "student_id": student_id,
                "email": admission["email"],
                "default_password": default_password
            }
    
    return {"message": f"Application status updated to {status}"}

# ============== LIVE CLASS ENDPOINTS ==============

@api_router.get("/live-classes")
async def get_live_classes(
    course_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if course_id:
        query["course_id"] = course_id
    
    classes = await db.live_classes.find(query, {"_id": 0}).to_list(1000)
    
    # Enrich with course data
    for cls in classes:
        course = await db.courses.find_one({"id": cls["course_id"]}, {"_id": 0})
        if course:
            cls["course"] = serialize_doc(course)
    
    return [serialize_doc(c) for c in classes]

@api_router.post("/live-classes")
async def create_live_class(
    class_data: LiveClassCreate,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.LECTURER]))
):
    class_dict = class_data.model_dump()
    class_dict["id"] = str(uuid.uuid4())
    class_dict["status"] = "scheduled"
    class_dict["created_by"] = current_user["id"]
    class_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    class_dict["scheduled_at"] = class_dict["scheduled_at"].isoformat()
    
    await db.live_classes.insert_one(class_dict)
    class_dict.pop("_id", None)
    return class_dict

# ============== ASSESSMENT ENDPOINTS ==============

@api_router.get("/assessments")
async def get_assessments(
    course_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"is_active": True}
    if course_id:
        query["course_id"] = course_id
    
    assessments = await db.assessments.find(query, {"_id": 0}).to_list(1000)
    
    # Enrich with course data
    for assessment in assessments:
        course = await db.courses.find_one({"id": assessment["course_id"]}, {"_id": 0})
        if course:
            assessment["course"] = serialize_doc(course)
    
    return [serialize_doc(a) for a in assessments]

@api_router.post("/assessments")
async def create_assessment(
    assessment_data: AssessmentCreate,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.LECTURER]))
):
    assessment_dict = assessment_data.model_dump()
    assessment_dict["id"] = str(uuid.uuid4())
    assessment_dict["is_active"] = True
    assessment_dict["created_by"] = current_user["id"]
    assessment_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    if assessment_dict.get("due_date"):
        assessment_dict["due_date"] = assessment_dict["due_date"].isoformat()
    
    await db.assessments.insert_one(assessment_dict)
    assessment_dict.pop("_id", None)
    return assessment_dict

# ============== DASHBOARD STATS ==============

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    role = current_user["role"]
    stats = {}
    
    if role == UserRole.STUDENT:
        student_id = current_user["id"]
        enrollments = await db.enrollments.find({"student_id": student_id}, {"_id": 0}).to_list(1000)
        grades = await db.grades.find({"student_id": student_id}, {"_id": 0}).to_list(1000)
        payments = await db.payments.find({"student_id": student_id}, {"_id": 0}).to_list(1000)
        
        completed_courses = len([e for e in enrollments if e["status"] == "completed"])
        outstanding_payments = sum(p["amount"] for p in payments if p["status"] in ["pending", "overdue"])
        
        # Calculate CGPA
        total_points = 0
        total_units = 0
        for grade in grades:
            course = await db.courses.find_one({"id": grade["course_id"]}, {"_id": 0})
            if course:
                units = course.get("units", 0)
                total_points += grade["grade_point"] * units
                total_units += units
        cgpa = total_points / total_units if total_units > 0 else 0.0
        
        stats = {
            "enrolled_courses": len(enrollments),
            "completed_courses": completed_courses,
            "completed_units": total_units,
            "cgpa": round(cgpa, 2),
            "outstanding_payment": outstanding_payments,
            "recent_payments": payments[-5:] if payments else []
        }
    
    elif role == UserRole.LECTURER:
        courses = await db.courses.find({"lecturer_id": current_user["id"]}, {"_id": 0}).to_list(100)
        course_ids = [c["id"] for c in courses]
        
        total_students = 0
        for cid in course_ids:
            count = await db.enrollments.count_documents({"course_id": cid})
            total_students += count
        
        stats = {
            "total_courses": len(courses),
            "total_students": total_students,
            "courses": courses[:5]
        }
    
    elif role == UserRole.ADMIN:
        stats = {
            "total_students": await db.users.count_documents({"role": UserRole.STUDENT}),
            "total_lecturers": await db.users.count_documents({"role": UserRole.LECTURER}),
            "total_courses": await db.courses.count_documents({"is_active": True}),
            "pending_admissions": await db.admissions.count_documents({"status": "pending"}),
            "total_users": await db.users.count_documents({})
        }
    
    elif role == UserRole.FINANCE_OFFICER:
        payments = await db.payments.find({}, {"_id": 0}).to_list(10000)
        stats = {
            "total_collected": sum(p["amount"] for p in payments if p["status"] == "paid"),
            "total_pending": sum(p["amount"] for p in payments if p["status"] == "pending"),
            "total_overdue": sum(p["amount"] for p in payments if p["status"] == "overdue"),
            "recent_payments": [serialize_doc(p) for p in payments[-10:]]
        }
    
    elif role == UserRole.ADMISSIONS_OFFICER:
        stats = {
            "pending_applications": await db.admissions.count_documents({"status": "pending"}),
            "under_review": await db.admissions.count_documents({"status": "under_review"}),
            "accepted": await db.admissions.count_documents({"status": "accepted"}),
            "declined": await db.admissions.count_documents({"status": "declined"})
        }
    
    elif role == UserRole.REGISTRAR:
        stats = {
            "total_students": await db.users.count_documents({"role": UserRole.STUDENT}),
            "total_courses": await db.courses.count_documents({"is_active": True}),
            "total_enrollments": await db.enrollments.count_documents({}),
            "completed_enrollments": await db.enrollments.count_documents({"status": "completed"})
        }
    
    else:
        stats = {"message": "Dashboard stats not available for this role"}
    
    return stats

# ============== SEED DATA ==============

@api_router.post("/seed")
async def seed_database():
    """Seed the database with initial data for testing"""
    
    # Check if already seeded
    admin = await db.users.find_one({"email": "admin@unilms.edu"})
    if admin:
        return {"message": "Database already seeded"}
    
    # Create admin user
    admin_user = {
        "id": str(uuid.uuid4()),
        "email": "admin@unilms.edu",
        "password": hash_password("admin123"),
        "first_name": "System",
        "last_name": "Administrator",
        "role": UserRole.ADMIN,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin_user)
    
    # Create sample lecturer
    lecturer_user = {
        "id": str(uuid.uuid4()),
        "email": "lecturer@unilms.edu",
        "password": hash_password("lecturer123"),
        "first_name": "John",
        "last_name": "Professor",
        "role": UserRole.LECTURER,
        "department": "Public Health",
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(lecturer_user)
    
    # Create sample student
    student_user = {
        "id": str(uuid.uuid4()),
        "email": "student@unilms.edu",
        "password": hash_password("student123"),
        "first_name": "Joseph",
        "last_name": "Ogunsanya",
        "role": UserRole.STUDENT,
        "department": "Public Health",
        "program": "BSc. Public Health",
        "level": 300,
        "student_id": "STU202500001",
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(student_user)
    
    # Create other role users
    other_users = [
        {"email": "registrar@unilms.edu", "password": "registrar123", "first_name": "Academic", "last_name": "Registrar", "role": UserRole.REGISTRAR},
        {"email": "finance@unilms.edu", "password": "finance123", "first_name": "Finance", "last_name": "Officer", "role": UserRole.FINANCE_OFFICER},
        {"email": "admissions@unilms.edu", "password": "admissions123", "first_name": "Admissions", "last_name": "Officer", "role": UserRole.ADMISSIONS_OFFICER},
        {"email": "support@unilms.edu", "password": "support123", "first_name": "Support", "last_name": "Staff", "role": UserRole.SUPPORT},
    ]
    
    for u in other_users:
        user_dict = {
            "id": str(uuid.uuid4()),
            "email": u["email"],
            "password": hash_password(u["password"]),
            "first_name": u["first_name"],
            "last_name": u["last_name"],
            "role": u["role"],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_dict)
    
    # Create sample courses
    courses = [
        {"code": "PHS301", "title": "Public Health Microbiology & Parasitology/Entomology", "department": "Public Health", "level": 300, "units": 2, "semester": 1, "course_type": "CORE", "lecturer_id": lecturer_user["id"], "image_url": "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400"},
        {"code": "PHS311", "title": "Public Health Seminars I", "department": "Public Health", "level": 300, "units": 1, "semester": 1, "course_type": "CORE", "lecturer_id": lecturer_user["id"], "image_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"},
        {"code": "NSC303", "title": "Community/Public Health Nursing I", "department": "Public Health", "level": 300, "units": 2, "semester": 1, "course_type": "CORE", "lecturer_id": lecturer_user["id"], "image_url": "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400"},
        {"code": "PHS303", "title": "Environmental Health and Public Health Laws", "department": "Public Health", "level": 300, "units": 2, "semester": 1, "course_type": "CORE", "lecturer_id": lecturer_user["id"], "image_url": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400"},
        {"code": "PHS313", "title": "Epidemiology of Communicable and Non-Communicable Diseases", "department": "Public Health", "level": 300, "units": 3, "semester": 1, "course_type": "CORE", "lecturer_id": lecturer_user["id"], "image_url": "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400"},
        {"code": "PHS305", "title": "Family and Reproductive Health", "department": "Public Health", "level": 300, "units": 1, "semester": 1, "course_type": "CORE", "lecturer_id": lecturer_user["id"], "image_url": "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400"},
    ]
    
    course_ids = []
    for c in courses:
        course_dict = {
            "id": str(uuid.uuid4()),
            **c,
            "content": [],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.courses.insert_one(course_dict)
        course_ids.append(course_dict["id"])
    
    # Create enrollments for student
    for i, cid in enumerate(course_ids):
        enrollment = {
            "id": str(uuid.uuid4()),
            "student_id": student_user["id"],
            "course_id": cid,
            "status": "completed" if i < 4 else "enrolled",
            "enrolled_at": datetime.now(timezone.utc).isoformat(),
            "completed_at": datetime.now(timezone.utc).isoformat() if i < 4 else None
        }
        await db.enrollments.insert_one(enrollment)
        
        # Add grades for completed courses
        if i < 4:
            course = courses[i]
            grade = {
                "id": str(uuid.uuid4()),
                "enrollment_id": enrollment["id"],
                "student_id": student_user["id"],
                "course_id": cid,
                "score": 85 + i,
                "grade_letter": "A",
                "grade_point": 4.0 + (i * 0.02),
                "semester": 1,
                "academic_year": "2025/2026",
                "entered_by": lecturer_user["id"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.grades.insert_one(grade)
    
    # Create payment records
    payments = [
        {"student_id": student_user["id"], "amount": 315.00, "description": "Installment 1", "payment_type": "tuition", "status": "paid", "paid_at": "2025-09-22T10:00:00Z"},
        {"student_id": student_user["id"], "amount": 315.00, "description": "Installment 2", "payment_type": "tuition", "status": "pending"},
    ]
    
    for p in payments:
        payment_dict = {
            "id": str(uuid.uuid4()),
            **p,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "due_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        }
        await db.payments.insert_one(payment_dict)
    
    # Create sample admission
    admission = {
        "id": str(uuid.uuid4()),
        "first_name": "New",
        "last_name": "Applicant",
        "email": "applicant@example.com",
        "phone": "+234 801 234 5678",
        "program": "BSc. Public Health",
        "department": "Public Health",
        "status": "pending",
        "documents": [],
        "notes": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.admissions.insert_one(admission)
    
    return {
        "message": "Database seeded successfully",
        "credentials": {
            "admin": {"email": "admin@unilms.edu", "password": "admin123"},
            "lecturer": {"email": "lecturer@unilms.edu", "password": "lecturer123"},
            "student": {"email": "student@unilms.edu", "password": "student123"},
            "registrar": {"email": "registrar@unilms.edu", "password": "registrar123"},
            "finance": {"email": "finance@unilms.edu", "password": "finance123"},
            "admissions": {"email": "admissions@unilms.edu", "password": "admissions123"},
            "support": {"email": "support@unilms.edu", "password": "support123"}
        }
    }

# ============== ROOT ENDPOINT ==============

@api_router.get("/")
async def root():
    return {"message": "University LMS API", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
