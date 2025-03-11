import React from "react";
import Logo from "../../public/logo.jpg";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function LandingPage() {
  return (
    <main className="flex flex-col gap-10 sm:gap-20 py-10 sm:py-20">
      <section className="text-center">
        <h1 className="flex flex-col items-center justify-center gradient-title">
          find Your Dream Job{" "}
          <span>
            and get Hired{" "}
            <img src={Logo} alt="Logo" className="h-14 sm:h-24 lg:h-32"></img>
          </span>
        </h1>

        <p>
          Explore thousands of job listings or find the perfect candidate 
        </p>
      </section>

      <div>
        <Link to="/job">
          <Button>Find Jobs</Button>
        </Link>

        <Link to="/postjobs">
          <Button>Post Jobs</Button>
        </Link>
      </div>

      <div></div>
    </main>
  );
}

export default LandingPage;
