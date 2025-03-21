import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import './PostJobs.css';
import _ from 'lodash';
import { supabase } from '@/utils/supabase';


function PostJobs() {
  const editorRef = useRef(null);
  const formRef = useRef(null);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const SuccessPopup = ({ onClose }) => {
    return (
      <div className="success-popup-overlay" onClick={onClose}>
        <div className="success-popup-content" onClick={(e) => e.stopPropagation()}>
          <div className="success-animation">
            <svg className="checkmark" viewBox="0 0 52 52">
              <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          <h2 className="success-title">Opportunity Posted! 🎉</h2>
          <p className="success-message">
            Your job posting is now live and visible to our community of talented professionals.
          </p>
          <button
            onClick={onClose}
            className="success-close-btn"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  const [jobData, setJobData] = useState({
    CompanyName: "",
    Location: "",
    Role: "",
    JobType: "",
    LocationType: "",
    Description: ""
  });

  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [desc, setDesc] = useState("");  // ✅ Added desc state

  useEffect(() => {
    const stateFormatted = _.startCase(state.toLowerCase());
    const countryFormatted = _.startCase(country.toLowerCase());
    const loc = `${stateFormatted}, ${countryFormatted}`;

    setJobData({
      CompanyName: companyName,
      Location: loc,
      Role: role,
      JobType: employmentType,
      LocationType: workMode,
      Description: desc
    });

  }, [companyName, role, state, country, employmentType, workMode, desc]);

  // const handleSubmit = async (e) => {

  //   const stateFormatted = _.startCase(state.toLowerCase());
  //   const countryFormatted = _.startCase(country.toLowerCase());
  //   const loc = `${stateFormatted}, ${countryFormatted}`;

  //   e.preventDefault();

  //   const { data, error } = await supabase
  //     .from("Posted_Jobs")
  //     .insert([
  //       {
  //         CompanyName: companyName,
  //         Location: loc,
  //         Role: role,
  //         JobType: employmentType,
  //         LocationType: workMode,
  //         Description: desc
  //       }
  //     ]);

  //   if (error) {
  //     console.log("Error: ", error.message);
  //     alert("Failed to add Job" + error.message);
  //   }
  //   else {
  //     setShowSuccessPopup(true);
  //     console.log(jobData);
  //   }



  //   setCompanyName("");
  //   setRole("");
  //   setState("");
  //   setCountry("");
  //   setEmploymentType("");
  //   setWorkMode("");
  //   setDesc("");


  //   if (editorRef.current && editorRef.current.editor) {
  //     editorRef.current.editor.setContent('');
  //   }
  // };



  const handleSubmit = async (e) => {

    const stateFormatted = _.startCase(state.toLowerCase());
    const countryFormatted = _.startCase(country.toLowerCase());
    const loc = `${stateFormatted}, ${countryFormatted}`;
    
    e.preventDefault();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(desc, 'text/html');
    const textContent = doc.body.textContent;
    setDesc(textContent); // store the text in the desc variable
    
    const {data, error} = await supabase
    .from("Posted_Jobs")
    .insert([
      {
        CompanyName: companyName,
        Location: loc,
        Role: role,
        JobType: employmentType,
        LocationType: workMode,
        Description: textContent
      }
    ]);
    
    if (error){
      console.log("Error: ", error.message);
      alert("Failed to add Job" + error.message);
    }
    else{
      setShowSuccessPopup(true);
      console.log(textContent); // logs the description without HTML tags
      console.log(jobData);
    }
  
  
    
    setCompanyName("");
    setRole("");
    setState("");
    setCountry("");
    setEmploymentType("");
    setWorkMode("");
    // setDesc(""); // do not reset desc here, it will be reset when the editor content is cleared
  
    
    if (editorRef.current && editorRef.current.editor) {
      editorRef.current.editor.setContent('');
    }
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
              placeholder="Google"
              className="hover-effect"
              onChange={(e) => setCompanyName(e.target.value)}
              value={companyName}
              required
            />
          </div>

          <div className="form-group animate-slide-right">
            <label htmlFor="jobRole">Job Role</label>
            <input
              type="text"
              id="jobRole"
              placeholder="Software Engineer"
              className="hover-effect"
              onChange={(e) => setRole(e.target.value)}
              value={role}
              required
            />
          </div>

          <div className="form-group animate-slide-left">
            <label htmlFor="state">State</label>
            <input
              type="text"
              id="state"
              placeholder="California"
              className="hover-effect"
              onChange={(e) => setState(e.target.value.trim())}
              value={state}
              required
            />
          </div>

          <div className="form-group animate-slide-right">
            <label htmlFor="country">Country</label>
            <input
              type="text"
              id="country"
              placeholder="United States"
              className="hover-effect"
              onChange={(e) => setCountry(e.target.value.trim())}
              value={country}
              required
            />
          </div>

          <div className="form-group animate-slide-left">
            <label htmlFor="jobType">Employment Type</label>
            <select
              id="jobType"
              required
              className="hover-effect"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
            >
              <option value="">Select type</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Intern">Intern</option>
            </select>
          </div>

          <div className="form-group animate-slide-right">
            <label htmlFor="locationType">Work Mode</label>
            <select
              id="locationType"
              required
              className="hover-effect"
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
            >
              <option value="">Select mode</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
          </div>
        </div>

        <div className="editor-container animate-fade-in">
          <label>Job Description</label>
          <Editor
            ref={editorRef}
            apiKey='zu44s9lz8czbeutnpmf1j1grlk9muzyiozvy90w7uz7m8ga2'
            init={{
              selector: "textarea",
              placeholder: "Enter job description...",
              plugins: [
                'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                'checklist', 'mediaembed', 'casechange', 'export', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
              ],
              toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
              tinycomments_mode: 'embedded',
              tinycomments_author: 'Author name',
              mergetags_list: [
                { value: 'First.Name', title: 'First Name' },
                { value: 'Email', title: 'Email' },
              ],
              ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
            }}
            // initialValue="Enter job description..."
            onEditorChange={(content) => setDesc(content)}
          />
        </div>

        <button type="submit" className="submit-button animate-pulse">
          Post Opportunity ✨
          <div className="button-hover-effect"></div>
        </button>
      </form>


      {showSuccessPopup && (
        <SuccessPopup onClose={() => setShowSuccessPopup(false)} />
      )}
    </div>
  );
}

export default PostJobs;
