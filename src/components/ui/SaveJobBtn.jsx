import React from 'react';
import { supabase } from "@/utils/supabase";
import { useUser } from '@clerk/clerk-react';

const SaveJobBtn = ({ job, handleSave }) => {
  const { user } = useUser();

  const handleClick = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please Sign In");
      return;
    }

    const { data, error } = await supabase
      .from("Saved_Jobs")
      .upsert([
        { UserId: user.id, JobId: job.id }
      ], { onConflict: ["UserId", "JobId"] })

    if (error) {
      console.error("Error saving jobs: ", error.message);
    } else {
      alert("Job Saved");
    }
  };

  return (
    <div className="save" onClick={handleClick}>
      SAVE
    </div>
  );
};

export default SaveJobBtn;