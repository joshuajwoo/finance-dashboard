import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import PlaidLinkButton from './PlaidLinkButton';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// Helper function to format dates
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

function DashboardPage({ onLogout }) {
  const [userData, setUserData] = useState(null);
  const [chartData, setChartData] = useState(null);

  // --- START: Polished State Management ---
  // Group related state for transactions into a single object for clarity.
  const [transactionsState, setTransactionsState] = useState({
    transactions: [],
    isLoading: false,
    error: null,
    message: 'Loading user data...',
  });
  // --- END: Polished State Management ---

  const [dateRange, setDateRange] = useState(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    return {
      start: formatDate(startDate),
      end: formatDate(endDate),
    };
  });

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const response = await axiosInstance.get('/core/protected-data/');
        setUserData(response.data);
      } catch (error) {
        console.error('Failed to fetch protected data.', error);
        // The axios interceptor will handle token refresh and logout on 401.
      }
    };
    fetchProtectedData();
  }, []);

  const fetchTransactions = useCallback(async () => {
    setTransactionsState((prevState) => ({
      ...prevState,
      isLoading: true,
      error: null,
      message: 'Fetching recent transactions...',
    }));
    try {
      const url = `/core/transactions/?start_date=${dateRange.start}&end_date=${dateRange.end}`;
      const response = await axiosInstance.get(url);
      setTransactionsState({
        transactions: response.data, // Assuming backend returns the array directly now
        isLoading: false,
        error: null,
        message: 'Transactions loaded successfully.',
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactionsState((prevState) => ({
        ...prevState,
        isLoading: false,
        error: 'Could not fetch transactions.',
      }));
    }
  }, [dateRange]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (transactionsState.transactions.length > 0) {
      const categories = {};
      transactionsState.transactions.forEach(t => {
        if (t.amount > 0) {
          const primaryCategory = t.category ? t.category[0] : 'Other';
          const amount = parseFloat(t.amount);
          categories[primaryCategory] = (categories[primaryCategory] || 0) + amount;
        }
      });

      if (Object.keys(categories).length > 0) {
        setChartData({
          labels: Object.keys(categories),
          datasets: [{
            label: 'Spending by Category',
            data: Object.values(categories),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
          }]
        });
      } else {
        setChartData(null);
      }
    } else {
      setChartData(null);
    }
  }, [transactionsState.transactions]);
  
  const handlePlaidLinkSuccess = async (metadata, public_token) => {
    setTransactionsState((prevState) => ({
      ...prevState,
      message: 'Linking account, please wait...',
    }));
    try {
      await axiosInstance.post('/core/set-access-token/', {
        public_token: public_token,
        institution: metadata.institution
      });
      setTransactionsState((prevState) => ({
        ...prevState,
        message: `Successfully linked account: ${metadata.institution.name}! Refreshing transactions...`,
      }));
      fetchTransactions();
    } catch (error) {
      console.error('Error in Plaid Link success flow:', error);
      setTransactionsState((prevState) => ({
        ...prevState,
        message: 'Could not link account. Please try again.',
      }));
    }
  };

  const handleDateChange = (e) => {
    setDateRange(prevRange => ({
      ...prevRange,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="dashboard-content">
      <h2>Dashboard</h2>
      <button onClick={onLogout} className="dashboard-logout-btn">Logout</button>
      
      {userData ? (
        <p>Welcome, {userData.user_email} (User ID: {userData.user_id})</p>
      ) : (
        <p>{transactionsState.message}</p>
      )}

      <div className="chart-container">
        <h3>Spending by Category</h3>
        {chartData ? (
          <Pie data={chartData} />
        ) : (
          <p>Not enough category data to display a chart for the selected date range.</p>
        )}
      </div>

      <PlaidLinkButton onLinkSuccess={handlePlaidLinkSuccess} />

      <div className="filters-container" style={{ margin: '20px 0', display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center' }}>
        <div>
          <label htmlFor="start-date" style={{ marginRight: '5px' }}>Start Date:</label>
          <input type="date" id="start-date" name="start" value={dateRange.start} onChange={handleDateChange} />
        </div>
        <div>
          <label htmlFor="end-date" style={{ marginRight: '5px' }}>End Date:</label>
          <input type="date" id="end-date" name="end" value={dateRange.end} onChange={handleDateChange} />
        </div>
        <button onClick={fetchTransactions} disabled={transactionsState.isLoading}>
          {transactionsState.isLoading ? 'Loading...' : 'Refresh Transactions'}
        </button>
      </div>

      <h3>Recent Transactions</h3>
      {transactionsState.error && <p style={{color: 'red'}}>{transactionsState.error}</p>}
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
            {transactionsState.transactions.length > 0 ? (
              transactionsState.transactions.map(t => (
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
              <tr>
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