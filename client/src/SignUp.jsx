import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase/fireBaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { SERVER_URL } from './Urls';
import './styles/SignUp.css';
import CustomButton from './components/atoms/button/CustomButton';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

     if (!email.endsWith("@searce.com")) {
            alert("Only searce.com email addresses are allowed.");
            return;
      }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // Send user data to backend
      const response = await fetch(`${SERVER_URL}/api/users/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          uid: user.uid,
          name: email.split('@')[0], // Using email prefix as the name
          email: email,
          photoURL: '',
        }),
      });
      
      console.log("Signed up successfully!! :", user);

      const data = await response.json();
        
        if (response.ok) {
          console.log("User stored in DB:", data);
        } else {
          console.error("Error storing user:", data);
        }
      
      navigate('/signin');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h2>Sign Up</h2>
        <p>Welcome, please sign up to continue!</p>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSignUp}>
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input type="email" id="email" name="email" value={email} 
                   onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password*</label>
            <input type="password" id="password" name="password" value={password} 
                   onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password*</label>
            <input type="password" id="confirm-password" name="confirm-password" 
                   value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <CustomButton type="submit">SIGN UP</CustomButton>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
