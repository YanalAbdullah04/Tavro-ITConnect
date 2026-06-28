# Tavro
> ℹ️ **Rebranding Note:** This project was originally named **ITConnect**. It has been rebranded to **Tavro** with a completely new design, modern user identity, and enhanced user experience.

**Tavro** is a comprehensive trainee management and collaboration platform designed to bridge the gap between IT trainees (students), trainers (mentors/instructors), and companies within the IT ecosystem. 

By integrating directly with **GitHub**, it provides a transparent, automated, and streamlined way to monitor coding progress, manage training sessions, and connect talent with career opportunities.

---

## 📋 The Problem
In traditional IT training and bootcamps, managing student progress is often fragmented and manual:
* **Lack of Real-Time Progress Tracking:** Trainers have to manually ask students for links to their code or status updates.
* **Difficulty in Code Verification:** Instructors must manually clone student repositories or switch between multiple GitHub tabs to review code submissions.
* **Disconnected Recruitment Pipeline:** Companies struggle to find verified, high-performing students because training progress and recruitment platforms are completely isolated.

---

## 💡 The Solution
**Tavro** solves these challenges by providing a unified, role-based platform that integrates directly with the developer's workflow:
* **Direct GitHub Integration:** Using a custom GitHub App, trainees securely link their GitHub installations. Trainers can view repositories, switch branches, and inspect file contents directly inside the Tavro dashboard—no manual cloning required.
* **Role-Based Workspaces:** 
  * **Trainees:** Access structured training tracks, view assigned tasks, and connect their GitHub profile.
  * **Trainers:** Track trainee progress, manage training sessions, and review code directly from the web interface.
  * **Companies:** Discover top talent, view verified project portfolios, and post opportunities.
* **Automated Auditing:** Streamlines the review process, allowing trainers to give precise feedback on specific code branches.

---

## 🛠️ Tech Stack

### Backend
* **Framework:** .NET 8 / ASP.NET Core Web API
* **Database:** Microsoft SQL Server (MSSQL)
* **ORM:** Entity Framework Core (EF Core)
* **Authentication:** JWT (JSON Web Tokens) with role-based authorization ( `Trainer`, `Trainee`, `Company`)
* **Integrations:** GitHub REST API (using Octokit and JWT-based GitHub App Authentication)

### Frontend
* **Core:** React 18 with TypeScript
* **Build Tool:** Vite
* **Styling:** TailwindCSS & Modern CSS for a premium, responsive UI

---

## 🚀 Getting Started

### Prerequisites
* [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
* [Node.js](https://nodejs.org/) (v18+)
* [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd ITConnect/ITConnect
   ```
2. Configure your connection string and GitHub App credentials in `appsettings.json` (or `appsettings.Development.json`):
   ```json
   {
     "ConnectionStrings": {
       "sqlcon": "Server=YOUR_SERVER;Initial Catalog=ITConnect;Trusted_Connection=True;TrustServerCertificate=True"
     },
     "GitHubConfig": {
       "AppId": "YOUR_APP_ID",
       "AppSlug": "your-app-slug",
       "PrivateKeyPath": "path-to-your-private-key.pem",
       "ClientId": "YOUR_CLIENT_ID",
       "ClientSecret": "YOUR_CLIENT_SECRET"
     }
   }
   ```
3. Run migrations to set up the database:
   ```bash
   dotnet ef database update
   ```
4. Start the backend server:
   ```bash
   dotnet run
   ```
   *The server will start on `http://localhost:5231` and `https://localhost:7272`.*

### 🌐 GitHub Integration & Cloudflare Tunnel (Local Development)
Because GitHub needs to redirect users back to a public URL during the OAuth flow, you need a public tunnel to forward requests to your local machine. We use **Cloudflare Tunnels** because they are free and do not show any warning pages.

1. **Start the Cloudflare Tunnel:**
   In a separate terminal window, run:
   ```bash
   npx cloudflared tunnel --url http://localhost:5231
   ```
   *This will output a public URL (e.g., `https://your-tunnel-subdomain.trycloudflare.com`).*

2. **Configure your GitHub App:**
   * Go to your GitHub App settings.
   * Update the **Callback URL** to:
     `https://your-tunnel-subdomain.trycloudflare.com/api/github/callback`
   * Update the **Homepage URL** to:
     `http://localhost:4173` (your local frontend)

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend/it-connect-hub
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run preview
   ```
   *The frontend will run on `http://localhost:4173`.*

---

## 🔒 Security & Verification
The platform employs industry-standard security practices:
* **Data Protection:** OAuth states and tokens are encrypted using ASP.NET Core Data Protection APIs.
* **Secure GitHub Linkage:** Leverages GitHub App installation tokens, granting only the minimal necessary permissions (read-only access to repositories and metadata).
