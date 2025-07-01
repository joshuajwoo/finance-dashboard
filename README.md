# AI-Powered Finance Dashboard

This project is a full-stack web application designed to help users gain insights into their spending habits. It securely connects to bank accounts using the Plaid API, fetches transaction data, and leverages a machine learning model to automatically categorize expenses. The entire application is designed for and deployed on AWS using a modern, scalable, container-based architecture.

## Features

* **Secure User Authentication**: Full user registration and login system using JWT for stateless authentication.
* **Plaid Integration**: Seamlessly link bank accounts from thousands of institutions using Plaid Link.
* **Transaction Syncing**: Fetches and stores user transaction data from linked accounts.
* **AI-Powered Categorization**: A machine learning model automatically classifies transactions into spending categories.
* **Data Visualization**: (Future goal) An interactive dashboard to visualize spending habits and trends.

## Tech Stack

| Category     | Technology                                                                                                   |
| :----------- | :----------------------------------------------------------------------------------------------------------- |
| **Frontend** | React, `axios` for API calls, `react-router-dom`                                                             |
| **Backend** | Python, Django, Django REST Framework, Gunicorn                                                              |
| **Database** | PostgreSQL                                                                                                   |
| **API/Auth** | RESTful API, `djangorestframework-simplejwt`, Plaid API                                                        |
| **Deployment**| Docker, AWS ECS on Fargate, AWS ECR, AWS CodeBuild (CI/CD), Application Load Balancer, VPC, Amazon RDS     |

## Local Development Setup

To run this project on your local machine, you will need **Docker Desktop** installed.

### 1. Clone the Repository

```bash
git clone [https://github.com/joshuajwoo/finance-dashboard.git](https://github.com/joshuajwoo/finance-dashboard.git)
cd finance-dashboard
```

### 2. Create Environment File

Create a file named `.env` in the root directory of the project. This file will hold all your secret keys and configuration variables.

**Important:** Make sure your `.gitignore` file includes `.env` to prevent committing your secrets.

**`.env` file contents:**
```env
# Django Settings
SECRET_KEY=your_django_secret_key_here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,frontend

# Database Settings
POSTGRES_DB=fininsight_db
POSTGRES_USER=admin
POSTGRES_PASSWORD=your_db_password

# Plaid API Keys
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SANDBOX_SECRET=your_plaid_sandbox_secret
PLAID_ENV=sandbox

# App Name (Required by Plaid integration)
APP_NAME=FinInsight AI
```
### 3. Build and Run with Docker Compose

From the root directory, run the following command:
```bash
docker-compose up --build
```
### 4. Database Migrations and Superuser

The `entrypoint.sh` script automatically runs database migrations. To create a superuser for the Django admin, open a **new terminal window** and run:
```bash
docker-compose exec backend python manage.py createsuperuser
```
## AWS Deployment Architecture

This application is deployed on AWS using a scalable and secure architecture:

* **Networking**: A custom **VPC** isolates the application. Public subnets contain internet-facing resources, while private subnets secure the application and database.
* **Load Balancing**: An **Application Load Balancer (ALB)** serves as the single entry point, routing traffic to the frontend service.
* **Container Orchestration**: The frontend and backend applications are containerized and run as services on **AWS ECS with the Fargate (serverless) launch type**. This allows the application to scale without managing servers.
* **Database**: The PostgreSQL database is a managed **Amazon RDS** instance running in the private subnets, ensuring it is not exposed to the public internet.
* **CI/CD**: The entire build and push process for the Docker images is automated using **AWS CodeBuild**, triggered by pushes to the `main` branch on GitHub. Secrets are managed by **AWS Secrets Manager**.
* **Service Discovery**: An internal-only DNS name (`backend.local`) is created using ECS Service Discovery, allowing the frontend container to securely find and communicate with the backend container within the VPC.
