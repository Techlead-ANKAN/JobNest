// Dependencies
import React from 'react'
import { Link } from 'react-router-dom'

// Button - ShadCN Ui 
import { Button } from './button'

// Assests
import Logo from "../../../public/logo.jpg"

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";


function Header() {
  return (
    <nav className='py-4 flex justify-between item-center'>
      <Link to="/">
        <img src={Logo} className="h-20" alt="Logo" />
      </Link>

      <Button variant="outline">Login</Button>

      {/* <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn> */}
    </nav>
  )
}

export default Header