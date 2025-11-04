import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import Layout from '../components/Layout';
import { getUsername, getToken } from '../utils/auth';
import { buildApiUrl } from '../utils/apiConfig';

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState('lobby'); // 'lobby' or 'coding'
  const [problems, setProblems] = useState([]);
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('Connecting...');
  const [code, setCode] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [users, setUsers] = useState([]); // Track users in room
  const [isLoadingUsers, setIsLoadingUsers] = useState(true); // Track if users are loading
  const [typingUsers, setTypingUsers] = useState({}); // Track users who are typing
  const editorWrapperRef = useRef(null);
  const [overlayPos, setOverlayPos] = useState(null);
  const socketRef = useRef(null);
  const editorRef = useRef(null);
  const isUpdatingFromSocket = useRef(false);
  const lastSentCode = useRef(''); // Track last sent code to prevent duplicates
  const lastReceivedCode = useRef(''); // Track last received code to prevent echo loops
  const messageIdCounter = useRef(0); // Unique message ID to prevent echo loops
  const recentMessageIds = useRef(new Set()); // Track recent message IDs to prevent echo loops
  const lastUpdateTime = useRef(0); // Track last update time to prevent rapid updates
  const [localTyping, setLocalTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const TYPING_DEBOUNCE_MS = 1200;

  // Function to get Monaco language ID
  const getMonacoLanguage = (lang) => {
    switch (lang) {
      case 'python': return 'python';
      case 'cpp': return 'cpp';
      case 'java': return 'java';
      default: return 'python';
    }
  };

  // Function to handle editor changes
  // Debounced socket emission for code changes
  const debouncedEmitRef = useRef();

  // The actual function to emit code_change
  const emitCodeChange = useCallback((value) => {
     // Only send socket events if we're not currently updating from a socket
    if (!isUpdatingFromSocket.current && value !== undefined) {
       // Additional check: don't send if the value is the same as current code
      if (value !== code) {
        console.log('handleEditorChange: value changed from', code, 'to', value);
         
        // Prevent sending duplicate code - more robust check
        if (value === lastSentCode.current) {
          console.log('Skipping socket emission - duplicate code detected');
          setCode(value);
          return;
        }
        
        // Additional check: don't send if this is the same content we just received
        if (value === lastReceivedCode.current) {
          console.log('Skipping socket emission - content matches lastReceivedCode');
          setCode(value);
          return;
        }
         
         // Final safety check: don't send if we're in the middle of a socket update
        if (isUpdatingFromSocket.current) {
          console.log('Skipping socket emission - socket update in progress');
          setCode(value);
          return;
        }
         
        // Only update state if it's actually different
        if (value !== code) {
          setCode(value);
        }
        lastSentCode.current = value; // Track what we just sent
        console.log('Updated lastSentCode in handleEditorChange to:', value.substring(0, 50) + '...');
         
        // Immediate socket emission for better real-time sync
        if (socketRef.current) {
          const messageId = ++messageIdCounter.current;
           console.log('Sending code_change:', { room_id: roomId, code_content: value, message_id: messageId });
           
           // Track this message ID to prevent echo loops
           recentMessageIds.current.add(messageId);
           
           // Keep only the last 10 message IDs to prevent memory leaks
           if (recentMessageIds.current.size > 10) {
            const firstId = recentMessageIds.current.values().next().value;
            recentMessageIds.current.delete(firstId);
          }
           
          socketRef.current.emit('code_change', { 
            room_id: roomId, 
            code_content: value, 
            message_id: messageId 
          });
           
          // Also log the current socket state
          console.log('Socket connected:', socketRef.current.connected);
          console.log('Socket id:', socketRef.current.id);
        } else {
          console.error('Socket not available!');
        }
      } else {
        console.log('Skipping socket emission - value unchanged');
      }
    } else if (isUpdatingFromSocket.current) {
      console.log('Skipping socket emission - updating from socket');
    }
  }, [roomId, code]);

  // Debounced version of emitCodeChange
  useEffect(() => {
    debouncedEmitRef.current = debounce(emitCodeChange, 100); // 100ms debounce
  }, [emitCodeChange]);


  // Typing indicator state
  const username = getUsername() || 'User';
  const sendTyping = (isTyping) => {
    if (!socketRef.current) return;
    try {
      socketRef.current.emit('typing', { room_id: roomId, username, typing: isTyping });
    } catch (e) {
      console.warn('Failed to emit typing event', e);
    }
  }

  // Debounced function to emit 'typing: false' after pause
  const emitTypingStopped = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { room_id: roomId, username, typing: false });
    }
  }, [roomId, username]);

  // Main editor change handler (calls debounced emit and typing event)
  const handleEditorChange = useCallback((value, event) => {
    // Only emit typing events if we're not updating from a socket event
    if (!isUpdatingFromSocket.current) {
      // Emit typing event immediately if we weren't already typing
      if (!localTyping) {
        sendTyping(true);
      }
      
      // Reset the typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set up new timeout to clear typing status
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(false);
      }, TYPING_DEBOUNCE_MS);
      
      // Handle code change
      if (debouncedEmitRef.current) {
        debouncedEmitRef.current(value);
      }
    }
  }, [localTyping, sendTyping]);

  // Function to handle editor mount
  const handleEditorDidMount = useCallback((editor, monaco) => {
    console.log('Editor mounted!');
    editorRef.current = editor;
    
    // Set initial value
    if (code) {
      editor.setValue(code);
    }
    
    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: false },
      fontSize: 12,
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      theme: 'vs-dark'
    });
  }, []); // Remove code dependency to prevent remounting

  // NOTE: local typing is handled inside `handleEditorChange` above. Removed legacy handler.
     // Function to update editor content from socket
  const updateEditorContent = useCallback((newCode) => {
    console.log('updateEditorContent called with:', newCode);
    console.log('editorRef.current exists:', !!editorRef.current);
    console.log('isUpdatingFromSocket.current:', isUpdatingFromSocket.current);
     
    if (editorRef.current) {
       console.log('Updating editor content...');
       
      // Set flag BEFORE any editor operations to prevent onChange
      isUpdatingFromSocket.current = true;
       
      // Get current cursor position before updating
      const currentPosition = editorRef.current.getPosition();
      const currentSelection = editorRef.current.getSelection();
       
      // Always update the content for perfect sync
      const currentValue = editorRef.current.getValue();
      if (currentValue !== newCode) {
         // Use executeEdits with a special flag to prevent onChange
         // This is the ONLY way to update content without triggering onChange
        const model = editorRef.current.getModel();
        if (model) {
           // Create a single edit operation that replaces the entire content
          const fullRange = model.getFullModelRange();
          const edits = [{
            range: fullRange,
            text: newCode
          }];
           
           // Apply the edit without triggering onChange
          model.pushEditOperations([], edits, () => null);
           
            // Update tracking variables to prevent duplicate emissions
            lastSentCode.current = newCode;
            lastReceivedCode.current = newCode;
            console.log('Updated tracking variables to:', newCode.substring(0, 50) + '...');
          } else {
            // Fallback to setValue if model is not available
            editorRef.current.setValue(newCode);
            lastSentCode.current = newCode;
            lastReceivedCode.current = newCode;
          }
      }
       
      // Smart cursor position restoration
      if (currentPosition) {
        const lines = newCode.split('\n');
        const targetLine = Math.min(currentPosition.lineNumber, lines.length);
        const targetColumn = Math.min(currentPosition.column, lines[targetLine - 1]?.length || 1);
         
        // Restore cursor position
        editorRef.current.setPosition({
          lineNumber: targetLine,
          column: targetColumn
        });
         
         // Restore selection if it was a range
         if (currentSelection && currentSelection.startLineNumber !== currentSelection.endLineNumber) {
           const startLine = Math.min(currentSelection.startLineNumber, lines.length);
           const endLine = Math.min(currentSelection.endLineNumber, lines.length);
           
           editorRef.current.setSelection({
             startLineNumber: startLine,
             startColumn: currentSelection.startColumn,
             endLineNumber: endLine,
             endColumn: currentSelection.endColumn
           });
         }
       }
       
        // Reset the flag immediately after the update is complete
        isUpdatingFromSocket.current = false;
        console.log('Reset isUpdatingFromSocket flag');
       console.log('Editor content updated successfully');
     } else {
       console.log('Editor not ready yet');
     }
   }, []);

  // This primary useEffect handles the socket connection and its event listeners.
  useEffect(() => {
    // Check for authentication token
    const token = getToken();
    if (!token) {
      // Store the room ID to redirect after login
      localStorage.setItem('pendingRoomJoin', roomId);
      setIsCheckingAuth(false);
      navigate('/auth');
      return;
    }

    setIsCheckingAuth(false);
    const socket = io(import.meta.env.VITE_API_BASE_URL || '');
    socketRef.current = socket;

    // --- All Socket Event Listeners are defined here ---
    socket.on('connect', () => {
      console.log('Socket connected! Socket ID:', socket.id);
      setStatus('Connected!');
      
      // Get authenticated user info and join room
      const authToken = getToken();
      if (authToken) {
        // Get user info from token or make API call
        // For now, we'll use a simple approach - you can enhance this later
        const username = getUsername() || 'User';
        
        // Don't add current user immediately - wait for existing_users response
        // This prevents duplicates and ensures we get the complete list
        
        // Join room with authenticated user
        console.log('Joining room:', roomId, 'with username:', username); // Debug log
        socket.emit('join_room', { room_id: roomId, username, authenticated: true });
        
        // Request existing users in the room
        console.log('Requesting existing users for room:', roomId); // Debug log
        socket.emit('request_existing_users', { room_id: roomId });
        
        // Fetch the initial state of the room
        fetch(buildApiUrl(`api/rooms/${roomId}`))
          .then(res => res.json())
          .then(data => {
            console.log('Room data received:', data);
            if (data.problem && data.problem.title) {
              setProblem(data.problem);
              setLanguage(data.language || 'python');
              setView('coding');
              setCode(data.problem.template_code || '');
              // Always fetch problems if not loaded
              if (!problems.length) {
                fetch(buildApiUrl(`api/problems`))
                  .then(res => res.json())
                  .then(setProblems);
              }
            } else {
              setView('lobby');
              // Fetch problems for lobby
              fetch(buildApiUrl(`api/problems`))
                .then(res => res.json())
                .then(setProblems);
            }
          })
          .catch(error => {
            console.error('Error fetching room data:', error);
          });
      } else {
        // This shouldn't happen due to ProtectedRoute, but just in case
        setStatus('Authentication required');
        navigate('/auth');
      }
    });

    // Test event listeners
    socket.on('connected', (data) => {
      console.log('🎉 Received connected event:', data);
    });

    socket.on('problem_loaded', (data) => {
      setProblem(data.problem);
      setLanguage(data.language || 'python');
      setView('coding');
      setCode(data.problem.template_code || '');
    });

    socket.on('lobby_activated', (data) => {
      setView('lobby');
      setProblem(null);
      fetch(buildApiUrl(`api/problems`))
        .then(res => res.json())
        .then(setProblems);
    });

         socket.on('code_update', (data) => {
       // Always update from socket to ensure perfect sync
       console.log('🎉 RECEIVED code_update event!');
       console.log('Received code_update:', data);
       console.log('Current code before update:', code);
       console.log('New code from socket:', data.code_content);
       
       // Check if this is a message we sent (by checking message_id)
       if (data.message_id && recentMessageIds.current.has(data.message_id)) {
         console.log('🔄 Skipping update - this is a message we sent (ID:', data.message_id, ')');
         return;
       }
       
       // Additional safety check: don't update if this is the same content we just sent
       if (data.code_content === lastSentCode.current) {
         console.log('🔄 Skipping update - content matches what we just sent');
         return;
       }
       
       // Additional safety check: don't update if this is the same content we just received
       if (data.code_content === lastReceivedCode.current) {
         console.log('🔄 Skipping update - content matches what we just received');
         return;
       }
       
       // Additional safety check: don't update if we're already updating
       if (isUpdatingFromSocket.current) {
         console.log('🔄 Skipping update - already updating from socket');
         return;
       }
       
       // Additional safety check: prevent very rapid successive updates
       const now = Date.now();
       if (now - lastUpdateTime.current < 50) { // 50ms minimum between updates
         console.log('🔄 Skipping update - too soon after last update');
         return;
       }
       lastUpdateTime.current = now;
       
       console.log('Calling updateEditorContent...');
       updateEditorContent(data.code_content);
       console.log('updateEditorContent called');
     });

    // Test if we can receive any events
    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    socket.on('language_updated', (data) => {
      setLanguage(data.language);
    });

    socket.on('execution_result', (result) => {
      setOutput(result.error || result.output);
    });

    socket.on('submit_result', (result) => {
      setOutput(`Verdict: ${result.verdict}\n\n${result.details}`);
    });

    // Handle user presence events
    socket.on('user_joined', (data) => {
      setStatus(`Connected! ${data.username} joined the room`);
      // Only add user if they're not already in the list
      setUsers(prev => {
        const userExists = prev.some(user => user.username === data.username);
        if (!userExists) {
          return [...prev, data];
        }
        return prev;
      });
    });

    socket.on('existing_users', (data) => {
      console.log('Received existing_users event:', data); // Debug log
      // Set the existing users list (this will include the current user and others)
      // Be defensive about payload shape: server may return { users: [...] } or an array directly
      const usersPayload = Array.isArray(data) ? data : (data?.users || []);
      console.log('Parsed existing users:', usersPayload);
      setUsers(usersPayload);
      setStatus(`Connected! Found ${usersPayload.length || 0} users in room`);
      setIsLoadingUsers(false); // Set loading to false after users are fetched
    });

    socket.on('user_left', (data) => {
      console.log('Received user_left event:', data); // Debug log
      setStatus(`Connected! ${data.username} left the room`);
      setUsers(prev => {
        console.log('Previous users:', prev); // Debug log
        const filtered = prev.filter(user => user.username !== data.username);
        console.log('Filtered users:', filtered); // Debug log
        return filtered;
      });
    });

    socket.on('session_ended', (data) => {
      alert('The room session has ended. Redirecting to homepage...');
      navigate('/');
    });

    socket.off('typing');
    socket.on('typing', ({ username: typingUser, typing }) => {
      setTypingUsers(prev => ({
        ...prev,
        [typingUser]: typing
      }));
    });

    // Cleanup function to disconnect the socket when the component is unmounted
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      try {
        socket.disconnect();
      } catch (e) {
        console.warn('Error disconnecting socket on cleanup', e);
      }
    };
  }, [roomId, navigate, updateEditorContent]);

  // Recompute overlay position when typing users change or window resizes
  useEffect(() => {
    const computePos = () => {
      if (!editorWrapperRef.current) return setOverlayPos(null);
      const rect = editorWrapperRef.current.getBoundingClientRect();
      // position overlay near top-right inside editor
      setOverlayPos({ top: rect.top + 8, left: rect.right - 260 });
    };
    computePos();
    window.addEventListener('resize', computePos);
    return () => window.removeEventListener('resize', computePos);
  }, [typingUsers]);


  // Function to handle problem selection from lobby
  const handleLoadProblem = (problemId) => {
    socketRef.current.emit('load_problem', { room_id: roomId, problem_id: problemId });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socketRef.current.emit('language_change', { room_id: roomId, language: newLanguage });
  };
  
  const handleRunCode = () => {
    setOutput('Executing...');
    if (socketRef.current) {
      socketRef.current.emit('execute_code', {
        room_id: roomId,
        language: language,
        code: code,
      });
    }
  };

  const handleSubmitCode = () => {
    setOutput('Submitting for judging...');
    if (socketRef.current) {
      socketRef.current.emit('submit_code', {
        room_id: roomId,
        language: language,
        code: code,
      });
    }
  };

  return (
    <>
      {/* Show loading screen while checking authentication */}
      {isCheckingAuth && (
        <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-400 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-indigo-300 mb-2">Checking Authentication</h2>
              <p className="text-gray-400">Please wait while we verify your access...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main room content - only show when not checking auth */}
      {!isCheckingAuth && (
        <Layout
          sidebarContent={
            <div className="flex flex-col h-full">
              <div className="p-4 space-y-6">
                {/* Room Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Room Info</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Room ID</p>
                      <div className="font-mono text-sm bg-gray-800 px-3 py-2 rounded-lg text-indigo-300">{roomId}</div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <div className="text-green-400 text-sm font-medium">{status}</div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
                        alert('Invite link copied!');
                      }}
                      className="w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm"
                    >
                      📋 Copy Invite Link
                    </button>
                                         <button
                       onClick={() => {
                         if (socketRef.current) {
                           socketRef.current.disconnect();
                           setStatus('Disconnected');
                         }
                       }}
                       className="w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm"
                     >
                       🔌 Disconnect
                     </button>
                  </div>
                </div>

                {/* Users in Room */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Active Users</h3>
                  {isLoadingUsers ? (
                    <div className="text-gray-400 text-sm">Loading users...</div>
                  ) : (
                    <div className="space-y-2">
                      {users.length === 0 ? (
                        <p className="text-gray-400 text-sm">Just you</p>
                      ) : (
                        users.map((user, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-800">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm text-gray-300">{user.username}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-auto p-4 border-t border-gray-800 space-y-3">
                <button
                  onClick={() => {
                    if (socketRef.current) {
                      const username = getUsername() || 'User';
                      socketRef.current.emit('leave_room', { room_id: roomId, username });
                    }
                    navigate('/');
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  🏠 Leave Room
                </button>
                
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to end this session? This will close the room for all users.')) {
                      if (socketRef.current) {
                        socketRef.current.emit('end_session', { room_id: roomId });
                      }
                      navigate('/');
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  🚪 End Session
                </button>
              </div>
            </div>
          }
        >
            <div className="flex flex-col h-full p-4">
             {view === 'lobby' && (
               <div className="w-full max-w-2xl mx-auto bg-gray-900 rounded-xl shadow-2xl p-6 flex flex-col items-center justify-center h-full">
                 <h2 className="text-3xl font-bold mb-4 text-indigo-300">Choose a Problem</h2>
                 <div className="w-full space-y-2">
                   {problems.map(p => (
                     <div
                       key={p.id}
                       onClick={() => handleLoadProblem(p.id)}
                       className="p-3 rounded-xl bg-gray-800 hover:bg-indigo-600 cursor-pointer text-base font-semibold transition-all duration-150 shadow hover:scale-105"
                     >
                       {p.title}
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {view === 'coding' && (
               <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-3">
                 {/* Problem Description - Left Side */}
                 <div className="bg-gray-900 rounded-xl shadow-xl p-3 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-bold text-indigo-300 flex-1">{problem?.title}</h2>
                  {/* Problem Selector Dropdown */}
                  <select
                    value={problem?.id || ''}
                    onChange={e => handleLoadProblem(e.target.value)}
                    className="bg-gray-800 text-white rounded-lg px-2 py-1 text-xs border border-gray-700"
                  >
                    <option value="" disabled>Select Problem</option>
                    {problems.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div className="text-gray-300 text-xs leading-relaxed whitespace-pre-line flex-1">
                  {problem?.description}
                </div>
                 </div>
                
                <div className="mb-2">
                  {/* Show other users who are typing */}
                  {Object.entries(typingUsers)
                    .filter(([user, isTyping]) => isTyping && user !== username)
                    .map(([user]) => (
                      <span key={user} className="text-xs text-gray-400 italic mr-2">
                        {user} is typing...
                      </span>
                    ))}
                </div>

                 {/* Code Editor - Right Side */}
                 <div className="flex flex-col h-full gap-2">
                   <div className="bg-gray-900 rounded-xl shadow-xl p-2 flex flex-col flex-1">
                     <div className="flex items-center mb-2 gap-2">
                       <label htmlFor="languageSelector" className="text-xs font-medium text-gray-400">Language:</label>
                       <select id="languageSelector" value={language} onChange={handleLanguageChange} className="bg-gray-800 text-white rounded-lg px-1 py-0.5 text-xs">
                         <option value="python">Python</option>
                         <option value="cpp">C++</option>
                         <option value="java">Java</option>
                       </select>
                     </div>
                     <div ref={editorWrapperRef} className="w-full flex-1 bg-gray-950 rounded-xl border border-gray-800 overflow-hidden relative">
                       {/* Typing indicator overlay inside the editor area (top-right) */}
                       {Object.entries(typingUsers).filter(([u, t]) => t && u !== username).length > 0 && (
                         <div className="absolute top-2 right-2 z-[9999] pointer-events-none bg-gray-800 bg-opacity-85 text-xs text-gray-200 px-2 py-1 rounded-md flex items-center gap-2">
                           <svg className="w-3 h-3 text-gray-300 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 8 8"><circle cx="1" cy="4" r="1"/><circle cx="4" cy="4" r="1"/><circle cx="7" cy="4" r="1"/></svg>
                           <span>
                             {Object.entries(typingUsers)
                               .filter(([u, t]) => t && u !== username)
                               .map(([u]) => u)
                               .slice(0, 3)
                               .join(', ')}
                             {Object.entries(typingUsers).filter(([u, t]) => t && u !== username).length === 1 ? ' is typing...' : ' are typing...'}
                           </span>
                         </div>
                       )}

                      {/* Fallback fixed-position overlay in case Monaco layers hide the in-editor overlay */}
                      {overlayPos && Object.entries(typingUsers).filter(([u, t]) => t && u !== username).length > 0 && (
                        <div style={{ position: 'fixed', top: overlayPos.top, left: overlayPos.left }} className="z-[99999] pointer-events-none">
                          <div className="bg-indigo-800 bg-opacity-95 text-xs text-white px-3 py-1 rounded-md shadow-lg flex items-center gap-2">
                            <svg className="w-3 h-3 text-white animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 8 8"><circle cx="1" cy="4" r="1"/><circle cx="4" cy="4" r="1"/><circle cx="7" cy="4" r="1"/></svg>
                            <span>
                              {Object.entries(typingUsers).filter(([u, t]) => t && u !== username).map(([u]) => u).slice(0,3).join(', ')}
                              {Object.entries(typingUsers).filter(([u, t]) => t && u !== username).length === 1 ? ' is typing...' : ' are typing...'}
                            </span>
                          </div>
                        </div>
                      )}

                       <Editor
                         height="100%"
                         defaultLanguage={getMonacoLanguage(language)}
                         language={getMonacoLanguage(language)}
                         value={code}
                         onChange={handleEditorChange}
                         onMount={handleEditorDidMount}
                         options={{
                           minimap: { enabled: false },
                           fontSize: 12,
                           lineNumbers: 'on',
                           roundedSelection: false,
                           scrollBeyondLastLine: false,
                           automaticLayout: true,
                           wordWrap: 'on',
                           theme: 'vs-dark',
                           readOnly: false
                         }}
                       />
                     </div>
                     <div className="flex items-center gap-2 mt-2">
                       <button onClick={handleRunCode} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded-lg transition-all duration-150 text-xs">Run Code</button>
                       <button onClick={handleSubmitCode} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-lg transition-all duration-150 text-xs">Submit Code</button>
                     </div>
                   </div>
                   
                   {/* Output Section */}
                   <div className="bg-gray-900 rounded-xl shadow-xl p-2 h-32">
                     <h3 className="text-sm font-bold text-gray-700 mb-1">Output</h3>
                     <pre className="w-full h-24 bg-gray-950 text-green-800 font-mono p-2 rounded-xl border border-gray-300 whitespace-pre-wrap text-xs">
                       {output ? output : 'No output yet. Run or submit your code to see results.'}
                     </pre>
                   </div>
                 </div>
               </div>
             )}
          </div>
        </Layout>
      )}
    </>
  );
};

export default RoomPage;