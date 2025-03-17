import React from "react";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import "./Job.css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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
          query = query.ilike("Role", `%${searchTerm}%`);
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

  // console.log(selectedType);

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
              {/* <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Locations</option>
                <option value="New York">New York</option>
                <option value="San Francisco">San Francisco</option>
                <option value="London">London</option>
                <option value="Berlin">Berlin</option>
              </select> */}

              <input type="text" 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
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
              <div className="company-badge">
                <div className="company-initial">
                  {job.CompanyName?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <h3 className="company-name">{job.CompanyName}</h3>
                  <p className="job-date">{formatDate(job.created_at)}</p>
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
              <Link to={`/jobs/${job.id}`} className="secondary-button">
                <svg viewBox="0 0 24 24" className="btn-icon">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
                View Details
              </Link>
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
    </div>
  );
}

export default Job;
