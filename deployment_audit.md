# Render Deployment Audit Report

This audit details the production readiness of the Spring Boot backend when deploying to Render with a Supabase PostgreSQL database.

---

## 1. Database Connection & Pooling Exhaustion

### Why It Happens
The default HikariCP pool size in Spring Boot is `10`. On Supabase's free plan, there is a strict limit on active client connections (typically max 60 total across all clients). If you deploy multiple container instances, run database clients, or trigger server restarts, HikariCP will quickly exhaust all available Postgres slots. This leads to connection timeouts and causes Spring Boot to fail on startup.

### Exact File Name
[application.properties](file:///c:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/src/main/resources/application.properties)

### Line To Change
Add HikariCP parameters at the bottom of the file.

### Correct Replacement Code
```properties
# HikariCP Settings for Free Tier (Low Connection Limits)
spring.datasource.hikari.maximum-pool-size=3
spring.datasource.hikari.minimum-idle=1
spring.datasource.hikari.idle-timeout=30000
spring.datasource.hikari.max-lifetime=600000
```

---

## 2. PostgreSQL Prepared Statement Mismatch (Supabase Pooler Mode)

### Why It Happens
Supabase offers two connection pooling modes on `<project-id>.pooler.supabase.com`:
* **Session Mode (Port 5432)**: Behaves like direct Postgres sessions. Fully supports prepared statements.
* **Transaction Mode (Port 6543)**: Best for high scale, but does **NOT** support prepared statement caching since connections are recycled per transaction. Hibernate will throw `prepared statement does not exist` errors on startup.

### File Name
Render Dashboard (Environment Variables) / [.env](file:///c:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/.env)

### Action
Ensure you use the correct connection host & port:
1. **If using Session Mode (Port 5432)**:
   * Keep pool sizes low (configured in step 1).
   * URL format: `jdbc:postgresql://<project-ref>.pooler.supabase.com:5432/postgres`
2. **If using Transaction Mode (Port 6543)**:
   * Append `?prepareThreshold=0` to the JDBC connection URL to disable prepared statement caching.
   * URL format: `jdbc:postgresql://<project-ref>.pooler.supabase.com:6543/postgres?prepareThreshold=0`

---

## 3. Render Dynamic Port Binding Mismatch

### Why It Happens
Render dynamically assigns a port to web services using the `PORT` environment variable. If the application starts on a fixed port (e.g. `8081`), Render's load balancer will not route traffic to it, leading to a health check timeout error and service teardown.

### Exact File Name
[application.properties](file:///c:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/src/main/resources/application.properties)

### Line To Change
```properties
server.port=8081
```

### Correct Replacement Code
```properties
server.port=${PORT:8081}
```

---

## 4. Java Runtime Version Build Failure

### Why It Happens
`pom.xml` requires Java compiler version `21`. By default, Render buildpacks default to compiling on Java `11` or `17`, which triggers an unsupported class version compilation error.

### Exact File Name
[system.properties](file:///c:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/system.properties) [NEW]

### Correct Replacement Code
```properties
java.runtime.version=21
```
*Note: Also define the environment variable `JAVA_VERSION` as `21` in your Render service settings.*

---

## 5. Render Service Configurations

When setting up your service on the Render Dashboard, match these configurations:

1. **Root Directory**: `project` (Since `pom.xml` resides inside the `/project` folder rather than the repository root).
2. **Build Command**: `mvn clean package -DskipTests`
3. **Start Command**: `java -jar target/project-0.0.1-SNAPSHOT.jar`
4. **Environment Variables**:
   * `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<ref>.pooler.supabase.com:5432/postgres`
   * `SPRING_DATASOURCE_USERNAME`: `<username>`
   * `SPRING_DATASOURCE_PASSWORD`: `<password>`
   * `SUPABASE_URL`: `https://<ref>.supabase.co`
   * `SUPABASE_SERVICE_KEY`: `<service_role_key>`
   * `JAVA_VERSION`: `21`

---

## Deployment Readiness Status

> [!IMPORTANT]
> **Status: READY FOR DEPLOYMENT**
> All files are updated, connection pools are optimized, and build-time configurations are set. The backend project is ready for deployment on Render.
