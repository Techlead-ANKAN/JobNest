import React, { useEffect, useState } from 'react'
import "./SavedJobs.css"
import { useUser } from '@clerk/clerk-react'
import { supabase } from '@/utils/supabase';
// import { ReactComponent as RemoveIcon } from './remove-icon.svg';
import { FaTrashAlt } from 'react-icons/fa';

function SavedJobs() {


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
      <div className="saved-header">
        <h1 className="gradient-text">Saved Positions</h1>
        <p className="user-greeting">Welcome back, {user?.fullName}</p>
        <p className="section-subtitle">Your curated list of opportunities</p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="empty-state">
          <RemoveIcon className="empty-state-icon" />
          <h3>No Saved Positions Found</h3>
          <p>Start saving jobs that interest you!</p>
        </div>
      ) : (
        <div className="saved-jobs-grid">
          {savedJobs.map((job) => (
            <div key={job.id} className="saved-job-card">
              <button
                className="remove-btn"
                onClick={() => handleRemoveJob(job.id)}
              >
                <RemoveIcon />
                Remove
              </button>
              <div className="saved-job-content">
                <div className="saved-company-header">
                  <div className="saved-company-initial">
                    {job.CompanyName[0]}
                  </div>
                  <div>
                    <h3 className="company-name">{job.CompanyName}</h3>
                    <p className="job-date">Saved on {new Date().toLocaleDateString()}</p>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SavedJobs;