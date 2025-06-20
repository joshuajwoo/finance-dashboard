import React, { useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

const PlaidLinkButton = ({ onLinkSuccess }) => {
  const onSuccess = useCallback((public_token, metadata) => {
    console.log('Plaid Link successful! Handing off to parent component.');
    onLinkSuccess(metadata, public_token);
  }, [onLinkSuccess]);

  const createLinkTokenAndOpenLink = async () => {
    try {
      console.log('Requesting link_token from backend...');
      const response = await axiosInstance.post('/core/create-link-token/', {});
      const linkToken = response.data.link_token;
      
      const handler = window.Plaid.create({
        token: linkToken,
        onSuccess: onSuccess,
      });

      handler.open();
    } catch (error) {
      console.error('Error in Plaid Link flow:', error);
    }
  };

  return (
    <div style={{ margin: '20px 0' }}>
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