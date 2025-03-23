// // Dependencies
// import React from 'react'
// import { Link } from 'react-router-dom'

// // Button - ShadCN Ui 
// import { Button } from './button'

// // Assests
// import Logo from "../../../public/logo.jpg"

// import "./Header.css"

// import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";


// function Header() {
//   return (
//     <nav className='py-4 flex justify-between item-center'>
//       <Link to="/">
//         <img src={Logo} className="h-20" alt="Logo" />
//       </Link>

//       {/* <Button variant="outline">Login</Button> */}

//       <SignedOut>
//         <SignInButton />
//       </SignedOut>
//       <SignedIn>
//         <UserButton />
//       </SignedIn>
//     </nav>
//   )
// }

// export default Header






import React from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import Logo from "../../../public/logo1.png";
import "./Header.css";
import { BriefcaseIcon, Heart } from 'lucide-react';

function Header() {
  return (
    <header className="main-header">
      <nav className="header-content">
        <div className="brand-container">
          <Link to="/" className="logo-link">
            <img src={Logo} className="header_logo" alt="CareerConnect" />
          </Link>
        </div>
        <h1 className="site-title">
          <span className="typing-animation">JobNest</span>
        </h1>

        <div className="auth-section">
          <SignedOut>
            <SignInButton mode='modal'>
              <button className="sign-in-button">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="user-profile">
              <UserButton
                appearance={{
                  elements: {
                    userButtonTrigger: {
                      width: "40px",  // New size
                      height: "40px", // New size
                    },
                    userButtonPopoverCard: "user-popover",
                    avatarBox: "user-avatar-box",
                    avatarImage: "user-avatar-image"
                  }
                }}
              >
                <UserButton.MenuItems>
                <UserButton.Link label="My Jobs" labelIcon={<BriefcaseIcon size={15} />} href='/myjobs' />
                <UserButton.Link label="Saved Jobs" labelIcon={<Heart size={15} />} href='/savedjobs' />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}

export default Header;