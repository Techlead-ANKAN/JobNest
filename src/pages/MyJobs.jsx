import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useUser } from '@clerk/clerk-react';
import './MyJobs.css'; // Import the CSS file

function MyJobs() {
  const { user } = useUser();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppliedJobDetails = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("Applied_Jobs")
          .select(`JobId, Posted_Jobs(id, Location, Role, Description, created_at, CompanyName, JobType, LocationType)`)
          .eq("UserId", user.id);

        if (error) throw error;
        if (data) setAppliedJobs(data.map(item => item.Posted_Jobs));

      } catch (error) {
        console.error("Error fetching applied job details: ", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobDetails();
  }, [user]);

  if (loading) return <div className="loading-message">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="my-jobs-container">
      <h1 className="my-jobs-heading">My Applied Jobs</h1>
      {appliedJobs.length === 0 ? (
        <p className="no-jobs-message">No jobs applied yet.</p>
      ) : (
        <div className="jobs-list">
          {appliedJobs.map((job) => (
            <div key={job.id} className="job-card">
              <h2 className="job-role">{job.Role}</h2>
              <p className="company-name">{job.CompanyName}</p>
              <div className="job-details">
                <p>Location: {job.Location}</p>
                <p>Job Type: {job.JobType}</p>
                <p>Location Type: {job.LocationType}</p>
                <p>Description: {job.Description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyJobs;