from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query, Response, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import secrets
import string
import random
import io
import base64

# Email with Resend
import resend

# Email Service
from services.email_service import (
    send_application_received_email,
    send_application_approved_email,
    send_application_rejected_email,
    send_forgot_password_email,
    send_password_changed_email,
    send_test_email
)

# PDF Generation
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection with SSL CA certificate handling
import certifi
mongo_url = os.environ['MONGO_URL']
# If using MongoDB Atlas (mongodb+srv), add tlsCAFile for proper SSL
if 'mongodb+srv' in mongo_url or 'mongodb.net' in mongo_url:
    client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
else:
    client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend configuration
resend.api_key = os.environ.get('RESEND_API_KEY', '')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'noreply@gitb.lt')

# Frontend URL for email links
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://gitb-admissions.preview.emergentagent.com')

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'lumina-lms-secret-key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI(title="GITB Student LMS API")
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

class PaymentStatus:
    UNPAID = "unpaid"
    PARTIAL = "partial"
    PAID = "paid"

class AccountStatus:
    ACTIVE = "active"
    LOCKED = "locked"
    EXPELLED = "expelled"

# System Config Model
class SystemConfigUpdate(BaseModel):
    university_name: Optional[str] = None
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    support_email: Optional[str] = None
    support_phone: Optional[str] = None
    # Bank Details
    bank_name: Optional[str] = None
    account_name: Optional[str] = None
    account_number: Optional[str] = None
    iban: Optional[str] = None
    swift_code: Optional[str] = None
    # Login Page Customization
    login_image_url: Optional[str] = None
    login_headline: Optional[str] = None
    login_subtext: Optional[str] = None
    # Fees & Currency
    default_currency: Optional[str] = None
    application_fee: Optional[float] = None
    tuition_fee: Optional[float] = None
    tuition_fee_per: Optional[str] = None

class SystemConfig(BaseModel):
    university_name: str = "GITB - Student LMS"
    logo_url: str = ""
    favicon_url: str = ""
    primary_color: str = "#0F172A"
    secondary_color: str = "#D32F2F"
    support_email: str = ""
    support_phone: str = ""
    # Bank Details
    bank_name: str = ""
    account_name: str = ""
    account_number: str = ""
    iban: str = ""
    swift_code: str = ""
    # Login Page Customization
    login_image_url: str = ""
    login_headline: str = "Learn with"
    login_subtext: str = "Affordable higher education you can take wherever life takes you."
    # Fees & Currency
    default_currency: str = "EUR"
    application_fee: float = 50.0
    tuition_fee: float = 2500.0
    tuition_fee_per: str = "semester"

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
    account_status: Optional[str] = None
    payment_status: Optional[str] = None

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    is_active: bool = True
    account_status: str = AccountStatus.ACTIVE
    payment_status: str = PaymentStatus.UNPAID
    payment_type: str = "full"  # full or semester
    current_semester_paid: Optional[int] = None
    enrolled_courses: List[str] = []
    completed_lessons: List[str] = []
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
    account_status: str = AccountStatus.ACTIVE
    payment_status: str = PaymentStatus.UNPAID

# Auth Models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    system_config: Optional[Dict] = None

# Course Models
class LessonContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content_type: str  # video, pdf, quiz, reading
    url: Optional[str] = None
    duration_seconds: Optional[int] = None
    quiz_data: Optional[Dict] = None
    quiz_attempts_allowed: int = 3
    quiz_passing_score: float = 60.0
    description: Optional[str] = None
    order: int = 0

# Quiz Models
class QuizQuestion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    options: List[str]
    correct_answer: int  # index of correct option
    points: float = 1.0

class QuizCreate(BaseModel):
    lesson_id: str
    questions: List[QuizQuestion]
    time_limit_minutes: Optional[int] = None
    attempts_allowed: int = 3
    passing_score: float = 60.0

class QuizAttempt(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    lesson_id: str
    course_id: str
    answers: List[int]
    score: float
    passed: bool
    attempt_number: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ModuleCreate(BaseModel):
    title: str
    description: Optional[str] = None
    order: int = 0
    lessons: List[LessonContent] = []

class Module(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    course_id: str
    title: str
    description: Optional[str] = None
    order: int = 0
    week_number: Optional[int] = None
    day_number: Optional[int] = None
    lessons: List[LessonContent] = []
    is_active: bool = True

class CourseCreate(BaseModel):
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
    grouping_type: str = "week"  # week or day
    category: Optional[str] = None

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
    grouping_type: str = "week"
    category: Optional[str] = None
    total_lessons: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Enrollment with Progress
class EnrollmentCreate(BaseModel):
    student_id: str
    course_id: str

class Enrollment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    course_id: str
    status: str = "enrolled"
    progress: float = 0.0
    completed_lessons: List[str] = []
    last_lesson_id: Optional[str] = None
    enrolled_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    certificate_generated: bool = False
    certificate_url: Optional[str] = None

# Grade Models
class GradeCreate(BaseModel):
    enrollment_id: str
    score: float
    grade_letter: str
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

# Payment/Transaction Models
class TransactionCreate(BaseModel):
    student_id: str
    amount: float
    description: str
    payment_type: str  # tuition, registration, exam, other
    semester: Optional[int] = None

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    amount: float
    description: str
    payment_type: str
    semester: Optional[int] = None
    status: str = "pending"
    invoice_number: Optional[str] = None
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
    status: str = "pending"
    documents: List[dict] = []
    notes: List[dict] = []
    reviewed_by: Optional[str] = None
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

def generate_password(length=12) -> str:
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_student_id() -> str:
    year = datetime.now().year
    random_part = ''.join(secrets.choice(string.digits) for _ in range(5))
    return f"STU{year}{random_part}"

def generate_invoice_number() -> str:
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_part = ''.join(secrets.choice(string.digits) for _ in range(4))
    return f"INV-{timestamp}-{random_part}"

async def get_system_config() -> dict:
    config = await db.system_config.find_one({}, {"_id": 0})
    if not config:
        default_config = {
            "university_name": "GITB - Student LMS",
            "logo_url": "",
            "favicon_url": "",
            "primary_color": "#0F172A",
            "secondary_color": "#D32F2F",
            "support_email": "",
            "support_phone": ""
        }
        await db.system_config.insert_one(default_config)
        return default_config
    return config

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

def check_access(user: dict) -> dict:
    """Check user access level and return access info"""
    if user.get("account_status") == AccountStatus.EXPELLED:
        return {"allowed": False, "reason": "expelled", "message": "Your account has been expelled. Please contact the Administrator."}
    
    if user.get("account_status") == AccountStatus.LOCKED:
        return {"allowed": False, "reason": "locked", "message": "Limited Access: Please contact the Administrator."}
    
    if user.get("role") == UserRole.STUDENT and user.get("payment_status") == PaymentStatus.UNPAID:
        return {"allowed": False, "reason": "unpaid", "message": "Please complete your payment to access course content."}
    
    return {"allowed": True, "reason": None, "message": None}

def serialize_doc(doc: dict) -> dict:
    if doc is None:
        return None
    result = {k: v for k, v in doc.items() if k != "_id"}
    for key, value in result.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
    return result

# ============== EMAIL SERVICE ==============

async def send_welcome_email(email: str, first_name: str, student_id: str, temp_password: str):
    """Send welcome email with credentials to new student"""
    try:
        config = await get_system_config()
        university_name = config.get("university_name", "GITB - Student LMS")
        
        html_content = f"""
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0F172A; margin: 0;">{university_name}</h1>
            </div>
            
            <h2 style="color: #0F172A;">Welcome, {first_name}!</h2>
            
            <p style="color: #64748B; font-size: 16px; line-height: 1.6;">
                Congratulations! Your admission to {university_name} has been approved. 
                Below are your login credentials:
            </p>
            
            <div style="background: #F8FAFC; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Student ID:</strong> {student_id}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> {email}</p>
                <p style="margin: 5px 0;"><strong>Temporary Password:</strong> {temp_password}</p>
            </div>
            
            <p style="color: #EF4444; font-size: 14px;">
                Please change your password after your first login.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="#" style="background: #0F172A; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                    Login to Portal
                </a>
            </div>
            
            <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 40px;">
                © {datetime.now().year} {university_name}. All rights reserved.
            </p>
        </div>
        """
        
        resend.emails.send({
            "from": f"{university_name} <{ADMIN_EMAIL}>",
            "to": [email],
            "subject": f"Welcome to {university_name} - Your Login Credentials",
            "html": html_content
        })
        logger.info(f"Welcome email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send welcome email: {e}")
        return False

async def send_congratulations_email(email: str, first_name: str, course_title: str, certificate_url: str = None):
    """Send congratulations email on course completion"""
    try:
        config = await get_system_config()
        university_name = config.get("university_name", "GITB - Student LMS")
        
        html_content = f"""
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0F172A; margin: 0;">🎉 Congratulations!</h1>
            </div>
            
            <h2 style="color: #0F172A; text-align: center;">Well done, {first_name}!</h2>
            
            <p style="color: #64748B; font-size: 16px; line-height: 1.6; text-align: center;">
                You have successfully completed <strong>{course_title}</strong>!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <div style="font-size: 80px;">🏆</div>
            </div>
            
            <p style="color: #64748B; font-size: 16px; line-height: 1.6; text-align: center;">
                Your certificate of completion is now available in your dashboard.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="#" style="background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                    View Certificate
                </a>
            </div>
            
            <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 40px;">
                © {datetime.now().year} {university_name}. All rights reserved.
            </p>
        </div>
        """
        
        resend.emails.send({
            "from": f"{university_name} <{ADMIN_EMAIL}>",
            "to": [email],
            "subject": f"🎉 Congratulations! You've completed {course_title}",
            "html": html_content
        })
        logger.info(f"Congratulations email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send congratulations email: {e}")
        return False

# ============== PDF GENERATION ==============

async def generate_certificate_pdf(student_name: str, course_title: str, completion_date: str, certificate_id: str) -> bytes:
    """Generate a certificate PDF"""
    config = await get_system_config()
    university_name = config.get("university_name", "GITB - Student LMS")
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=50, bottomMargin=50)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Title'],
        fontSize=28,
        textColor=colors.HexColor("#0F172A"),
        alignment=TA_CENTER,
        spaceAfter=20
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=14,
        textColor=colors.HexColor("#64748B"),
        alignment=TA_CENTER,
        spaceAfter=40
    )
    
    name_style = ParagraphStyle(
        'Name',
        parent=styles['Title'],
        fontSize=24,
        textColor=colors.HexColor("#0F172A"),
        alignment=TA_CENTER,
        spaceAfter=20
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor("#64748B"),
        alignment=TA_CENTER,
        spaceAfter=10
    )
    
    elements = []
    elements.append(Spacer(1, 50))
    elements.append(Paragraph(university_name.upper(), title_style))
    elements.append(Paragraph("Certificate of Completion", subtitle_style))
    elements.append(Spacer(1, 30))
    elements.append(Paragraph("This is to certify that", body_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f"<b>{student_name}</b>", name_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph("has successfully completed the course", body_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f"<b>{course_title}</b>", name_style))
    elements.append(Spacer(1, 30))
    elements.append(Paragraph(f"Date: {completion_date}", body_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f"Certificate ID: {certificate_id}", body_style))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()

async def generate_invoice_pdf(student_name: str, student_id: str, transaction: dict) -> bytes:
    """Generate an invoice PDF with logo and bank details"""
    config = await get_system_config()
    university_name = config.get("university_name", "GITB - Student LMS")
    logo_url = config.get("logo_url", "")
    bank_name = config.get("bank_name", "")
    account_name = config.get("account_name", "")
    account_number = config.get("account_number", "")
    iban = config.get("iban", "")
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=30, bottomMargin=30)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=20, alignment=TA_CENTER)
    header_style = ParagraphStyle('Header', parent=styles['Normal'], fontSize=10, textColor=colors.gray)
    
    elements = []
    
    # Header with logo
    elements.append(Paragraph(university_name, title_style))
    elements.append(Paragraph("PAYMENT RECEIPT", ParagraphStyle('Sub', fontSize=14, alignment=TA_CENTER, textColor=colors.gray)))
    elements.append(Spacer(1, 30))
    
    # Invoice details
    invoice_data = [
        ["Invoice Number:", transaction.get("invoice_number", "N/A")],
        ["Date:", transaction.get("paid_at", transaction.get("created_at", ""))[:10] if transaction.get("paid_at") or transaction.get("created_at") else "N/A"],
        ["Student Name:", student_name],
        ["Student ID:", student_id],
    ]
    
    invoice_table = Table(invoice_data, colWidths=[2*inch, 4*inch])
    invoice_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.gray),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(invoice_table)
    elements.append(Spacer(1, 30))
    
    # Payment details
    payment_data = [
        ["Description", "Amount"],
        [transaction.get("description", "Payment"), f"€{transaction.get('amount', 0):.2f}"],
        ["", ""],
        ["Total Paid", f"€{transaction.get('amount', 0):.2f}"],
    ]
    
    payment_table = Table(payment_data, colWidths=[4*inch, 2*inch])
    payment_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
    ]))
    elements.append(payment_table)
    elements.append(Spacer(1, 30))
    
    # Bank Details section (if available)
    if bank_name or account_number or iban:
        elements.append(Paragraph("Bank Details for Payment", ParagraphStyle('BankHeader', fontSize=12, fontName='Helvetica-Bold')))
        elements.append(Spacer(1, 10))
        bank_info = []
        if bank_name:
            bank_info.append(["Bank Name:", bank_name])
        if account_name:
            bank_info.append(["Account Name:", account_name])
        if account_number:
            bank_info.append(["Account Number:", account_number])
        if iban:
            bank_info.append(["IBAN:", iban])
        
        if bank_info:
            bank_table = Table(bank_info, colWidths=[2*inch, 4*inch])
            bank_table.setStyle(TableStyle([
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.gray),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ]))
            elements.append(bank_table)
        elements.append(Spacer(1, 20))
    
    # Footer
    elements.append(Paragraph("Thank you for your payment!", ParagraphStyle('Footer', fontSize=12, alignment=TA_CENTER)))
    elements.append(Paragraph(f"© {datetime.now().year} {university_name}", header_style))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()

async def generate_transcript_pdf(student: dict, grades: list, courses: dict) -> bytes:
    """Generate a transcript PDF"""
    config = await get_system_config()
    university_name = config.get("university_name", "GITB - Student LMS")
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=30, bottomMargin=30)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=20, alignment=TA_CENTER)
    
    elements = []
    
    # Header
    elements.append(Paragraph(university_name, title_style))
    elements.append(Paragraph("OFFICIAL TRANSCRIPT", ParagraphStyle('Sub', fontSize=14, alignment=TA_CENTER, textColor=colors.gray)))
    elements.append(Spacer(1, 20))
    
    # Student Info
    student_info = [
        ["Student Name:", f"{student.get('first_name', '')} {student.get('last_name', '')}"],
        ["Student ID:", student.get('student_id', 'N/A')],
        ["Program:", student.get('program', 'N/A')],
        ["Department:", student.get('department', 'N/A')],
        ["Date Generated:", datetime.now().strftime("%B %d, %Y")],
    ]
    
    info_table = Table(student_info, colWidths=[2*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 20))
    
    # Grades Table
    grade_data = [["Course Code", "Course Title", "Units", "Score", "Grade", "Points"]]
    total_units = 0
    total_points = 0
    
    for grade in grades:
        course = courses.get(grade.get("course_id", ""), {})
        units = course.get("units", 0)
        points = grade.get("grade_point", 0) * units
        total_units += units
        total_points += points
        
        grade_data.append([
            course.get("code", "N/A"),
            course.get("title", "N/A")[:40],
            str(units),
            str(grade.get("score", "-")),
            grade.get("grade_letter", "-"),
            f"{points:.1f}"
        ])
    
    gpa = total_points / total_units if total_units > 0 else 0
    grade_data.append(["", "", f"Total: {total_units}", "", "GPA:", f"{gpa:.2f}"])
    
    grade_table = Table(grade_data, colWidths=[1*inch, 2.5*inch, 0.7*inch, 0.7*inch, 0.7*inch, 0.7*inch])
    grade_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (2, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -2), 0.5, colors.gray),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
    ]))
    elements.append(grade_table)
    elements.append(Spacer(1, 30))
    
    # Footer
    elements.append(Paragraph("This is an official transcript from the university records.", 
                              ParagraphStyle('Footer', fontSize=10, alignment=TA_CENTER, textColor=colors.gray)))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()

# ============== SYSTEM CONFIG ENDPOINTS ==============

@api_router.get("/system-config")
async def get_config():
    config = await get_system_config()
    return config

@api_router.put("/system-config")
async def update_config(
    config_data: SystemConfigUpdate,
    current_user: dict = Depends(require_roles([UserRole.ADMIN]))
):
    update_dict = {k: v for k, v in config_data.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    await db.system_config.update_one({}, {"$set": update_dict}, upsert=True)
    return await get_system_config()

# ============== AUTH ENDPOINTS ==============

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(request.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account is inactive")
    
    # Use _id as string or id field if exists
    user_id = str(user.get("_id")) if user.get("_id") else user.get("id", "")
    token = create_access_token(user_id, user["role"])
    
    # Prepare user response without password and _id
    user_response = {k: v for k, v in user.items() if k not in ["password", "_id"]}
    user_response["id"] = user_id  # Add id to response
    
    config = await get_system_config()
    
    return LoginResponse(
        access_token=token, 
        user=UserResponse(**user_response),
        system_config=config
    )

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Request password reset email"""
    user = await db.users.find_one({"email": request.email})
    if not user:
        # Return success even if user not found (security)
        return {"message": "If an account exists with that email, a reset link has been sent."}
    
    # Use _id as string or id field if exists
    user_id = str(user.get("_id")) if user.get("_id") else user.get("id", "")
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expiry = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Store reset token in database
    await db.password_resets.update_one(
        {"user_id": user_id},
        {"$set": {
            "user_id": user_id,
            "token": reset_token,
            "expires_at": expiry.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    # Send reset email
    try:
        await send_forgot_password_email(
            request.email,
            user["first_name"],
            reset_token
        )
    except Exception as e:
        logger.error(f"Failed to send password reset email: {e}")
    
    return {"message": "If an account exists with that email, a reset link has been sent."}

@api_router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password using token"""
    # Find reset token
    reset_record = await db.password_resets.find_one({"token": request.token}, {"_id": 0})
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Check expiry
    expiry = datetime.fromisoformat(reset_record["expires_at"])
    if datetime.now(timezone.utc) > expiry:
        await db.password_resets.delete_one({"token": request.token})
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Update password
    user = await db.users.find_one({"id": reset_record["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    new_hash = hash_password(request.new_password)
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "password": new_hash,
            "must_change_password": False
        }}
    )
    
    # Delete reset token
    await db.password_resets.delete_one({"token": request.token})
    
    # Send confirmation email
    try:
        await send_password_changed_email(user["email"], user["first_name"])
    except Exception as e:
        logger.error(f"Failed to send password changed email: {e}")
    
    return {"message": "Password reset successfully"}

@api_router.post("/auth/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user)
):
    """Change password for logged in user"""
    user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify current password
    if not verify_password(request.current_password, user.get("password", "")):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Update password
    new_hash = hash_password(request.new_password)
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "password": new_hash,
            "must_change_password": False
        }}
    )
    
    # Send confirmation email
    try:
        await send_password_changed_email(user["email"], user["first_name"])
    except Exception as e:
        logger.error(f"Failed to send password changed email: {e}")
    
    return {"message": "Password changed successfully"}

@api_router.post("/email/test")
async def test_email_endpoint(
    to_email: str = Query(..., description="Email address to send test to"),
    current_user: dict = Depends(require_roles([UserRole.ADMIN]))
):
    """Send a test email (admin only)"""
    result = await send_test_email(to_email)
    return result

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    access_info = check_access(current_user)
    config = await get_system_config()
    return {
        **current_user,
        "access": access_info,
        "system_config": config
    }

@api_router.get("/auth/check-access")
async def check_user_access(current_user: dict = Depends(get_current_user)):
    """Check if user can access content based on lock/payment status"""
    return check_access(current_user)

# ============== USER ENDPOINTS ==============

@api_router.get("/users")
async def get_users(
    role: Optional[str] = None,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.REGISTRAR]))
):
    query = {}
    if role:
        query["role"] = role
    users = await db.users.find(query, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.post("/users")
async def create_user(
    user_data: UserCreate,
    current_user: dict = Depends(require_roles([UserRole.ADMIN]))
):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user_data.model_dump()
    user_dict["password"] = hash_password(user_dict["password"])
    user_dict["id"] = str(uuid.uuid4())
    user_dict["is_active"] = True
    user_dict["account_status"] = AccountStatus.ACTIVE
    user_dict["payment_status"] = PaymentStatus.UNPAID
    user_dict["enrolled_courses"] = []
    user_dict["completed_lessons"] = []
    user_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    if user_data.role == UserRole.STUDENT:
        user_dict["student_id"] = generate_student_id()
    
    await db.users.insert_one(user_dict)
    user_dict.pop("password", None)
    user_dict.pop("_id", None)
    return user_dict

@api_router.get("/users/{user_id}")
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in [UserRole.ADMIN, UserRole.REGISTRAR] and current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.put("/users/{user_id}")
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
    return user

@api_router.put("/users/{user_id}/lock")
async def lock_user(
    user_id: str,
    current_user: dict = Depends(require_roles([UserRole.ADMIN]))
):
    """Lock a user's account"""
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"account_status": AccountStatus.LOCKED}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User account locked"}

@api_router.put("/users/{user_id}/unlock")
async def unlock_user(
    user_id: str,
    current_user: dict = Depends(require_roles([UserRole.ADMIN]))
):
    """Unlock a user's account"""
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"account_status": AccountStatus.ACTIVE}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User account unlocked"}

@api_router.put("/users/{user_id}/expel")
async def expel_student(
    user_id: str,
    current_user: dict = Depends(require_roles([UserRole.ADMIN]))
):
    """Expel a student - permanently removes access"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.get("role") != UserRole.STUDENT:
        raise HTTPException(status_code=400, detail="Only students can be expelled")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"account_status": AccountStatus.EXPELLED, "is_active": False}}
    )
    return {"message": "Student has been expelled"}

@api_router.put("/users/{user_id}/reinstate")
async def reinstate_student(
    user_id: str,
    current_user: dict = Depends(require_roles([UserRole.ADMIN]))
):
    """Reinstate an expelled student"""
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"account_status": AccountStatus.ACTIVE, "is_active": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Student has been reinstated"}

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

# ============== PUBLIC COURSE ENDPOINTS (No Auth) - Must be before /courses/{course_id} ==============

@api_router.get("/courses/public")
async def get_public_courses():
    """Get all active courses for public display (no authentication required)"""
    courses = await db.courses.find({"is_active": True}, {"_id": 0}).to_list(1000)
    for course in courses:
        modules = await db.modules.find({"course_id": course["id"], "is_active": True}, {"_id": 0}).sort("order", 1).to_list(100)
        course["modules"] = modules
    return courses

@api_router.get("/courses/public/{course_id}")
async def get_public_course(course_id: str):
    """Get a single course for public display (no authentication required)"""
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    modules = await db.modules.find({"course_id": course_id, "is_active": True}, {"_id": 0}).sort("order", 1).to_list(100)
    course["modules"] = modules
    return course

@api_router.get("/courses")
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
    return courses

@api_router.post("/courses")
async def create_course(
    course_data: CourseCreate,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.REGISTRAR]))
):
    existing = await db.courses.find_one({"code": course_data.code})
    if existing:
        raise HTTPException(status_code=400, detail="Course code already exists")
    
    course_dict = course_data.model_dump()
    course_dict["id"] = str(uuid.uuid4())
    course_dict["total_lessons"] = 0
    course_dict["is_active"] = True
    course_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.courses.insert_one(course_dict)
    course_dict.pop("_id", None)
    return course_dict

@api_router.get("/courses/{course_id}")
async def get_course(course_id: str, current_user: dict = Depends(get_current_user)):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get modules for this course
    modules = await db.modules.find({"course_id": course_id, "is_active": True}, {"_id": 0}).sort("order", 1).to_list(100)
    course["modules"] = modules
    
    return course

@api_router.put("/courses/{course_id}")
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
    return course

# ============== STRIPE APPLICATION ENDPOINTS ==============

from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

APPLICATION_FEE_EUR = float(os.environ.get('APPLICATION_FEE_EUR', '50.00'))
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')

class ApplicationCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    course_id: str
    origin_url: str
    high_school_cert_url: Optional[str] = None
    identification_url: Optional[str] = None

@api_router.post("/applications/create")
async def create_application(app_data: ApplicationCreate):
    """Create a new application and initiate Stripe payment"""
    
    # Check if course exists
    course = await db.courses.find_one({"id": app_data.course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if user already has a pending/active enrollment
    existing_app = await db.applications.find_one({
        "email": app_data.email,
        "status": {"$in": ["pending", "approved", "enrolled"]}
    })
    if existing_app:
        raise HTTPException(status_code=400, detail="You already have an active application or enrollment. Complete your current program before applying to another.")
    
    # Create application record
    application_id = str(uuid.uuid4())
    session_id = str(uuid.uuid4())
    
    application = {
        "id": application_id,
        "first_name": app_data.first_name,
        "last_name": app_data.last_name,
        "email": app_data.email,
        "phone": app_data.phone,
        "course_id": app_data.course_id,
        "course_title": course.get("title", ""),
        "status": "pending_payment",
        "payment_status": "pending",
        "amount": APPLICATION_FEE_EUR,
        "currency": "EUR",
        "session_id": None,
        "high_school_cert_url": app_data.high_school_cert_url,
        "identification_url": app_data.identification_url,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Create Stripe checkout session
    try:
        stripe_checkout = StripeCheckout(
            api_key=STRIPE_SECRET_KEY,
            webhook_url=f"{app_data.origin_url}/api/webhook/stripe"
        )
        
        success_url = f"{app_data.origin_url}/application/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{app_data.origin_url}/course/{app_data.course_id}"
        
        checkout_request = CheckoutSessionRequest(
            amount=APPLICATION_FEE_EUR,
            currency="eur",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "application_id": application_id,
                "email": app_data.email,
                "course_id": app_data.course_id,
                "type": "application_fee"
            }
        )
        
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Update application with session ID
        application["session_id"] = session.session_id
        
        # Save to database
        await db.applications.insert_one(application)
        
        # Also save to payment_transactions
        payment_transaction = {
            "id": str(uuid.uuid4()),
            "session_id": session.session_id,
            "application_id": application_id,
            "email": app_data.email,
            "amount": APPLICATION_FEE_EUR,
            "currency": "EUR",
            "payment_status": "pending",
            "type": "application_fee",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.payment_transactions.insert_one(payment_transaction)
        
        return {"checkout_url": session.url, "session_id": session.session_id}
        
    except Exception as e:
        logger.error(f"Stripe checkout error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")

@api_router.get("/applications/status/{session_id}")
async def get_application_status(session_id: str):
    """Get the status of an application by Stripe session ID"""
    
    # First check our database
    application = await db.applications.find_one({"session_id": session_id}, {"_id": 0})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # If already processed, return cached status
    if application.get("payment_status") == "paid":
        return {
            "status": application.get("status"),
            "payment_status": "paid"
        }
    
    # Check with Stripe
    try:
        stripe_checkout = StripeCheckout(api_key=STRIPE_SECRET_KEY, webhook_url="")
        checkout_status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        # Update application if payment completed
        if checkout_status.payment_status == "paid":
            await db.applications.update_one(
                {"session_id": session_id},
                {"$set": {
                    "payment_status": "paid",
                    "status": "pending_review",
                    "paid_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            # Update payment transaction
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid"}}
            )
            
            # Send confirmation email using new email service
            try:
                await send_application_received_email(
                    application["email"],
                    application["first_name"],
                    application["last_name"],
                    application["course_title"],
                    application["id"]
                )
            except Exception as e:
                logger.error(f"Failed to send confirmation email: {e}")
        
        return {
            "status": checkout_status.status,
            "payment_status": checkout_status.payment_status
        }
        
    except Exception as e:
        logger.error(f"Stripe status check error: {str(e)}")
        return {
            "status": application.get("status"),
            "payment_status": application.get("payment_status")
        }

async def send_application_received_email(email: str, first_name: str, course_title: str):
    """Send confirmation email when application is received"""
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #3d7a4a 0%, #2d5a3a 100%); color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">GITB</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px;">Global Institute of Tech and Business</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #3d7a4a;">Application Received!</h2>
            
            <p>Dear {first_name},</p>
            
            <p>Thank you for applying to <strong>{course_title}</strong> at GITB!</p>
            
            <p>Your application has been received and your payment of <strong>€50.00</strong> has been confirmed.</p>
            
            <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #2e7d32;"><strong>What happens next?</strong></p>
                <p style="margin: 10px 0 0 0;">Our admissions team will review your application. You will receive another email within 3-5 business days with your admission decision.</p>
            </div>
            
            <p>If you have any questions, please contact us at support@gitb.lt</p>
            
            <p>Best regards,<br><strong>GITB Admissions Team</strong></p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>© {datetime.now().year} Global Institute of Tech and Business. All rights reserved.</p>
            <p>Vilnius, Lithuania | support@gitb.lt</p>
        </div>
    </div>
    """
    
    params = {
        "from": f"GITB Admissions <{ADMIN_EMAIL}>",
        "to": [email],
        "subject": f"Application Received - {course_title}",
        "html": html_content
    }
    
    resend.Emails.send(params)

@api_router.post("/webhook/stripe")
async def stripe_webhook(request_body: bytes = Depends(lambda r: r.body())):
    """Handle Stripe webhooks"""
    # This is a simplified webhook handler
    # In production, verify the webhook signature
    return {"received": True}

# ============== APPLICATIONS MANAGEMENT ENDPOINTS ==============

@api_router.get("/applications")
async def get_all_applications(
    status: str = None,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, "registrar"]))
):
    """Get all applications with optional status filter"""
    query = {}
    if status and status != "all":
        query["status"] = status
    
    applications = await db.applications.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return applications

@api_router.post("/applications/{application_id}/approve")
async def approve_application(
    application_id: str,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, "registrar"]))
):
    """Approve an application and create student account"""
    application = await db.applications.find_one({"id": application_id}, {"_id": 0})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if application.get("status") not in ["pending_review", "pending"]:
        raise HTTPException(status_code=400, detail="Application cannot be approved in current status")
    
    # Generate student ID and temp password
    student_id = f"STU{datetime.now().year}{str(uuid.uuid4())[:5].upper()}"
    temp_password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
    
    # Create user account
    user = {
        "id": str(uuid.uuid4()),
        "email": application["email"],
        "password_hash": bcrypt.hashpw(temp_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "first_name": application["first_name"],
        "last_name": application["last_name"],
        "role": UserRole.STUDENT,
        "student_id": student_id,
        "phone": application.get("phone"),
        "program": application.get("course_title", ""),
        "department": "General Studies",
        "level": 100,
        "is_active": True,
        "account_status": "active",
        "payment_status": "paid",
        "must_change_password": True,  # Flag to prompt password change
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user)
    
    # Update application status
    await db.applications.update_one(
        {"id": application_id},
        {"$set": {
            "status": "approved",
            "approved_at": datetime.now(timezone.utc).isoformat(),
            "approved_by": current_user["id"],
            "student_id": student_id
        }}
    )
    
    # Send approval email with login credentials using new email service
    email_sent = False
    try:
        email_sent = await send_application_approved_email(
            application["email"],
            application["first_name"],
            application["last_name"],
            application.get("course_title", "Your Program"),
            temp_password
        )
    except Exception as e:
        logger.error(f"Failed to send approval email: {e}")
    
    return {
        "message": "Application approved",
        "student_id": student_id,
        "email": application["email"],
        "temp_password": temp_password,
        "email_sent": email_sent
    }

async def send_admission_email(email: str, first_name: str, last_name: str, program: str, student_id: str, temp_password: str, tuition_fee: float = 2500, tuition_fee_per: str = "semester", currency_symbol: str = "€"):
    """Send admission email with login credentials and tuition information"""
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #3d7a4a 0%, #2d5a3a 100%); color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">GITB</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Global Institute of Tech and Business</p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 60px; height: 60px; background: #e8f5e9; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                    <span style="font-size: 30px;">🎓</span>
                </div>
            </div>
            
            <h2 style="color: #3d7a4a; text-align: center; margin-bottom: 20px;">Congratulations, {first_name}!</h2>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
                We are pleased to inform you that your application to <strong>{program}</strong> has been approved!
            </p>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3d7a4a;">
                <h3 style="margin: 0 0 15px 0; color: #333;">Your Login Credentials</h3>
                <table style="width: 100%;">
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Student ID:</td>
                        <td style="padding: 8px 0; font-weight: bold; color: #333;">{student_id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Email:</td>
                        <td style="padding: 8px 0; font-weight: bold; color: #333;">{email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Temporary Password:</td>
                        <td style="padding: 8px 0; font-weight: bold; color: #e53935;">{temp_password}</td>
                    </tr>
                </table>
            </div>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976d2;">
                <h3 style="margin: 0 0 10px 0; color: #1565c0;">Tuition Fee Information</h3>
                <table style="width: 100%;">
                    <tr>
                        <td style="padding: 5px 0; color: #666;">Tuition Fee:</td>
                        <td style="padding: 5px 0; font-weight: bold; color: #1565c0; font-size: 18px;">{currency_symbol}{tuition_fee:,.2f} per {tuition_fee_per}</td>
                    </tr>
                </table>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
                    Payment details and deadlines will be available in your student portal.
                </p>
            </div>
            
            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #e65100; font-size: 14px;">
                    <strong>Important:</strong> Please change your password after your first login.
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://gitb-admissions.preview.emergentagent.com/login" 
                   style="display: inline-block; padding: 15px 40px; background: #3d7a4a; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Access Student Portal
                </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                If you have any questions, please contact us at support@gitb.lt
            </p>
            
            <p style="color: #333; margin-top: 20px;">
                Best regards,<br>
                <strong>GITB Admissions Office</strong>
            </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© {datetime.now().year} Global Institute of Tech and Business. All rights reserved.</p>
            <p>Vilnius, Lithuania | support@gitb.lt</p>
        </div>
    </div>
    """
    
    params = {
        "from": f"GITB Admissions <{ADMIN_EMAIL}>",
        "to": [email],
        "subject": f"🎓 Admission Granted - Welcome to GITB, {first_name}!",
        "html": html_content
    }
    
    resend.Emails.send(params)

@api_router.post("/applications/{application_id}/reject")
async def reject_application(
    application_id: str,
    reason: Optional[str] = None,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, "registrar"]))
):
    """Reject an application"""
    # Get application first to send email
    application = await db.applications.find_one({"id": application_id}, {"_id": 0})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    result = await db.applications.update_one(
        {"id": application_id},
        {"$set": {
            "status": "rejected",
            "rejected_at": datetime.now(timezone.utc).isoformat(),
            "rejected_by": current_user["id"],
            "rejection_reason": reason
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Send rejection email
    email_sent = False
    try:
        email_sent = await send_application_rejected_email(
            application["email"],
            application["first_name"],
            application["last_name"],
            application.get("course_title", "Your Program"),
            reason
        )
    except Exception as e:
        logger.error(f"Failed to send rejection email: {e}")
    
    return {"message": "Application rejected", "email_sent": email_sent}

@api_router.get("/applications/{application_id}/admission-letter")
async def get_admission_letter(
    application_id: str,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, "registrar"]))
):
    """Generate and return admission letter PDF"""
    from io import BytesIO
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from fastapi.responses import StreamingResponse
    
    application = await db.applications.find_one({"id": application_id}, {"_id": 0})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Get system config for fees
    system_config = await db.system_config.find_one({}, {"_id": 0}) or {}
    tuition_fee = system_config.get("tuition_fee", 2500)
    tuition_fee_per = system_config.get("tuition_fee_per", "semester")
    currency = system_config.get("default_currency", "EUR")
    currency_symbol = {"EUR": "€", "USD": "$", "GBP": "£", "NGN": "₦"}.get(currency, "€")
    university_name = system_config.get("university_name", "Global Institute of Tech and Business")
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=16, spaceAfter=20, textColor=colors.HexColor('#3d7a4a'))
    body_style = ParagraphStyle('CustomBody', parent=styles['Normal'], fontSize=11, leading=16)
    fee_style = ParagraphStyle('FeeStyle', parent=styles['Normal'], fontSize=12, leading=18, textColor=colors.HexColor('#1565c0'))
    
    elements = []
    
    # Header
    elements.append(Paragraph(f"<b>{university_name.upper()}</b>", title_style))
    elements.append(Paragraph("Vilnius, Lithuania | support@gitb.lt", body_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Date
    elements.append(Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", body_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Reference
    elements.append(Paragraph(f"<b>Ref:</b> GITB/ADM/{application.get('student_id', application_id[:8].upper())}", body_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Recipient
    elements.append(Paragraph(f"<b>{application['first_name']} {application['last_name']}</b>", body_style))
    elements.append(Paragraph(application['email'], body_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Subject
    elements.append(Paragraph("<b>LETTER OF ADMISSION</b>", title_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Body with tuition fee
    body_text = f"""
    Dear {application['first_name']},<br/><br/>
    
    Following your application and the payment of the application fee, we are pleased to inform you that 
    you have been offered admission to study <b>{application.get('course_title', 'your selected program')}</b> 
    at {university_name}.<br/><br/>
    
    <b>Student ID:</b> {application.get('student_id', 'To be assigned')}<br/><br/>
    
    <b>Tuition Fee:</b> {currency_symbol}{tuition_fee:,.2f} per {tuition_fee_per}<br/><br/>
    
    Please log in to the student portal to access your courses and begin your studies. Your temporary 
    login credentials have been sent to your email address.<br/><br/>
    
    We look forward to supporting you on your educational journey.<br/><br/>
    
    Congratulations and welcome to GITB!<br/><br/>
    
    Yours sincerely,<br/><br/>
    
    <b>Dr. Jane Smith</b><br/>
    Director of Admissions<br/>
    {university_name}
    """
    elements.append(Paragraph(body_text, body_style))
    
    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=admission_letter_{application_id}.pdf"}
    )

# ============== MODULE ENDPOINTS ==============

@api_router.get("/courses/{course_id}/modules")
async def get_course_modules(course_id: str, current_user: dict = Depends(get_current_user)):
    modules = await db.modules.find({"course_id": course_id, "is_active": True}, {"_id": 0}).sort("order", 1).to_list(100)
    return modules

@api_router.post("/courses/{course_id}/modules")
async def create_module(
    course_id: str,
    module_data: ModuleCreate,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.LECTURER]))
):
    # Verify course exists
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    module_dict = module_data.model_dump()
    module_dict["id"] = str(uuid.uuid4())
    module_dict["course_id"] = course_id
    module_dict["is_active"] = True
    
    # Assign IDs to lessons if not present
    for lesson in module_dict.get("lessons", []):
        if not lesson.get("id"):
            lesson["id"] = str(uuid.uuid4())
    
    await db.modules.insert_one(module_dict)
    
    # Update course total lessons count
    total_lessons = sum(len(m.get("lessons", [])) for m in await db.modules.find({"course_id": course_id}, {"_id": 0}).to_list(100))
    await db.courses.update_one({"id": course_id}, {"$set": {"total_lessons": total_lessons}})
    
    module_dict.pop("_id", None)
    return module_dict

@api_router.put("/modules/{module_id}")
async def update_module(
    module_id: str,
    module_data: ModuleCreate,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.LECTURER]))
):
    update_dict = module_data.model_dump()
    for lesson in update_dict.get("lessons", []):
        if not lesson.get("id"):
            lesson["id"] = str(uuid.uuid4())
    
    result = await db.modules.update_one({"id": module_id}, {"$set": update_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Module not found")
    
    module = await db.modules.find_one({"id": module_id}, {"_id": 0})
    return module

@api_router.delete("/modules/{module_id}")
async def delete_module(
    module_id: str,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.LECTURER]))
):
    result = await db.modules.delete_one({"id": module_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Module not found")
    return {"message": "Module deleted"}

# ============== LESSON ENDPOINTS ==============

class LessonCreate(BaseModel):
    title: str
    type: str = "video"  # video, pdf, text, quiz
    content_url: str = ""
    description: str = ""
    order: int = 1

@api_router.post("/modules/{module_id}/lessons")
async def add_lesson_to_module(
    module_id: str,
    lesson_data: LessonCreate,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.LECTURER]))
):
    """Add a lesson to a module"""
    module = await db.modules.find_one({"id": module_id})
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    lesson = {
        "id": str(uuid.uuid4()),
        "title": lesson_data.title,
        "content_type": lesson_data.type,
        "content_url": lesson_data.content_url,
        "description": lesson_data.description,
        "order": lesson_data.order
    }
    
    lessons = module.get("lessons", [])
    lessons.append(lesson)
    
    await db.modules.update_one(
        {"id": module_id},
        {"$set": {"lessons": lessons}}
    )
    
    # Update course total lessons
    course_id = module.get("course_id")
    all_modules = await db.modules.find({"course_id": course_id}, {"_id": 0}).to_list(100)
    total_lessons = sum(len(m.get("lessons", [])) for m in all_modules)
    await db.courses.update_one({"id": course_id}, {"$set": {"total_lessons": total_lessons}})
    
    return lesson

class QuizUpload(BaseModel):
    questions: List[Dict[str, Any]]
    attempts_allowed: int = 3
    passing_score: float = 70.0

@api_router.post("/modules/{module_id}/quiz")
async def upload_quiz_to_module(
    module_id: str,
    quiz_data: QuizUpload,
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.LECTURER]))
):
    """Upload a quiz (from Excel) to a module"""
    module = await db.modules.find_one({"id": module_id})
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Create quiz as a lesson
    quiz_lesson = {
        "id": str(uuid.uuid4()),
        "title": f"{module.get('title', 'Module')} Quiz",
        "content_type": "quiz",
        "quiz_data": {"questions": quiz_data.questions},
        "quiz_attempts_allowed": quiz_data.attempts_allowed,
        "quiz_passing_score": quiz_data.passing_score,
        "order": len(module.get("lessons", [])) + 1
    }
    
    lessons = module.get("lessons", [])
    lessons.append(quiz_lesson)
    
    await db.modules.update_one(
        {"id": module_id},
        {"$set": {"lessons": lessons}}
    )
    
    return {"message": f"Quiz with {len(quiz_data.questions)} questions uploaded", "lesson_id": quiz_lesson["id"]}

# ============== QUIZ ENDPOINTS ==============

class QuizSubmission(BaseModel):
    lesson_id: str
    answers: List[int]

@api_router.post("/quiz/submit")
async def submit_quiz(
    submission: QuizSubmission,
    current_user: dict = Depends(get_current_user)
):
    """Submit quiz answers and get result"""
    if current_user["role"] != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can submit quizzes")
    
    # Find the lesson with quiz
    lesson = None
    module = None
    async for m in db.modules.find({"is_active": True}, {"_id": 0}):
        for l in m.get("lessons", []):
            if l.get("id") == submission.lesson_id and l.get("content_type") == "quiz":
                lesson = l
                module = m
                break
        if lesson:
            break
    
    if not lesson:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    quiz_data = lesson.get("quiz_data", {})
    questions = quiz_data.get("questions", [])
    attempts_allowed = lesson.get("quiz_attempts_allowed", 3)
    passing_score = lesson.get("quiz_passing_score", 60.0)
    
    # Check attempts
    existing_attempts = await db.quiz_attempts.count_documents({
        "student_id": current_user["id"],
        "lesson_id": submission.lesson_id
    })
    
    if existing_attempts >= attempts_allowed:
        raise HTTPException(status_code=400, detail=f"Maximum attempts ({attempts_allowed}) reached")
    
    # Calculate score
    correct = 0
    total = len(questions)
    for i, q in enumerate(questions):
        if i < len(submission.answers) and submission.answers[i] == q.get("correct_answer", q.get("answer")):
            correct += 1
    
    score = (correct / total * 100) if total > 0 else 0
    passed = score >= passing_score
    
    # Save attempt
    attempt = {
        "id": str(uuid.uuid4()),
        "student_id": current_user["id"],
        "lesson_id": submission.lesson_id,
        "course_id": module.get("course_id"),
        "answers": submission.answers,
        "score": score,
        "passed": passed,
        "attempt_number": existing_attempts + 1,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.quiz_attempts.insert_one(attempt)
    
    return {
        "score": round(score, 2),
        "passed": passed,
        "correct": correct,
        "total": total,
        "attempts_used": existing_attempts + 1,
        "attempts_allowed": attempts_allowed
    }

@api_router.get("/quiz/attempts/{lesson_id}")
async def get_quiz_attempts(
    lesson_id: str,
    student_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get quiz attempts for a lesson"""
    query = {"lesson_id": lesson_id}
    if current_user["role"] == UserRole.STUDENT:
        query["student_id"] = current_user["id"]
    elif student_id:
        query["student_id"] = student_id
    
    attempts = await db.quiz_attempts.find(query, {"_id": 0}).to_list(100)
    return attempts

@api_router.post("/quiz/bulk-upload/{lesson_id}")
async def bulk_upload_quiz(
    lesson_id: str,
    questions: List[dict],
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.LECTURER]))
):
    """Bulk upload quiz questions (from Excel data)"""
    # Find and update the lesson
    formatted_questions = []
    for q in questions:
        formatted_questions.append({
            "q": q.get("question", q.get("q", "")),
            "options": q.get("options", []),
            "answer": q.get("correct_answer", q.get("answer", 0))
        })
    
    # Update the lesson's quiz_data
    result = await db.modules.update_one(
        {"lessons.id": lesson_id},
        {"$set": {"lessons.$.quiz_data.questions": formatted_questions}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    return {"message": f"Uploaded {len(formatted_questions)} questions"}

# ============== PROGRAMS ENDPOINT ==============

@api_router.get("/programs")
async def get_programs():
    """Get available programs and their courses"""
    # Get unique programs from courses
    courses = await db.courses.find({"is_active": True}, {"_id": 0}).to_list(1000)
    
    programs = {}
    for course in courses:
        dept = course.get("department", "General")
        if dept not in programs:
            programs[dept] = {
                "department": dept,
                "courses": []
            }
        programs[dept]["courses"].append({
            "id": course["id"],
            "code": course["code"],
            "title": course["title"],
            "level": course["level"],
            "units": course["units"],
            "semester": course["semester"],
            "course_type": course["course_type"]
        })
    
    return list(programs.values())

@api_router.get("/programs/{department}/courses")
async def get_program_courses(
    department: str,
    level: Optional[int] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get courses for a specific program/department"""
    query = {"department": department, "is_active": True}
    if level:
        query["level"] = level
    
    courses = await db.courses.find(query, {"_id": 0}).to_list(1000)
    return courses

# ============== STUDENT STATS ENDPOINTS ==============

@api_router.get("/student/stats")
async def get_student_stats(current_user: dict = Depends(get_current_user)):
    """Get statistics for the current student"""
    if current_user["role"] != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can access this endpoint")
    
    student_id = current_user["id"]
    
    # Get enrollments
    enrollments = await db.enrollments.find({"student_id": student_id}, {"_id": 0}).to_list(1000)
    
    # Calculate stats
    total_courses = len(enrollments)
    completed_courses = len([e for e in enrollments if e.get("status") == "completed"])
    in_progress = len([e for e in enrollments if e.get("status") == "enrolled"])
    
    # Calculate lesson stats
    total_lessons = 0
    completed_lessons = 0
    for enrollment in enrollments:
        completed = enrollment.get("completed_lessons", [])
        completed_lessons += len(completed)
        # Estimate total lessons from course modules
        course = await db.courses.find_one({"id": enrollment.get("course_id")}, {"_id": 0})
        if course:
            for module in course.get("modules", []):
                total_lessons += len(module.get("lessons", []))
    
    return {
        "total_courses": total_courses,
        "completed_courses": completed_courses,
        "in_progress": in_progress,
        "total_lessons": total_lessons or 36,  # Fallback
        "completed_lessons": completed_lessons,
        "total_quizzes": 18,  # Placeholder
        "total_minutes": 231  # Placeholder
    }

@api_router.get("/enrollments/my")
async def get_my_enrollments(current_user: dict = Depends(get_current_user)):
    """Get enrollments for the current student"""
    if current_user["role"] != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can access this endpoint")
    
    student_id = current_user["id"]
    enrollments = await db.enrollments.find({"student_id": student_id}, {"_id": 0}).to_list(1000)
    
    # Enrich with course data
    for enrollment in enrollments:
        course = await db.courses.find_one({"id": enrollment["course_id"]}, {"_id": 0})
        if course:
            enrollment["course"] = serialize_doc(course)
    
    return enrollments

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
    if current_user["role"] == UserRole.STUDENT and enrollment_data.student_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Cannot enroll other students")
    
    existing = await db.enrollments.find_one({
        "student_id": enrollment_data.student_id,
        "course_id": enrollment_data.course_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    
    enrollment_dict = enrollment_data.model_dump()
    enrollment_dict["id"] = str(uuid.uuid4())
    enrollment_dict["status"] = "enrolled"
    enrollment_dict["progress"] = 0.0
    enrollment_dict["completed_lessons"] = []
    enrollment_dict["enrolled_at"] = datetime.now(timezone.utc).isoformat()
    enrollment_dict["certificate_generated"] = False
    
    await db.enrollments.insert_one(enrollment_dict)
    
    # Update user's enrolled courses
    await db.users.update_one(
        {"id": enrollment_data.student_id},
        {"$addToSet": {"enrolled_courses": enrollment_data.course_id}}
    )
    
    enrollment_dict.pop("_id", None)
    return enrollment_dict

@api_router.get("/enrollments/{enrollment_id}")
async def get_enrollment(enrollment_id: str, current_user: dict = Depends(get_current_user)):
    enrollment = await db.enrollments.find_one({"id": enrollment_id}, {"_id": 0})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    # Get course with modules
    course = await db.courses.find_one({"id": enrollment["course_id"]}, {"_id": 0})
    if course:
        modules = await db.modules.find({"course_id": course["id"], "is_active": True}, {"_id": 0}).sort("order", 1).to_list(100)
        course["modules"] = modules
        enrollment["course"] = course
    
    return enrollment

# ============== LESSON PROGRESS ENDPOINTS ==============

@api_router.post("/enrollments/{enrollment_id}/complete-lesson")
async def complete_lesson(
    enrollment_id: str,
    lesson_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark a lesson as complete and update progress"""
    enrollment = await db.enrollments.find_one({"id": enrollment_id}, {"_id": 0})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    if current_user["role"] == UserRole.STUDENT and enrollment["student_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not your enrollment")
    
    # Check access
    access = check_access(current_user)
    if not access["allowed"] and access["reason"] == "unpaid":
        raise HTTPException(status_code=403, detail=access["message"])
    
    # Get course and count total lessons
    course = await db.courses.find_one({"id": enrollment["course_id"]}, {"_id": 0})
    modules = await db.modules.find({"course_id": enrollment["course_id"]}, {"_id": 0}).to_list(100)
    total_lessons = sum(len(m.get("lessons", [])) for m in modules)
    
    # Add lesson to completed
    completed_lessons = enrollment.get("completed_lessons", [])
    if lesson_id not in completed_lessons:
        completed_lessons.append(lesson_id)
    
    # Calculate progress
    progress = (len(completed_lessons) / total_lessons * 100) if total_lessons > 0 else 0
    
    update_data = {
        "completed_lessons": completed_lessons,
        "progress": round(progress, 2),
        "last_lesson_id": lesson_id
    }
    
    # Check if course is complete
    is_complete = progress >= 100
    if is_complete and enrollment.get("status") != "completed":
        update_data["status"] = "completed"
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
        
        # Send congratulations email
        user = await db.users.find_one({"id": enrollment["student_id"]}, {"_id": 0})
        if user and course:
            await send_congratulations_email(
                user.get("email"),
                user.get("first_name"),
                course.get("title")
            )
    
    await db.enrollments.update_one({"id": enrollment_id}, {"$set": update_data})
    
    return {
        "progress": update_data["progress"],
        "completed_lessons": completed_lessons,
        "is_complete": is_complete
    }

@api_router.get("/enrollments/{enrollment_id}/next-lesson")
async def get_next_lesson(enrollment_id: str, current_user: dict = Depends(get_current_user)):
    """Get the next lesson for the student"""
    enrollment = await db.enrollments.find_one({"id": enrollment_id}, {"_id": 0})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    modules = await db.modules.find({"course_id": enrollment["course_id"]}, {"_id": 0}).sort("order", 1).to_list(100)
    completed = set(enrollment.get("completed_lessons", []))
    
    for module in modules:
        for lesson in module.get("lessons", []):
            if lesson["id"] not in completed:
                return {"module": module, "lesson": lesson}
    
    return {"message": "All lessons completed", "completed": True}

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
    enrollment = await db.enrollments.find_one({"id": grade_data.enrollment_id}, {"_id": 0})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
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

# ============== TRANSACTION/PAYMENT ENDPOINTS ==============

@api_router.get("/transactions")
async def get_transactions(
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
    
    transactions = await db.transactions.find(query, {"_id": 0}).to_list(1000)
    return [serialize_doc(t) for t in transactions]

@api_router.post("/transactions")
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: dict = Depends(require_roles([UserRole.ADMIN]))
):
    transaction_dict = transaction_data.model_dump()
    transaction_dict["id"] = str(uuid.uuid4())
    transaction_dict["status"] = "pending"
    transaction_dict["invoice_number"] = generate_invoice_number()
    transaction_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.transactions.insert_one(transaction_dict)
    transaction_dict.pop("_id", None)
    return transaction_dict

@api_router.put("/transactions/{transaction_id}/confirm")
async def confirm_transaction(
    transaction_id: str,
    current_user: dict = Depends(require_roles([UserRole.ADMIN]))
):
    """Admin confirms a payment - this unlocks student access"""
    transaction = await db.transactions.find_one({"id": transaction_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Update transaction
    await db.transactions.update_one(
        {"id": transaction_id},
        {"$set": {"status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Update user payment status
    student_id = transaction["student_id"]
    payment_type = transaction.get("payment_type", "tuition")
    semester = transaction.get("semester")
    
    update_data = {"payment_status": PaymentStatus.PAID}
    if semester:
        update_data["current_semester_paid"] = semester
    
    await db.users.update_one({"id": student_id}, {"$set": update_data})
    
    return {"message": "Payment confirmed. Student access unlocked."}

@api_router.get("/transactions/{transaction_id}/invoice")
async def get_invoice_pdf(
    transaction_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Generate and return invoice PDF"""
    transaction = await db.transactions.find_one({"id": transaction_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if current_user["role"] == UserRole.STUDENT and transaction["student_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    student = await db.users.find_one({"id": transaction["student_id"]}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    pdf_bytes = await generate_invoice_pdf(
        f"{student['first_name']} {student['last_name']}",
        student.get("student_id", "N/A"),
        transaction
    )
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice_{transaction['invoice_number']}.pdf"}
    )

@api_router.get("/payments/summary/{student_id}")
async def get_payment_summary(student_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] == UserRole.STUDENT and current_user["id"] != student_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    transactions = await db.transactions.find({"student_id": student_id}, {"_id": 0}).to_list(1000)
    
    total_due = sum(t["amount"] for t in transactions if t["status"] == "pending")
    total_paid = sum(t["amount"] for t in transactions if t["status"] == "paid")
    
    return {
        "total_due": total_due,
        "total_paid": total_paid,
        "outstanding": total_due
    }

# ============== CERTIFICATE & TRANSCRIPT ENDPOINTS ==============

@api_router.get("/certificates/{enrollment_id}")
async def generate_certificate(enrollment_id: str, current_user: dict = Depends(get_current_user)):
    """Generate certificate for completed course"""
    enrollment = await db.enrollments.find_one({"id": enrollment_id}, {"_id": 0})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    if enrollment.get("progress", 0) < 100:
        raise HTTPException(status_code=400, detail="Course not completed yet")
    
    if current_user["role"] == UserRole.STUDENT and enrollment["student_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    student = await db.users.find_one({"id": enrollment["student_id"]}, {"_id": 0})
    course = await db.courses.find_one({"id": enrollment["course_id"]}, {"_id": 0})
    
    if not student or not course:
        raise HTTPException(status_code=404, detail="Data not found")
    
    certificate_id = f"CERT-{enrollment_id[:8].upper()}"
    completion_date = enrollment.get("completed_at", datetime.now(timezone.utc).isoformat())[:10]
    
    pdf_bytes = await generate_certificate_pdf(
        f"{student['first_name']} {student['last_name']}",
        course["title"],
        completion_date,
        certificate_id
    )
    
    # Mark certificate as generated
    await db.enrollments.update_one({"id": enrollment_id}, {"$set": {"certificate_generated": True}})
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=certificate_{certificate_id}.pdf"}
    )

@api_router.get("/transcript/{student_id}")
async def generate_transcript(student_id: str, current_user: dict = Depends(get_current_user)):
    """Generate transcript PDF"""
    if current_user["role"] == UserRole.STUDENT and current_user["id"] != student_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    student = await db.users.find_one({"id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    grades = await db.grades.find({"student_id": student_id}, {"_id": 0}).to_list(1000)
    
    # Get all courses
    course_ids = [g["course_id"] for g in grades]
    courses_list = await db.courses.find({"id": {"$in": course_ids}}, {"_id": 0}).to_list(1000)
    courses = {c["id"]: c for c in courses_list}
    
    pdf_bytes = await generate_transcript_pdf(student, grades, courses)
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=transcript_{student.get('student_id', 'unknown')}.pdf"}
    )

# ============== ADMISSION ENDPOINTS ==============

@api_router.get("/admissions")
async def get_admissions(
    status: Optional[str] = None,
    current_user: dict = Depends(require_roles([UserRole.ADMIN]))
):
    query = {}
    if status:
        query["status"] = status
    
    admissions = await db.admissions.find(query, {"_id": 0}).to_list(1000)
    return [serialize_doc(a) for a in admissions]

@api_router.post("/admissions/apply")
async def apply_for_admission(admission_data: AdmissionCreate):
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

@api_router.put("/admissions/{admission_id}/grant")
async def grant_admission(
    admission_id: str,
    current_user: dict = Depends(require_roles([UserRole.ADMIN]))
):
    """Grant admission - creates user account and sends credentials via email"""
    admission = await db.admissions.find_one({"id": admission_id}, {"_id": 0})
    if not admission:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if admission["status"] == "accepted":
        raise HTTPException(status_code=400, detail="Admission already granted")
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": admission["email"]})
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Generate credentials
    student_id = generate_student_id()
    temp_password = generate_password()
    
    # Create user account
    user_dict = {
        "id": str(uuid.uuid4()),
        "email": admission["email"],
        "password": hash_password(temp_password),
        "first_name": admission["first_name"],
        "last_name": admission["last_name"],
        "role": UserRole.STUDENT,
        "department": admission["department"],
        "program": admission["program"],
        "level": 100,
        "student_id": student_id,
        "phone": admission["phone"],
        "is_active": True,
        "account_status": AccountStatus.ACTIVE,
        "payment_status": PaymentStatus.UNPAID,
        "enrolled_courses": [],
        "completed_lessons": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_dict)
    
    # Update admission status
    await db.admissions.update_one(
        {"id": admission_id},
        {"$set": {"status": "accepted", "reviewed_by": current_user["id"]}}
    )
    
    # Send welcome email with credentials
    email_sent = await send_welcome_email(
        admission["email"],
        admission["first_name"],
        student_id,
        temp_password
    )
    
    return {
        "message": "Admission granted successfully",
        "student_id": student_id,
        "email": admission["email"],
        "temp_password": temp_password,
        "email_sent": email_sent
    }

@api_router.put("/admissions/{admission_id}/decline")
async def decline_admission(
    admission_id: str,
    current_user: dict = Depends(require_roles([UserRole.ADMIN]))
):
    result = await db.admissions.update_one(
        {"id": admission_id},
        {"$set": {"status": "declined", "reviewed_by": current_user["id"]}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return {"message": "Application declined"}

# ============== DASHBOARD STATS ==============

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    role = current_user["role"]
    stats = {}
    
    if role == UserRole.STUDENT:
        student_id = current_user["id"]
        enrollments = await db.enrollments.find({"student_id": student_id}, {"_id": 0}).to_list(1000)
        grades = await db.grades.find({"student_id": student_id}, {"_id": 0}).to_list(1000)
        transactions = await db.transactions.find({"student_id": student_id}, {"_id": 0}).to_list(1000)
        
        completed_courses = len([e for e in enrollments if e["status"] == "completed"])
        outstanding_payments = sum(t["amount"] for t in transactions if t["status"] == "pending")
        
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
        
        # Course progress
        course_progress = []
        for enrollment in enrollments[:5]:
            course = await db.courses.find_one({"id": enrollment["course_id"]}, {"_id": 0})
            if course:
                course_progress.append({
                    "course": course,
                    "progress": enrollment.get("progress", 0),
                    "status": enrollment.get("status", "enrolled")
                })
        
        stats = {
            "enrolled_courses": len(enrollments),
            "completed_courses": completed_courses,
            "completed_units": total_units,
            "cgpa": round(cgpa, 2),
            "outstanding_payment": outstanding_payments,
            "recent_transactions": [serialize_doc(t) for t in transactions[-5:]],
            "course_progress": course_progress,
            "access": check_access(current_user)
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
            "total_users": await db.users.count_documents({}),
            "locked_accounts": await db.users.count_documents({"account_status": AccountStatus.LOCKED}),
            "unpaid_students": await db.users.count_documents({"role": UserRole.STUDENT, "payment_status": PaymentStatus.UNPAID})
        }
    
    return stats

# ============== SEED DATA ==============

@api_router.post("/seed")
async def seed_database():
    """Seed the database with initial data"""
    admin = await db.users.find_one({"email": "admin@luminalms.edu"})
    if admin:
        return {"message": "Database already seeded"}
    
    # Create system config
    config = {
        "university_name": "GITB - Student LMS",
        "logo_url": "",
        "favicon_url": "",
        "primary_color": "#0F172A",
        "secondary_color": "#D32F2F",
        "support_email": "support@luminalms.edu",
        "support_phone": "+234 816 839 7949"
    }
    await db.system_config.insert_one(config)
    
    # Create admin user
    admin_user = {
        "id": str(uuid.uuid4()),
        "email": "admin@luminalms.edu",
        "password": hash_password("admin123"),
        "first_name": "System",
        "last_name": "Administrator",
        "role": UserRole.ADMIN,
        "is_active": True,
        "account_status": AccountStatus.ACTIVE,
        "payment_status": PaymentStatus.PAID,
        "enrolled_courses": [],
        "completed_lessons": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin_user)
    
    # Create lecturer
    lecturer_id = str(uuid.uuid4())
    lecturer_user = {
        "id": lecturer_id,
        "email": "lecturer@luminalms.edu",
        "password": hash_password("lecturer123"),
        "first_name": "John",
        "last_name": "Professor",
        "role": UserRole.LECTURER,
        "department": "Public Health",
        "is_active": True,
        "account_status": AccountStatus.ACTIVE,
        "payment_status": PaymentStatus.PAID,
        "enrolled_courses": [],
        "completed_lessons": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(lecturer_user)
    
    # Create student (paid)
    student_id = str(uuid.uuid4())
    student_user = {
        "id": student_id,
        "email": "student@luminalms.edu",
        "password": hash_password("student123"),
        "first_name": "Joseph",
        "last_name": "Ogunsanya",
        "role": UserRole.STUDENT,
        "department": "Public Health",
        "program": "BSc. Public Health",
        "level": 300,
        "student_id": "STU202500001",
        "is_active": True,
        "account_status": AccountStatus.ACTIVE,
        "payment_status": PaymentStatus.PAID,
        "enrolled_courses": [],
        "completed_lessons": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(student_user)
    
    # Create unpaid student
    unpaid_student = {
        "id": str(uuid.uuid4()),
        "email": "unpaid@luminalms.edu",
        "password": hash_password("unpaid123"),
        "first_name": "Jane",
        "last_name": "Unpaid",
        "role": UserRole.STUDENT,
        "department": "Public Health",
        "program": "BSc. Public Health",
        "level": 100,
        "student_id": "STU202500002",
        "is_active": True,
        "account_status": AccountStatus.ACTIVE,
        "payment_status": PaymentStatus.UNPAID,
        "enrolled_courses": [],
        "completed_lessons": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(unpaid_student)
    
    # Create courses with modules
    courses_data = [
        {
            "code": "ENT312",
            "title": "Venture Creation",
            "description": "This course equips students with practical knowledge and skills for venture creation and management.",
            "department": "Entrepreneurship",
            "level": 300,
            "units": 3,
            "semester": 1,
            "course_type": "CORE",
            "category": "Entrepreneurship",
            "grouping_type": "week",
            "image_url": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400"
        },
        {
            "code": "GC101",
            "title": "Guidance and Counselling",
            "description": "Introduction to guidance and counselling principles.",
            "department": "General Studies",
            "level": 100,
            "units": 2,
            "semester": 1,
            "course_type": "CORE",
            "category": "General",
            "grouping_type": "week",
            "image_url": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400"
        },
        {
            "code": "GST122",
            "title": "Communication Skills in English II",
            "description": "Advanced communication skills development.",
            "department": "General Studies",
            "level": 100,
            "units": 2,
            "semester": 2,
            "course_type": "CORE",
            "category": "General Studies",
            "grouping_type": "week",
            "image_url": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400"
        }
    ]
    
    course_ids = []
    for course_data in courses_data:
        course_id = str(uuid.uuid4())
        course = {
            "id": course_id,
            **course_data,
            "lecturer_id": lecturer_id,
            "total_lessons": 0,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.courses.insert_one(course)
        course_ids.append(course_id)
        
        # Create modules for this course
        for week in range(1, 4):
            module = {
                "id": str(uuid.uuid4()),
                "course_id": course_id,
                "title": f"Week {week}: {course_data['title']} Part {week}",
                "description": f"Week {week} content for {course_data['title']}",
                "order": week,
                "week_number": week,
                "is_active": True,
                "lessons": [
                    {
                        "id": str(uuid.uuid4()),
                        "title": f"Week {week}: Reading - Introduction",
                        "content_type": "reading",
                        "description": "Reading material for this week",
                        "order": 1
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "title": f"Week {week}: Video Lecture",
                        "content_type": "video",
                        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                        "duration_seconds": 300,
                        "order": 2
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "title": f"Week {week}: Practice Assessment",
                        "content_type": "quiz",
                        "quiz_data": {
                            "questions": [
                                {"q": "Sample question 1?", "options": ["A", "B", "C", "D"], "answer": 0},
                                {"q": "Sample question 2?", "options": ["A", "B", "C", "D"], "answer": 1}
                            ]
                        },
                        "order": 3
                    }
                ]
            }
            await db.modules.insert_one(module)
        
        # Update course total lessons
        await db.courses.update_one({"id": course_id}, {"$set": {"total_lessons": 9}})
    
    # Create enrollments for paid student
    for i, course_id in enumerate(course_ids[:2]):
        enrollment = {
            "id": str(uuid.uuid4()),
            "student_id": student_id,
            "course_id": course_id,
            "status": "enrolled",
            "progress": 30.0 if i == 0 else 0.0,
            "completed_lessons": [],
            "enrolled_at": datetime.now(timezone.utc).isoformat(),
            "certificate_generated": False
        }
        await db.enrollments.insert_one(enrollment)
    
    # Create transactions
    transactions = [
        {"student_id": student_id, "amount": 315.00, "description": "Tuition - Semester 1", "payment_type": "tuition", "status": "paid", "semester": 1},
        {"student_id": student_id, "amount": 50.00, "description": "Registration Fee", "payment_type": "registration", "status": "paid"},
    ]
    
    for t in transactions:
        transaction = {
            "id": str(uuid.uuid4()),
            **t,
            "invoice_number": generate_invoice_number(),
            "paid_at": datetime.now(timezone.utc).isoformat() if t["status"] == "paid" else None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.transactions.insert_one(transaction)
    
    # Create pending admission
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
            "admin": {"email": "admin@luminalms.edu", "password": "admin123"},
            "lecturer": {"email": "lecturer@luminalms.edu", "password": "lecturer123"},
            "student_paid": {"email": "student@luminalms.edu", "password": "student123"},
            "student_unpaid": {"email": "unpaid@luminalms.edu", "password": "unpaid123"}
        }
    }

# ============== FILE UPLOAD ENDPOINTS ==============

UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

@api_router.post("/upload/document")
async def upload_document(
    file: UploadFile = File(...),
    doc_type: str = Form(...)
):
    """Upload a document (high school certificate or identification)"""
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: JPG, PNG, PDF")
    
    # Validate file size (5MB max)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")
    
    # Generate unique filename
    ext = Path(file.filename).suffix
    unique_filename = f"{doc_type}_{uuid.uuid4().hex}{ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Generate URL (relative to API)
    file_url = f"/api/uploads/{unique_filename}"
    
    logger.info(f"Document uploaded: {unique_filename}")
    return {"url": file_url, "filename": unique_filename}

@api_router.get("/uploads/{filename}")
async def serve_upload(filename: str):
    """Serve uploaded files"""
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Determine content type
    ext = file_path.suffix.lower()
    content_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".pdf": "application/pdf"
    }
    content_type = content_types.get(ext, "application/octet-stream")
    
    with open(file_path, "rb") as f:
        content = f.read()
    
    return Response(content=content, media_type=content_type)

@api_router.post("/upload/course-image")
async def upload_course_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.LECTURER]))
):
    """Upload a course image"""
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: JPG, PNG, WEBP")
    
    # Validate file size (5MB max)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")
    
    # Generate unique filename
    ext = Path(file.filename).suffix
    unique_filename = f"course_{uuid.uuid4().hex}{ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Generate URL
    file_url = f"/api/uploads/{unique_filename}"
    
    logger.info(f"Course image uploaded: {unique_filename}")
    return {"url": file_url, "filename": unique_filename}

# ============== ROOT ==============

@api_router.get("/")
async def root():
    return {"message": "GITB Student LMS API", "version": "2.0.0"}

# Include router
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
