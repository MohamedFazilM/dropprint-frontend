# GitHub Repository & Security Audit

This document summarizes the steps taken to secure your React (Vite) frontend and Spring Boot backend repositories for GitHub, ensuring zero hardcoded secrets are tracked in source control.

---

## 1. Environment and Secrets Audit

### 🔴 High Risk Secrets Identified (Action Needed)
The backend `.env` and `application.properties` files contain active production/development secrets:
1. **Supabase Database Password**: `supabase@123`
2. **Supabase Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   > [!CAUTION]
   > The Supabase Service Role Key is administrative and bypasses Row Level Security (RLS). If pushed to GitHub, anyone can wipe or steal your database records.

---

## 2. Ignored Files Configurations

We have created/updated the `.gitignore` files for both the frontend and backend.

### Frontend `.gitignore`
Path: `c:\Users\ADMIN\Documents\dropprint-frontend\.gitignore`
```gitignore
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Dependency directories
node_modules/

# Production build output
dist/
dist-ssr/

# Environment files (sensitive keys)
.env
.env.local
.env.development
.env.development.local
.env.production
.env.production.local
.env.staging
.env.staging.local

# Editor directories and files
.vscode/
.idea/
.DS_Store
Thumbs.db
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

### Backend `.gitignore`
Path: `c:\Users\ADMIN\OneDrive\Desktop\dropprint-backend\project\.gitignore`
```gitignore
# Maven build target
target/
!**/src/main/**/target/
!**/src/test/**/target/

# Gradle build folder
build/
!**/src/main/**/build/
!**/src/test/**/build/

# Maven Wrapper jar
.mvn/wrapper/maven-wrapper.jar

# Environment files and database secrets
.env
.env.local

# Logs
logs/
*.log

# STS / Eclipse project files
.apt_generated
.classpath
.project
.settings/
.springBeans
.sts4-cache

# IntelliJ IDEA project files
.idea/
*.iws
*.iml
*.ipr

# NetBeans
/nbproject/private/
/nbbuild/
/dist/
/nbdist/
/.nb-gradle/

# VS Code config
.vscode/

# System-specific files
.DS_Store
Thumbs.db
```

---

## 3. Git Status Actions

### Files That SHOULD NOT Be Committed
These files contain local dependency code, compile caches, or secrets:

| File / Folder | Scope | Why? |
| :--- | :--- | :--- |
| `node_modules/` | Frontend | Automatically downloaded using `npm install` during deployment. |
| `dist/` | Frontend | Compiled production bundle. Vercel builds this automatically. |
| `.env`, `.env.development`, `.env.production` | Frontend | Contains local/production API paths and Supabase keys. |
| `target/` | Backend | Contains compiled Java classes. Render compiles this automatically. |
| `.env` | Backend | Contains actual database credentials and Supabase admin keys. |
| `.classpath`, `.project`, `.settings/` | Backend | Eclipse-specific workspace layout settings. |
| `.vscode/`, `.idea/`, `*.iml` | Both | Personal IDE and VS Code settings. |
| `*.log`, `logs/` | Both | Server run history logs. |

### Files That SHOULD Be Committed
These source and configuration files are required by Vercel and Render to successfully build the projects:

| File / Folder | Scope | Purpose |
| :--- | :--- | :--- |
| `src/` | Both | Java and React source code. |
| `pom.xml` | Backend | Maven project descriptor (Render reads this to build dependencies). |
| `mvnw`, `mvnw.cmd`, `.mvn/` | Backend | Maven wrapper (allows building without global Maven installations). |
| `Dockerfile` | Backend | Specifies container steps for cloud runners. |
| `system.properties` | Backend | Tells Render to use Java runtime 21 (`java.runtime.version=21`). |
| `package.json`, `package-lock.json` | Frontend | Node.js project descriptors (Vercel reads this to run builds). |
| `vite.config.js`, `postcss.config.js` | Frontend | Configures Vite bundler and Tailwind CSS. |
| `vercel.json` | Frontend | Re-routes all path refreshes to `index.html` (resolves Vercel 404s). |

---

## 4. Git Security Cleanup Steps

If you have already initialized Git and some of the ignored files (like `.env`) are already tracked, you **must run the following commands in your terminals** to remove them from Git tracking without deleting them locally:

### For Frontend:
Run these commands in `c:\Users\ADMIN\Documents\dropprint-frontend`:
```bash
git rm --cached .env
git rm --cached .env.development
git rm --cached .env.production
git rm -r --cached .vscode/ 2>/dev/null || true
git rm -r --cached .idea/ 2>/dev/null || true
git rm -r --cached dist/ 2>/dev/null || true
git commit -m "security: untrack environment secrets and workspace configurations"
```

### For Backend:
Run these commands in `c:\Users\ADMIN\OneDrive\Desktop\dropprint-backend\project`:
```bash
git rm --cached .env
git rm -r --cached target/ 2>/dev/null || true
git rm -r --cached .vscode/ 2>/dev/null || true
git rm -r --cached .idea/ 2>/dev/null || true
git rm --cached .classpath 2>/dev/null || true
git rm --cached .project 2>/dev/null || true
git rm -r --cached .settings/ 2>/dev/null || true
git commit -m "security: untrack database secrets and IDE configurations"
```

---

## 5. Cleaning hardcoded secrets from `application.properties` (Recommended)

To completely protect your database password on public GitHub repos, replace the hardcoded fallbacks in `application.properties` with empty template indicators:

```properties
spring.application.name=project

spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
server.port=${PORT:8081}

# HikariCP Settings for Free Tier (Low Connection Limits)
spring.datasource.hikari.maximum-pool-size=3
spring.datasource.hikari.minimum-idle=1
spring.datasource.hikari.idle-timeout=30000
spring.datasource.hikari.max-lifetime=600000

supabase.url=${SUPABASE_URL}
supabase.service-key=${SUPABASE_SERVICE_KEY}
supabase.jwt-secret=${SUPABASE_JWT_SECRET:}

spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```
Once replaced:
* **In Production (Render)**: Set the environment variables in the Render Dashboard (under Environment).
* **In Local Development (Eclipse)**: Right-click Project -> Run As -> Run Configurations -> Environment tab -> Add the environment variables from your `.env` file there!
