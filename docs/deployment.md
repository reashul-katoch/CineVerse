# Cineverse Cloud Deployment Guide (100% Free)

This guide walks you through deploying both the frontend and backend microservices to the cloud using free-tier services.

---

## **Step 1: Set Up Free Databases**

To support your backend microservices, you need live databases:

### **1. PostgreSQL (For auth-service)**
1. Sign up for a free account at **[Neon.tech](https://neon.tech/)**.
2. Create a new project.
3. Under the dashboard, copy the **Connection String**. It looks like:
   `postgresql://neondb_owner:xyz...`
4. Parse this connection string into details for your deployment environment:
   * **Host**: `ep-flat-water-xyz.us-east-2.aws.neon.tech`
   * **Username**: `neondb_owner`
   * **Password**: `xyz...`

### **2. MongoDB (For movie-service & review-service)**
1. Sign up for a free account at **[MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database)**.
2. Create a free **M0 Cluster** (Shared).
3. In the security tab, add a database user and allow access from `0.0.0.0/0` (anywhere).
4. Click **Connect** -> Choose **Drivers** -> Copy the connection URI:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/dbname?retryWrites=true&w=majority`

### **3. Redis (For movie-service seat locks)**
1. Sign up for a free account at **[Upstash](https://upstash.com/)**.
2. Click **Create Database** -> Choose **Redis** -> Select a region close to you.
3. Copy the **Endpoint** address (host) and **Port** (usually `6379`).

---

## **Step 2: Deploy Backend Services to Render**

Go to **[Render.com](https://render.com/)** and create a **Web Service** for each microservice using your GitHub repository:

### **1. auth-service**
* **Root Directory**: `backend/auth-service`
* **Runtime**: `Docker`
* **Environment Variables**:
  * `DB_HOST` = `<your-neon-host>`
  * `DB_USER` = `<your-neon-username>`
  * `DB_PASSWORD` = `<your-neon-password>`

### **2. review-service**
* **Root Directory**: `backend/review-service`
* **Runtime**: `Docker`
* **Environment Variables**:
  * `SPRING_DATA_MONGODB_URI` = `<your-mongodb-atlas-uri-with-db-name-reviewdb>`

### **3. movie-service**
* **Root Directory**: `backend/movie-service`
* **Runtime**: `Docker`
* **Environment Variables**:
  * `SPRING_DATA_MONGODB_URI` = `<your-mongodb-atlas-uri-with-db-name-moviedb>`
  * `SPRING_REDIS_HOST` = `<your-upstash-redis-host>`
  * `SPRING_REDIS_PORT` = `6379`
  * `REVIEW_SERVICE_URL` = `<your-deployed-review-service-url>`

### **4. gateway-service**
* **Root Directory**: `backend/gateway-service`
* **Runtime**: `Docker`
* **Environment Variables**:
  * `AUTH_SERVICE_URL` = `<your-deployed-auth-service-url>`
  * `MOVIE_SERVICE_URL` = `<your-deployed-movie-service-url>`
  * `REVIEW_SERVICE_URL` = `<your-deployed-review-service-url>`

---

## **Step 3: Deploy Frontend React App**

You can deploy the frontend to **Vercel** or **Render** for free:

### **Vercel Deployment (Recommended)**
1. Sign up at **[Vercel](https://vercel.com/)** and import your GitHub repository.
2. Set the **Root Directory** to `frontend`.
3. Set the **Framework Preset** to `Vite`.
4. In the **Environment Variables** section, add:
   * `VITE_API_BASE_URL` = `<your-deployed-gateway-service-url>/api`
5. Click **Deploy**.
