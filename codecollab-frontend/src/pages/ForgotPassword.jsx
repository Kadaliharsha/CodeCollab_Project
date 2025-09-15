import React, { useState } from "react";
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [msg, setMsg] = useState('');
    const [token, setToken] = useState('');
    const [newPass, setNewPass] = useState('');
    const navigate = useNavigate();

    const handleSend = async (e) => {
        e.preventDefault();
        setMsg('');
        if (!email.includes('@') && !email) { setMsg('Enter a valid email or username.'); return; }
      
        try {
          setIsSending(true);
          // Using username for now (no email field in backend User model)
          const res = await fetch('http://127.0.0.1:5001/api/auth/forgot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email }) // treat input as username
          });
          const data = await res.json();
          // Show token so you can test reset (in real app this comes via email)
          setMsg(data.reset_token ? `Reset token (dev): ${data.reset_token}` : (data.message || 'If the user exists, a reset link has been sent.'));
        } catch {
          setMsg('Could not send reset link. Try again later.');
        } finally {
          setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 p-6">
          <div className="w-full max-w-md space-y-6 bg-gray-800 border border-gray-700 rounded-lg p-8">
            <div className="flex flex-col items-center gap-2 text-indigo-400 w-full">
              {/* Align in center */}
              <Mail size={22} />
              <span className="font-semibold text-center">Reset your password</span>
            </div>
            <p className="text-sm text-gray-400">Enter your account email to receive a reset link.</p>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label htmlFor="email" className="text-sm text-gray-300">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSending || !email}
                className="w-full py-2.5 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-600"
              >
                {isSending ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
            {msg && <div className="text-sm text-gray-300 break-words">{msg}</div>}

            <hr className="border-gray-700 my-4" />
            <h4 className="text-sm text-gray-300">Reset with token (dev)</h4>
            <input
              placeholder="Paste reset token"
              value={token}
              onChange={(e)=>setToken(e.target.value)}
              className="w-full mt-2 px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none"
            />
            <input
              placeholder="New password"
              type="password"
              value={newPass}
              onChange={(e)=>setNewPass(e.target.value)}
              className="w-full mt-2 px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none"
            />
            <button
              onClick={async () => {
                try {
                  const res = await fetch('http://127.0.0.1:5001/api/auth/reset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, new_password: newPass })
                  });
                  const data = await res.json();
                  setMsg(data.message || data.error || 'Done.');
                } catch {
                  setMsg('Reset failed. Try again.');
                }
              }}
              className="mt-2 w-full py-2.5 bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Reset password
            </button>
            <button 
                onClick={()=>navigate('/auth')} 
                className="w-full text-sm text-center text-indigo-400 hover:text-indigo-300">

                Back to sign in    
            </button>
          </div>
        </div>
      );
}
