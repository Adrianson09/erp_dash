import React from 'react';

const MessageContainer = ({ message }) => {
  if (!message.text) return null;

  return (
    <div className={`fixed top-0 right-0 left-0 text-center p-4 ${message.type} text-white`}>
      {message.text}
    </div>
  );
};

export default MessageContainer;
