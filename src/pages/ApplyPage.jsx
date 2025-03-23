import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase';
import './ApplyPage.css';

function ApplyPage() {
    const { user } = useUser();
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        basicInfo: {
            firstName: '',
            middleName: '',
            lastName: '',
            email: '',
            phone: '',
            location: '',
            linkedIn: '',
            portfolio: ''
        },
        education: [{
            qualification: '',
            institution: '',
            graduationYear: '',
            fieldOfStudy: '',
            grade: ''
        }],
        workExperience: [{
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            responsibilities: '',
            current: false
        }],
        skills: {
            technical: '',
            certifications: '',
            languages: '',
            github: ''
        },
        documents: {
            resume: null,
            coverLetter: null
        },
        preferences: {
            jobLocation: '',
            expectedSalary: '',
            noticePeriod: '',
            references: ''
        }
    });


    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const { data, error } = await supabase
                    .from('Posted_Jobs')
                    .select('*')
                    .eq('id', jobId)
                    .single();

                if (error) throw error;

                console.log('Fetched Job Details:', data);  // Log all job details
                setJob(data);
            } catch (error) {
                console.error('Failed to load job details:', error.message);
                setError('Failed to load job details');
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, [jobId]);


    const handleInputChange = (section, field, value, index = null) => {
        setFormData(prev => {
            if (index !== null) {
                const newArray = [...prev[section]];
                newArray[index][field] = value;
                return { ...prev, [section]: newArray };
            }
            return {
                ...prev,
                [section]: { ...prev[section], [field]: value }
            };
        });
    };

    const handleFileUpload = async (file, type) => {
        const fileName = `${user.id}_${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
            .from('applications')
            .upload(fileName, file);
        if (error) throw error;
        return data.path;
    };

    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            education: [...prev.education, {
                qualification: '',
                institution: '',
                graduationYear: '',
                fieldOfStudy: '',
                grade: ''
            }]
        }));
    };

    const addWorkExperience = () => {
        setFormData(prev => ({
            ...prev,
            workExperience: [...prev.workExperience, {
                company: '',
                position: '',
                startDate: '',
                endDate: '',
                responsibilities: '',
                current: false
            }]
        }));
    };

    const validateForm = () => {
        const { basicInfo, documents } = formData;
        const requiredFields = [
            basicInfo.firstName,
            basicInfo.lastName,
            basicInfo.email,
            basicInfo.phone,
            documents.resume
        ];
        return requiredFields.every(field => field !== '' && field !== null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            setError('Please fill all required fields (*)');
            return;
        }

        try {
            // Upload documents
            // const resumeUrl = await handleFileUpload(formData.documents.resume, 'resume');
            // const coverLetterUrl = formData.documents.coverLetter
            //     ? await handleFileUpload(formData.documents.coverLetter, 'coverLetter')
            //     : null;

            // Save application to Supabase
            const { error } = await supabase.from('Applied_Jobs').insert({
                JobId: jobId,
                UserId: user.id,
                // AppliedAt: new Date().toISOString()
            });

            if (error) throw error;

            // Here you would typically store other form data in a separate table
            // await supabase.from('Application_Details').insert({ ... });

            setSuccess(true);
            setTimeout(() => navigate('/job'), 3000);
        } catch (error) {
            setError('Application submission failed: ' + error.message);
        }
    };

    if (loading) return <div className="loading">Loading job details...</div>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="apply-container"
        >
            {success && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="success-modal"
                >
                    <h3>✅ Application Submitted!</h3>
                    <p>Redirecting to jobs page...</p>
                </motion.div>
            )}

            <div className="apply-header">
                <h1>Apply for {job?.Role}</h1>
                <h2 className="company-name">{job?.CompanyName}</h2>
            </div>

            {/* Add this inside the ApplyPage component */}
            <Section title="Job Details">
                <div className="job-details">
                    {job && (
                        <>
                            <div className="detail-item">
                                <label>Role:</label>
                                <span>{job.Role}</span>
                            </div>
                            <div className="detail-item">
                                <label>Company:</label>
                                <span>{job.CompanyName}</span>
                            </div>
                            <div className="detail-item">
                                <label>Job Type:</label>
                                <span>{job.JobType}</span>
                            </div>
                            <div className="detail-item">
                                <label>Location:</label>
                                <span>{job.Location}</span>
                            </div>
                            <div className="detail-item">
                                <label>Location Type:</label>
                                <span>{job.LocationType}</span>
                            </div>
                            <div className="detail-item full-width">
                                <label>Description:</label>
                                <p className="description-text">{job.Description}</p>
                            </div>
                        </>
                    )}
                </div>
            </Section>

            <form onSubmit={handleSubmit} className="application-form">
                {/* Basic Information Section */}
                <Section title="Basic Information">
                    <div className="form-grid">
                        <InputField label="First Name *" value={formData.basicInfo.firstName}
                            onChange={v => handleInputChange('basicInfo', 'firstName', v)} />
                        <InputField label="Middle Name" value={formData.basicInfo.middleName}
                            onChange={v => handleInputChange('basicInfo', 'middleName', v)} />
                        <InputField label="Last Name *" value={formData.basicInfo.lastName}
                            onChange={v => handleInputChange('basicInfo', 'lastName', v)} />
                        <InputField label="Email *" type="email" value={formData.basicInfo.email}
                            onChange={v => handleInputChange('basicInfo', 'email', v)} />
                        <InputField label="Phone *" type="tel" value={formData.basicInfo.phone}
                            onChange={v => handleInputChange('basicInfo', 'phone', v)} />
                        <InputField label="Location (City, State)" value={formData.basicInfo.location}
                            onChange={v => handleInputChange('basicInfo', 'location', v)} />
                        <InputField label="LinkedIn Profile" value={formData.basicInfo.linkedIn}
                            onChange={v => handleInputChange('basicInfo', 'linkedIn', v)} />
                        <InputField label="Portfolio/Website" value={formData.basicInfo.portfolio}
                            onChange={v => handleInputChange('basicInfo', 'portfolio', v)} />
                    </div>
                </Section>

                {/* Education Section */}
                <Section title="Education Details">
                    {formData.education.map((edu, index) => (
                        <div key={index} className="form-grid">
                            <InputField label="Degree/Qualification *" value={edu.qualification}
                                onChange={v => handleInputChange('education', 'qualification', v, index)} />
                            <InputField label="Institution *" value={edu.institution}
                                onChange={v => handleInputChange('education', 'institution', v, index)} />
                            <InputField label="Graduation Year *" type="number" value={edu.graduationYear}
                                onChange={v => handleInputChange('education', 'graduationYear', v, index)} />
                            <InputField label="Field of Study" value={edu.fieldOfStudy}
                                onChange={v => handleInputChange('education', 'fieldOfStudy', v, index)} />
                            <InputField label="Grade/CGPA" value={edu.grade}
                                onChange={v => handleInputChange('education', 'grade', v, index)} />
                        </div>
                    ))}
                    <button type="button" onClick={addEducation} className="add-button">
                        + Add Another Education
                    </button>
                </Section>

                {/* Work Experience Section */}
                <Section title="Work Experience">
                    {formData.workExperience.map((exp, index) => (
                        <div key={index} className="form-grid">
                            <InputField label="Company Name *" value={exp.company}
                                onChange={v => handleInputChange('workExperience', 'company', v, index)} />
                            <InputField label="Job Title *" value={exp.position}
                                onChange={v => handleInputChange('workExperience', 'position', v, index)} />
                            <InputField label="Start Date *" type="date" value={exp.startDate}
                                onChange={v => handleInputChange('workExperience', 'startDate', v, index)} />
                            <InputField label="End Date" type="date" value={exp.endDate}
                                onChange={v => handleInputChange('workExperience', 'endDate', v, index)}
                                disabled={exp.current} />
                            <div className="checkbox-group">
                                <label>
                                    <input type="checkbox" checked={exp.current}
                                        onChange={e => handleInputChange('workExperience', 'current', e.target.checked, index)} />
                                    Currently working here
                                </label>
                            </div>
                            <InputField label="Responsibilities" textarea value={exp.responsibilities}
                                onChange={v => handleInputChange('workExperience', 'responsibilities', v, index)} />
                        </div>
                    ))}
                    <button type="button" onClick={addWorkExperience} className="add-button">
                        + Add Another Experience
                    </button>
                </Section>

                {/* Documents Section */}
                <Section title="Documents">
                    <div className="form-grid">
                        <FileUpload
                            label="Resume * (PDF/DOC)"
                            required
                            onChange={file => handleInputChange('documents', 'resume', file)}
                        />
                        <FileUpload
                            label="Cover Letter (PDF/DOC)"
                            onChange={file => handleInputChange('documents', 'coverLetter', file)}
                        />
                    </div>
                </Section>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="submit-button"
                    >
                        Submit Application
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
}

// Reusable Components
const Section = ({ title, children }) => (
    <motion.section initial={{ y: 20 }} animate={{ y: 0 }} className="form-section">
        <h3>{title}</h3>
        {children}
    </motion.section>
);

const InputField = ({ label, value, onChange, type = 'text', textarea = false, ...props }) => (
    <div className="form-group">
        <label>{label}</label>
        {textarea ? (
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                {...props}
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                {...props}
            />
        )}
    </div>
);

const FileUpload = ({ label, onChange, required }) => {
    const [fileName, setFileName] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            onChange(file);
        }
    };

    return (
        <div className="form-group">
            <label>{label}</label>
            <div className="file-upload">
                <input
                    type="file"
                    onChange={handleFileChange}
                    required={required}
                    accept=".pdf,.doc,.docx"
                />
                <span>{fileName || 'Choose File'}</span>
            </div>
        </div>
    );
};

export default ApplyPage;