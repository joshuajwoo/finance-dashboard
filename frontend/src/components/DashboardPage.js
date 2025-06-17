// src/components/DashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import PlaidLinkButton from './PlaidLinkButton';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

function DashboardPage({ onLogout }) {
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [dashboardMessage, setDashboardMessage] = useState('Loading user data...');
  const [chartData, setChartData] = useState(null);
  const [endDate, setEndDate] = useState(formatDate(new Date()));
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return formatDate(date);
  });

  useEffect(() => {
    const fetchProtectedData = async () => {
      // No need to manually get the token from localStorage here.
      // The axios interceptor will handle it.
      try {
        // 1. Use the imported 'axiosInstance'.
        // 2. Use the relative URL. The baseURL is already configured.
        // 3. Remove the manual headers object. The interceptor adds it automatically.
        const response = await axiosInstance.get('/core/protected-data/');
        
        setUserData(response.data);
      } catch (error) {
        // The response interceptor will try to refresh the token on a 401 error.
        // This catch block will run if the refresh fails or for other network errors.
        if (error.response && error.response.status === 401) {
          // This might be redundant if the interceptor handles logout, but it's a safe fallback.
          onLogout(); 
        } else {
          console.error('Failed to fetch protected data.');
        }
      }
    };
    fetchProtectedData();
  }, [onLogout]);

  // --- START: CORRECTED CODE ---

  // 1. Wrap fetchTransactions in useCallback to stabilize the function.
  // It will only be re-created if startDate or endDate change.
  const fetchTransactions = useCallback(async () => {
    setTransactions([]);
    setIsLoadingTransactions(true);
    setDashboardMessage('Fetching recent transactions...');
    const token = localStorage.getItem('accessToken');
    try {
      const url = `/core/transactions/?start_date=${startDate}&end_date=${endDate}`;
      const response = await axiosInstance.get(url);
      setTransactions(response.data.transactions);
      setDashboardMessage('Transactions loaded successfully.');
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setDashboardMessage('Could not fetch transactions.');
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [startDate, endDate]); // Dependencies for useCallback

  // 2. This useEffect now correctly calls the stable fetchTransactions function on mount.
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]); // Depend on the memoized function

  // --- END: CORRECTED CODE ---


  // This useEffect for processing chart data is unchanged.
  useEffect(() => {
    if (transactions.length > 0) {
      const categories = {};
      transactions.forEach(t => {
        if (t.amount > 0) {
          const primaryCategory = t.category ? t.category[0] : 'Other';
          const amount = parseFloat(t.amount);
          if (categories[primaryCategory]) {
            categories[primaryCategory] += amount;
          } else {
            categories[primaryCategory] = amount;
          }
        }
      });
      const formattedChartData = {
        labels: Object.keys(categories),
        datasets: [{
          label: 'Spending by Category',
          data: Object.values(categories),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        }]
      };
      setChartData(formattedChartData);
    } else {
      setChartData(null);
    }
  }, [transactions]);
  
  // This function for handling Plaid Link success is unchanged.
  const handlePlaidLinkSuccess = async (metadata, public_token) => {
    setDashboardMessage('Linking account, please wait...');
    const jwtToken = localStorage.getItem('accessToken');
    try {
      await axiosInstance.post(
        '/core/set-access-token/',
        { public_token: public_token, institution: metadata.institution }
      );
      setDashboardMessage(`Successfully linked account: ${metadata.institution.name}!`);
      fetchTransactions();
    } catch (error) {
      console.error('Error in Plaid Link success flow:', error);
      setDashboardMessage('Could not link account. Please try again.');
    }
  };

  return (
    <div className="dashboard-content">
      {/* The JSX for this component is unchanged */}
      <h2>Dashboard</h2>
      <button onClick={onLogout} className="dashboard-logout-btn">Logout</button>
      <div className="dashboard-data-display">
        {userData ? (
          <p>Welcome, {userData.user_email} (User ID: {userData.user_id})</p>
        ) : (
          <p>{dashboardMessage}</p>
        )}
      </div>
      <div className="chart-container">
        <h3>Spending by Category</h3>
        {chartData && chartData.labels.length > 1 ? (
          <Pie data={chartData} />
        ) : (
          <p>Not enough category data to display a chart for the selected date range.</p>
        )}
      </div>
      <PlaidLinkButton onLinkSuccess={handlePlaidLinkSuccess} />
      <div className="filters-container" style={{ margin: '20px 0', display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center' }}>
        <div>
          <label htmlFor="start-date" style={{ marginRight: '5px' }}>Start Date:</label>
          <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{width: 'auto'}} />
        </div>
        <div>
          <label htmlFor="end-date" style={{ marginRight: '5px' }}>End Date:</label>
          <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{width: 'auto'}} />
        </div>
        <button onClick={fetchTransactions} disabled={isLoadingTransactions}>
          {isLoadingTransactions ? 'Loading...' : 'Refresh Transactions'}
        </button>
      </div>
      <h3>Recent Transactions</h3>
      <div className="transactions-table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Category</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map(t => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>{t.name}</td>
                  <td>{t.category ? t.category.join(', ') : 'N/A'}</td>
                  <td style={{ textAlign: 'right' }}>
                    ${parseFloat(t.amount).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr key="no-transactions-row">
                <td colSpan="4" style={{ textAlign: 'center' }}>No transactions found. Link an account and refresh.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardPage;