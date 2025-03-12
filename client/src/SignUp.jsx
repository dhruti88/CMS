import React from 'react';
import './styles/SignUp.css';
import CustomButton from './components/atoms/button/CustomButton';

const SignUp = () => {
  return (
    <div className="signup-container">
      <div className="signup-form">
        <h2>Sign Up</h2>
        <p>Welcome, please sign up to continue!</p>
        <form>
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password*</label>
            <input type="password" id="password" name="password" required />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password*</label>
            <input type="password" id="confirm-password" name="confirm-password" required />
          </div>
          <CustomButton>SIGN UP</CustomButton>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
