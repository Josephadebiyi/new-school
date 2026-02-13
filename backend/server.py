from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query, Response
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
import io

# Email with Resend
import resend

# PDF Generation
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend configuration
resend.api_key = os.environ.get('RESEND_API_KEY', '')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'noreply@gitb.lt')

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'lumina-lms-secret-key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI(title="LuminaLMS API")
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

class SystemConfig(BaseModel):
    university_name: str = "LuminaLMS University"
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
            "university_name": "LuminaLMS University",
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
        university_name = config.get("university_name", "LuminaLMS University")
        
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
        university_name = config.get("university_name", "LuminaLMS University")
        
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
    university_name = config.get("university_name", "LuminaLMS University")
    
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
    university_name = config.get("university_name", "LuminaLMS University")
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
        [transaction.get("description", "Payment"), f"${transaction.get('amount', 0):.2f}"],
        ["", ""],
        ["Total Paid", f"${transaction.get('amount', 0):.2f}"],
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
    university_name = config.get("university_name", "LuminaLMS University")
    
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
    user = await db.users.find_one({"email": request.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(request.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account is inactive")
    
    token = create_access_token(user["id"], user["role"])
    user_response = {k: v for k, v in user.items() if k != "password"}
    config = await get_system_config()
    
    return LoginResponse(
        access_token=token, 
        user=UserResponse(**user_response),
        system_config=config
    )

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
        "university_name": "LuminaLMS University",
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

# ============== ROOT ==============

@api_router.get("/")
async def root():
    return {"message": "LuminaLMS API", "version": "2.0.0"}

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
