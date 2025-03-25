import React, { useEffect, useState } from 'react'
import "./SavedJobs.css"
import { useUser } from '@clerk/clerk-react'
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from '@/utils/supabase';
// import { ReactComponent as RemoveIcon } from './remove-icon.svg';
import { FaTrashAlt } from 'react-icons/fa';

function SavedJobs() {


  // const formatDate = (dateString) => {
  //   try {
  //     const options = { year: "numeric", month: "long", day: "numeric" };
  //     return new Date(dateString).toLocaleDateString(undefined, options);
  //   } catch {
  //     return "Invalid date";
  //   }
  // };


  const [selectedJob, setSelectedJob] = useState(null);
  // Add this function to handle modal close
  const closeModal = () => {
    setSelectedJob(null);
    document.body.style.overflow = "auto";
  };


  useEffect(() => {
    if (selectedJob) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [selectedJob]);


  // Add the modal component before the return statement's closing div
  const JobDetailsModal = ({ job, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-backdrop"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        <div className="modal-header">
          <div className="company-header">
            <div className="company-initial-lg">
              {job.CompanyName?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <h2>{job.CompanyName}</h2>
              <p className="job-date">{formatDate(job.created_at)}</p>
            </div>
          </div>
          <h1 className="job-title-modal">{job.Role}</h1>
        </div>

        <div className="modal-body">
          <div className="job-meta-grid">
            <div className="meta-item">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
              </svg>
              <div>
                <span className="meta-label">Location</span>
                <span className="meta-value">{job.Location}</span>
              </div>
            </div>
            <div className="meta-item">
              <svg viewBox="0 0 24 24">
                <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" />
              </svg>
              <div>
                <span className="meta-label">Job Type</span>
                <span className="meta-value">{job.JobType}</span>
              </div>
            </div>
            <div className="meta-item">
              <svg viewBox="0 0 24 24">
                <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
              </svg>
              <div>
                <span className="meta-label">Work Type</span>
                <span className="meta-value">{job.LocationType}</span>
              </div>
            </div>
          </div>

          <div className="job-description-modal">
            <h3>Job Description</h3>
            <div className="description-content">
              {job.Description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Link to={`/apply/${job.id}`} className="primary-button">
            Apply Now
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );

  // Inside SavedJobs.jsx
  const RemoveIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );

  const { user } = useUser();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedJobDetails = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("Saved_Jobs")
        .select(`JobId, Posted_Jobs(id, Location, Role, Description, CompanyName, JobType, LocationType)`)
        .eq(`UserId`, user.id);


      if (error) {
        console.error("Error fetching saved job details: ", error);
        return;
      }

      setSavedJobs(data.map(item => item.Posted_Jobs));
      setLoading(false);
    };

    fetchSavedJobDetails();
  }, [user]);

  const handleRemoveJob = async (jobId) => {
    const { error } = await supabase
      .from('Saved_Jobs')
      .delete()
      .eq('UserId', user.id)
      .eq('JobId', jobId);

    if (!error) {
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    }
  };

  if (loading) {
    return <div className="saved-jobs-container">Loading...</div>;
  }





  return (
    <div className="saved-jobs-container">

      {SavedJobs.length === 0 ? (
        <div className="saved-header">
          <p className="gradient-text">Welcome back, {user?.fullName}</p>
          <p className="section-subtitle">No saved jobs!!!</p>
        </div>
      ) : (
        <div className="saved-header">
          <h1 className="gradient-text">Saved Positions</h1>
          <p className="user-greeting">Welcome back, {user?.fullName}</p>
          <p className="section-subtitle">Your curated list of opportunities</p>
        </div>
      )}

      <div className="saved-jobs-grid">
        {savedJobs.map((job) => (
          <div key={job.id} className="saved-job-card">
            <button
              className="remove-btn"
              onClick={() => handleRemoveJob(job.id)}
            >
              <FaTrashAlt className="btn-icon" />
            </button>
            <div className="saved-job-content">
              <div className="saved-company-header">
                <div className="saved-company-initial">
                  {job.CompanyName[0]}
                </div>
                <div>
                  <h3 className="company-name">{job.CompanyName}</h3>
                  {/* <p className="job-date">Saved on {new Date().toLocaleDateString()}</p> */}
                </div>
              </div>
              <h2 className="saved-job-title">{job.Role}</h2>
              <div className="saved-job-meta">
                <div className="saved-meta-item">
                  <svg className="saved-meta-icon" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <div>
                    <span className="meta-label">Location</span>
                    <span className="meta-value">{job.Location}</span>
                  </div>
                </div>
                <div className="saved-meta-item">
                  <svg className="saved-meta-icon" viewBox="0 0 24 24">
                    <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
                  </svg>
                  <div>
                    <span className="meta-label">Type</span>
                    <span className="meta-value">{job.JobType}</span>
                  </div>
                </div>
              </div>
              <p className="saved-job-description">{job.Description}</p>

              <button
                className="secondary-button"
                onClick={() => {
                  setSelectedJob(job);
                }}
              >
                <svg viewBox="0 0 24 24" className="btn-icon">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>


      {selectedJob && (
        <JobDetailsModal job={selectedJob} onClose={closeModal} />
      )}

    </div>
  )
}

export default SavedJobs;