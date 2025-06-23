# FinInsight AI: AI-Powered Personal Finance Dashboard

This is a full-stack web application designed to help users track, categorize, and visualize their financial data. It uses the Plaid API to securely connect to bank accounts and leverages a custom-trained machine learning model to automatically categorize transactions.

## Features

* **Secure User Authentication:** Full registration and login system using JWT for session management.
* **Plaid Integration:** Securely link multiple bank accounts using Plaid Link.
* **Automated Transaction Fetching:** Fetches and stores transaction history.
* **AI-Powered Categorization:** A custom-trained machine learning model categorizes spending into buckets like "Food and Drink," "Travel," etc.
* **Interactive Dashboard:** Displays transactions in a filterable table and visualizes spending by category with a pie chart.

## Tech Stack

* **Backend:** Python, Django, Django REST Framework
* **Frontend:** React.js, Chart.js, Axios
* **Database:** PostgreSQL
* **AI/ML:** Scikit-learn, Pandas
* **Containerization:** Docker, Docker Compose
* **Web Server:** Gunicorn, Nginx

## Running the Project Locally

This project is fully containerized and can be run with a single command after initial setup.

### 1. Prerequisites

* Docker and Docker Compose must be installed on your machine.
* You must have a free developer account from [Plaid](https://plaid.com/) to get your API keys.

### 2. Setup

1.  Clone this repository.
2.  Create a file named `.env` in the project's root directory (`finance-dashboard/.env`).
3.  Add the following environment variables to your `.env` file, replacing the placeholder values:

    ```
    # For the PostgreSQL 'db' service
    POSTGRES_DB=financedb
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=your_local_db_password

    # For the Django 'backend' service
    SECRET_KEY=a_strong_and_random_secret_key_for_local_dev
    DEBUG=True
    ALLOWED_HOSTS=localhost,127.0.0.1,frontend

    # Your Plaid API Keys
    PLAID_CLIENT_ID=YOUR_PLAID_CLIENT_ID
    PLAID_SANDBOX_SECRET=YOUR_PLAID_SANDBOX_SECRET
    PLAID_ENV=sandbox
    ```

### 3. Run the Application

Navigate to the project's root directory in your terminal and run:

```bash
docker-compose up --build