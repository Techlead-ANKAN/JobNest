import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import './PostJobs.css';

function PostJobs() {
  const editorRef = useRef(null);
  const formRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      console.log("Job Description:", content);
    }
    // Add form submission logic here
  };

  return (
    <div className="post-job-container">
      <div className="post-job-header">
        <h1 className="gradient-heading">Post a New Opportunity</h1>
        <p className="subtitle">Find the perfect candidate for your team</p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="job-post-form">
        <div className="form-grid">
          <div className="form-group animate-slide-left">
            <label htmlFor="companyName">Company Name</label>
            <input 
              type="text" 
              id="companyName" 
              required 
              placeholder="Google" 
              className="hover-effect"
            />
          </div>

          <div className="form-group animate-slide-right">
            <label htmlFor="jobRole">Job Role</label>
            <input 
              type="text" 
              id="jobRole" 
              required 
              placeholder="Software Engineer" 
              className="hover-effect"
            />
          </div>

          <div className="form-group animate-slide-left">
            <label htmlFor="state">State</label>
            <input 
              type="text" 
              id="state" 
              required 
              placeholder="California" 
              className="hover-effect"
            />
          </div>

          <div className="form-group animate-slide-right">
            <label htmlFor="country">Country</label>
            <input 
              type="text" 
              id="country" 
              required 
              placeholder="United States" 
              className="hover-effect"
            />
          </div>

          <div className="form-group animate-slide-left">
            <label htmlFor="jobType">Employment Type</label>
            <select id="jobType" required className="hover-effect">
              <option value="">Select type</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div className="form-group animate-slide-right">
            <label htmlFor="locationType">Work Mode</label>
            <select id="locationType" required className="hover-effect">
              <option value="">Select mode</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>
        </div>

        <div className="editor-container animate-fade-in">
          <label>Job Description</label>
          <Editor
            apiKey='zu44s9lz8czbeutnpmf1j1grlk9muzyiozvy90w7uz7m8ga2'
            onInit={(e, editor) => editorRef.current = editor}
            init={{
              plugins: [
                'advcode link lists media table wordcount a11ychecker powerpaste advtable'
              ],
              toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist | link table',
              menubar: false,
              content_style: 'body { font-family: "Inter", sans-serif; font-size: 15px; line-height: 1.6 }',
              height: 400,
              skin: 'oxide-dark',
              icons: 'thin',
              branding: false,
              statusbar: false,
            }}
            className="editor-hover-effect"
          />
        </div>

        <button type="submit" className="submit-button animate-pulse">
          Post Opportunity ✨
          <div className="button-hover-effect"></div>
        </button>
      </form>
    </div>
  );
}

export default PostJobs;