import React from 'react'
import {useState, useEffect} from "react"
import { supabase } from '@/utils/supabase';
import "./Job.css"


function Job() {

  const [fetchError, setFetchError] = useState(null);
  const [JobData, setJobData] = useState(null);

  useEffect(() =>{
    const fetchJobData = async () => {
      const {data, error} = await supabase
      .from("Posted_Jobs")
      .select()

      if(error){
        setFetchError("Error")
        setJobData(null);
      }

      if(data){
        setJobData(data);
        setFetchError(null);
        console.log(data)
      }
    }

    fetchJobData();
  }, [])


  return (
    <div>Job</div>
  )
}

export default Job