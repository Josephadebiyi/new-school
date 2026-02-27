import React from 'react';
import { Link } from 'react-router-dom';
import './CourseCard.css';

const CourseCard = ({ course }) => {
    return (
        <Link to={`/apply?course=${course._id}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <img
                src={course.image_url ? `/images/${course.image_url}` : 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'}
                alt={course.title}
                className="card-img"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'; }}
            />
            <div className="card-content">
                <span className="card-tag">Online & Campus</span>
                <h3>{course.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description}
                </p>
                <div style={{ marginTop: '20px', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
                    {course.price ? `€${course.price}` : 'Contact for pricing'}
                </div>
            </div>
        </Link>
    );
};

export default CourseCard;
