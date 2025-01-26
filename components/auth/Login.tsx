import React, { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';

const Login = () => {
  const [showSignIn, setShowSignIn] = useState(true);

  return (
    <div>
      {showSignIn ? <SignIn /> : <SignUp />}
      <div className="flex justify-center mt-4">
        <button
          className="text-blue-500 hover:underline"
          onClick={() => setShowSignIn(!showSignIn)}
        >
          {showSignIn ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
        </button>
      </div>
    </div>
  );
};

export default Login;
