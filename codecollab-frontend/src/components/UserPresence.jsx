import React, { useEffect, useRef } from 'react';
import { getUsername } from '../utils/auth';

// Generate a consistent color for a username
const generateUserColor = (username) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const UserPresence = ({ editor, socket, roomId }) => {
  const decorationsRef = useRef(new Map());
  const userStateRef = useRef(new Map());
  const username = getUsername() || 'User';

  useEffect(() => {
    if (!editor || !socket) return;

    // Emit cursor and selection to server (debounced)
    let debounceTimer;
    const emitPosition = () => {
      const pos = editor.getPosition();
      const sel = editor.getSelection();
      if (pos && socket.connected) {
        socket.emit('cursor_move', { room_id: roomId, username, line: pos.lineNumber, column: pos.column });
      }
      if (sel && socket.connected && !sel.isEmpty()) {
        socket.emit('selection_change', {
          room_id: roomId,
          username,
          start: { line: sel.startLineNumber, column: sel.startColumn },
          end: { line: sel.endLineNumber, column: sel.endColumn }
        });
      }
    };
    const debouncedEmit = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(emitPosition, 50);
    };

    const posListener = editor.onDidChangeCursorPosition(debouncedEmit);
    const selListener = editor.onDidChangeCursorSelection(debouncedEmit);

    // Render helper
    const renderUser = (u) => {
      const state = userStateRef.current.get(u) || {};
      const decs = [];
      if (state.cursor) {
        decs.push({
          range: {
            startLineNumber: state.cursor.line,
            startColumn: state.cursor.column,
            endLineNumber: state.cursor.line,
            endColumn: state.cursor.column
          },
          options: { 
            className: 'other-cursor', 
            afterContentClassName: 'other-cursor-flag', 
            hoverMessage: { value: u } 
          }
        });
      }
      if (state.selection) {
        decs.push({
          range: {
            startLineNumber: state.selection.start.line,
            startColumn: state.selection.start.column,
            endLineNumber: state.selection.end.line,
            endColumn: state.selection.end.column
          },
          options: { className: 'other-selection' }
        });
      }
      const prev = decorationsRef.current.get(u) || [];
      const newIds = editor.deltaDecorations(prev, decs);
      decorationsRef.current.set(u, newIds);
    };


    // const handleCursorMove = () => {
    //   const position = editor.getPosition();
    //   const selection = editor.getSelection();


      
    //   if (position && socket.connected) {
    //     // Emit cursor position
    //     socket.emit('cursor_move', {
    //       room_id: roomId,
    //       username: currentUsername,
    //       line: position.lineNumber,
    //       column: position.column
    //     });

    //     // Emit selection if it exists
    //     if (selection) {
    //       socket.emit('selection_change', {
    //         room_id: roomId,
    //         username: currentUsername,
    //         start: {
    //           line: selection.startLineNumber,
    //           column: selection.startColumn
    //         },
    //         end: {
    //           line: selection.endLineNumber,
    //           column: selection.endColumn
    //         }
    //       });
    //     }
    //   }
    // };

    // Debounced cursor move handler
    let cursorTimeout;
    const debouncedCursorMove = () => {
      clearTimeout(cursorTimeout);
      cursorTimeout = setTimeout(handleCursorMove, 50); // 50ms debounce
    };

    // Add cursor move listener
    editor.onDidChangeCursorPosition(debouncedCursorMove);
    editor.onDidChangeCursorSelection(debouncedCursorMove);

    // Socket handlers
    const handleCursor = (data) => {
      if (data.username === username) return;
      const prev = userStateRef.current.get(data.username) || {};
      userStateRef.current.set(data.username, { 
        ...prev, 
        cursor: { 
          line: data.cursor?.line ?? data.line, 
          column: data.cursor?.column ?? data.column 
        } 
      });
      renderUser(data.username);
    };

    const handleSelection = (data) => {
      if (data.username === username) return;
      const prev = userStateRef.current.get(data.username) || {};
      userStateRef.current.set(data.username, { 
        ...prev, 
        selection: { start: data.start, end: data.end } 
      });
      renderUser(data.username);
    };

    socket.on('presence_cursor', handleCursor);
    socket.on('presence_selection', handleSelection);

    return () => {
      posListener.dispose();
      selListener.dispose();
      socket.off('presence_cursor', handleCursor);
      socket.off('presence_selection', handleSelection);
      // remove all decorations
      const allDecIds = Array.from(decorationsRef.current.values()).flat();
      if (allDecIds.length) editor.deltaDecorations(allDecIds, []);
      decorationsRef.current.clear();
      userStateRef.current.clear();
    };
  }, [editor, socket, roomId, username]);

  return null; // This is a behavior-only component
};

export default UserPresence;