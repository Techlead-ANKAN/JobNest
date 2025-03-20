import React from "react";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import "./Job.css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CheckBox from "@/components/ui/CheckBox";

function Job() {
  const [fetchError, setFetchError] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLocationType, setSelectedLocationType] = useState("all");

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        let query = supabase
          .from("Posted_Jobs")
          .select()
          .order("created_at", { ascending: false });

        if (searchTerm) {
          query = query.ilike("CompanyName", `%${searchTerm}%`);
        }
        if (selectedType !== "all") {
          query = query.eq("JobType", selectedType);
        }
        if (selectedLocation !== "") {
          query = query.ilike("Location", `%${selectedLocation}%`);
        }
        if (selectedLocationType !== "all") {
          query = query.eq("LocationType", selectedLocationType);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
          const validatedData = data.map((job) => ({
            ...job,
            CompanyName: job.CompanyName || "Unknown Company",
            Description: job.Description || "No description provided",
            Location: job.Location || "Location not specified",
            Role: job.Role || "Undefined Role",
            JobType: job.JobType || "Full-Time",
            LocationType: job.LocationType || "Onsite",
          }));
          setJobData(validatedData);
          setFetchError(null);
        }
      } catch (error) {
        setFetchError("Failed to load job listings");
        setJobData(null);
      }
    };

    fetchJobData();
  }, [searchTerm, selectedType, selectedLocation, selectedLocationType]);

  const toggleDescription = (id) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDate = (dateString) => {
    try {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return "Invalid date";
    }
  };


  const [selectedJob, setSelectedJob] = useState(null);

  // Add this function to handle modal close
  const closeModal = () => {
    setSelectedJob(null);
    document.body.style.overflow = "auto";
  };

  // Add this effect to handle body scroll when modal is open
  useEffect(() => {
    if (selectedJob) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [selectedJob]);

  // ... rest of existing code ...

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

  const [favorites, setFavorites] = useState({});
  const [showFavoritePopup, setShowFavoritePopup] = useState(false);

  const handleFavoriteToggle = (jobId) => {
    setFavorites(prev => ({ ...prev, [jobId]: !prev[jobId] }));
    setShowFavoritePopup(true);
  };

  useEffect(() => {
    if (showFavoritePopup) {
      const timer = setTimeout(() => setShowFavoritePopup(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showFavoritePopup]);

  const saveFunction = () => {
    console.log("Saved Job")
  }

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h1 className="gradient-title">
          <span className="gradient-text">Explore Career Opportunities</span>
        </h1>
        <p className="section-subtitle">
          Find your perfect position at leading companies worldwide
        </p>

        {/* Filters Section - Make sure this is uncommented */}
        <div className="filters-container">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search by job title or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <svg className="search-icon" viewBox="0 0 24 24">
              <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z" />
            </svg>
          </div>

          <div className="filter-group">
            <div className="filter-category">
              <span>Job Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Intern">Intern</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div className="filter-category">
              <span>Work Type:</span>
              <select
                value={selectedLocationType}
                onChange={(e) => setSelectedLocationType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Work Types</option>
                <option value="Onsite">Onsite</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="filter-category">
              <span>Location:</span>
              <input
                type="text"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value.trimStart().trimEnd())}
                className="filter-select"
                placeholder="state, country"
              />
            </div>
          </div>
        </div>
      </div>

      {fetchError && <p className="error-message">{fetchError}</p>}

      <div className="jobs-grid">
        {jobData?.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="job-card"
          >
            <div className="job-card-header">
              {/* <button className="save" onClick={saveFunction}>
                SAVE
              </button> */}

              <div className="company-badge">
                <div className="company-initial">
                  {job.CompanyName?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <h3 className="company-name">{job.CompanyName}</h3>
                  <p className="job-date">{formatDate(job.created_at)}</p>
                </div>
                {/* checkbox */}
                <div className="checkbox-container">
                  <CheckBox
                    checked={favorites[job.id] || false}
                    onChange={() => handleFavoriteToggle(job.id)}
                  />
                </div>
              </div>
            </div>

            <div className="job-card-body">
              <h2 className="job-title">{job.Role}</h2>

              <div className="job-type-div">
                <span className={`job-type ${job.JobType.replace(" ", "-")}`}>
                  {job.JobType}
                </span>
              </div>
              <div className="job-meta-container">
                <div className="job-meta">
                  <div className="meta-item">
                    <svg className="meta-icon" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                    </svg>
                    <span>{job.Location}</span>
                  </div>
                  <div className="meta-item">
                    <svg className="meta-icon" viewBox="0 0 24 24">
                      <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                      <path d="M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z" />
                    </svg>
                    <span>{job.LocationType}</span>
                  </div>
                </div>
              </div>

              <div className="job-description">
                <p>
                  {expandedDescriptions[job.id]
                    ? job.Description
                    : `${job.Description.substring(0, 100)}...`}
                </p>
                {job.Description?.length > 100 && (
                  <button
                    onClick={() => toggleDescription(job.id)}
                    className="text-primary"
                  >
                    {expandedDescriptions[job.id] ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            </div>

            {/* Updated Button JSX */}
            <div className="job-card-footer">
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

              {/* Job Details Modal */}

              <Link to={`/apply/${job.id}`} className="primary-button">
                Apply
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {jobData?.length === 0 && (
        <div className="no-results">
          <h3>No jobs found matching your criteria</h3>
          <p>Try adjusting your filters or search terms</p>
        </div>
      )}



      {selectedJob && <JobDetailsModal job={selectedJob} onClose={closeModal} />}

      {/* Favorite Popup */}
      {showFavoritePopup && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="favorite-popup"
        >
          <svg viewBox="0 0 24 24" className="popup-icon">
            <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span>Job marked as favorite</span>
        </motion.div>
      )}
    </div>
  );
}

export default Job;










