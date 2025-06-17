// src/components/PlaidLinkButton.js (Manual Version)
import React, { useCallback } from 'react';
import axios from 'axios';

const PlaidLinkButton = ({ onLinkSuccess }) => {
  const onSuccess = useCallback((public_token, metadata) => {
    // This callback function is given to Plaid, and it's called when the user succeeds.
    console.log('Plaid Link successful! Handing off to parent component.');
    onLinkSuccess(metadata, public_token); // Pass both metadata and the public_token up
  }, [onLinkSuccess]);

  const createLinkTokenAndOpenLink = async () => {
    try {
      // 1. Get the JWT token for our own backend authentication.
      const jwtToken = localStorage.getItem('accessToken');

      // 2. Fetch the link_token from our backend.
      console.log('Requesting link_token from backend...');
      const response = await axios.post(
        'http://127.0.0.1:8000/api/core/create-link-token/',
        {},
        { headers: { 'Authorization': `Bearer ${jwtToken}` } }
      );
      const linkToken = response.data.link_token;
      console.log('link_token received:', linkToken);

      // 3. Create a Plaid Link instance with the received link_token.
      const handler = window.Plaid.create({
        token: linkToken,
        onSuccess: onSuccess,
        // onExit: (err, metadata) => { /* Optional: handle user exiting */ },
      });

      // 4. Open the Plaid Link modal.
      console.log('Opening Plaid Link modal...');
      handler.open();

    } catch (error) {
      console.error('Error in Plaid Link flow:', error);
    }
  };

  return (
    <div style={{ margin: '20px 0' }}>
      {/* This button now directly triggers the entire flow. */}
      <button onClick={createLinkTokenAndOpenLink}>
        Link a New Bank Account
      </button>
      <p style={{ fontSize: '0.8em', fontStyle: 'italic', opacity: 0.8 }}>
        (Uses Plaid's secure sandbox environment)
      </p>
    </div>
  );
};

export default PlaidLinkButton;