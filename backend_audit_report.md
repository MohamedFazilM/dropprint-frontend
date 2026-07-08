# Spring Boot Backend Production-Ready Audit Report

This report provides a comprehensive audit of the Java Spring Boot backend project. It analyzes security vulnerability hazards, configuration setups, JPA database mappings, API routing architectures, upload logic, performance, and code quality.

---

## Audit Scores

* **Security Score**: `4/10` 🔴 *Critical vulnerabilities found (Missing authorization on admin endpoints, IDOR on order tracking, weak password hashing).*
* **Performance Score**: `7/10` 🟡 *HikariCP is optimized for Render/Supabase, but full-file RAM buffering during uploads is present.*
* **Code Quality Score**: `7/10` 🟡 *Generally clean, separates concerns, uses DTOs. Gaps include missing transaction rollbacks and lack of global exception handling.*
* **Deployment Readiness**: `9/10` 🟢 *Perfect environment configurations, system.properties added, and dynamic port binding is verified.*
* **Overall Production Readiness**: `6/10` 🟡 *Do not go live until Critical and High severity security issues are resolved.*

---

## 1. Security Vulnerabilities & Fixes

### 1.1. Missing Authentication & Authorization on Administrative APIs
* **Severity**: `CRITICAL`
* **File Name**: [AdminController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/src/main/java/com/dropprint/project/controller/AdminController.java)
* **Problem**: The entire controller is annotated with `@RequestMapping("/api/admin")` but has **no security controls**. Anyone on the internet can call `/api/admin/orders` to view all orders, edit statuses, write product entries, and view complete transaction ledger accounts.
* **Why it happens**: No Spring Security filter or validation mechanism exists in the classpath to intercept headers and authorize actions.
* **Production Recommendation**: Add `spring-boot-starter-security` and implement a filter that validates the incoming Bearer JWT token from Supabase Auth (`Authentication` header) and verifies the user's role before allowing administrative actions.

---

### 1.2. Insecure Direct Object Reference (IDOR) on Order Access
* **Severity**: `HIGH`
* **File Name**: [OrderController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/src/main/java/com/dropprint/project/controller/OrderController.java#L26-L30)
* **Problem**: The endpoint GET `/api/orders/{id}` allows anyone to fetch the full order detail (including customer address, phone number, name, items, pricing) simply by knowing the order ID. Since order IDs are sequential strings (e.g. `odr_001`, `odr_002`), an attacker can easily iterate through sequence numbers and download the complete database of orders.
* **Why it happens**: No ownership check is performed. The code directly queries and returns the entity:
  ```java
  return orderRepository.findById(id).orElseThrow(...);
  ```
* **Exact Fix**: Protect `/api/orders/{id}` using the customer's authenticated session. Verify that the authenticated customer's email/ID matches the customer ID associated with the queried order.
* **Correct Code (Conceptual Fix)**:
  ```java
  @GetMapping("/{id}")
  public ResponseEntity<?> getOrder(@PathVariable String id, @RequestHeader("Authorization") String token) {
      Order order = orderRepository.findById(id)
              .orElseThrow(() -> new RuntimeException("Order not found"));
      
      // Decrypt token and fetch authenticated user email
      String currentUserEmail = tokenService.getEmailFromToken(token); 
      
      if (!order.getCustomer().getEmail().equals(currentUserEmail)) {
          return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. You do not own this order.");
      }
      return ResponseEntity.ok(order);
  }
  ```

---

### 1.3. Weak Password Hashing (Fast SHA-256 Brute-force Vulnerability)
* **Severity**: `MEDIUM-HIGH`
* **File Name**: [CustomerController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/src/main/java/com/dropprint/project/controller/CustomerController.java#L26-L43)
* **Problem**: Passwords are saved using standard fast `SHA-256` hashing without salting. SHA-256 is built for high speed and can be brute-forced at rates of billions of guesses per second on low-cost consumer GPUs/ASICs. If the database leaks, customer passwords will be easily cracked.
* **Why it happens**: Hashing relies on basic JDK standard `MessageDigest`:
  ```java
  MessageDigest digest = MessageDigest.getInstance("SHA-256");
  ```
* **Best Practice**: Use `BCrypt` password hashing. BCrypt implements slow, CPU-hard algorithms that are highly resilient to hardware acceleration brute-force attacks.
* **Correct Code**:
  ```java
  // Add dependency org.mindrot:jbcrypt or spring-security
  import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  // Replace hashPassword call with:
  String hashedPassword = passwordEncoder.encode(rawPassword);
  
  // Verify logins using:
  if (passwordEncoder.matches(rawPassword, customer.getPassword())) { ... }
  ```

---

### 1.4. Insecure File Upload Validation (Arbitrary File Upload Risks)
* **Severity**: `HIGH`
* **File Names**: [DesignController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/src/main/java/com/dropprint/project/controller/DesignController.java#L27-L44) & [AdminController.java](file:///c:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/src/main/java/com/dropprint/project/controller/AdminController.java#L97-L105)
* **Problem**: Both file upload endpoints accept any `MultipartFile` and forward it directly to Supabase storage without verifying:
  1. **File Extension**: Attackers can upload `.jsp`, `.exe`, `.html` (enabling stored XSS/SSRF/malware delivery).
  2. **File Size**: Attacking scripts can upload massive files to exhaust storage thresholds.
  3. **MIME type**: Content-Type header can be spoofed.
* **Why it happens**: The controller has zero verification boundaries:
  ```java
  String fileUrl = storageService.uploadFile(file, "designs");
  ```
* **Exact Fix**: Implement helper validations restricting MIME types (e.g. `image/jpeg`, `image/png`, `image/webp`) and limit maximum upload sizes (e.g. 5MB).
* **Correct Code (Validation Utility)**:
  ```java
  public void validateImage(MultipartFile file) {
      if (file.isEmpty()) {
          throw new IllegalArgumentException("File cannot be empty");
      }
      if (file.getSize() > 5 * 1024 * 1024) { // 5MB limit
          throw new IllegalArgumentException("File size exceeds limit of 5MB");
      }
      String mimeType = file.getContentType();
      if (mimeType == null || !mimeType.startsWith("image/")) {
          throw new IllegalArgumentException("Invalid file type. Only images are allowed");
      }
  }
  ```

---

## 2. Spring Boot Configuration & Database Mappings

### 2.1. Missing `@Transactional` Annotation on Multi-insert Operations
* **Severity**: `HIGH`
* **File Name**: [OrderService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/src/main/java/com/dropprint/project/service/OrderService.java#L34)
* **Problem**: The `createOrder` method carries out multiple persistence actions: it registers new customers, increments database sequences for item indexes, persists child OrderItems, and saves audits to the Ledger repository. If any middle step fails (e.g. invalid product, database connection loss, validation failure), the previous records remain committed in the database, resulting in corrupted orphan data relationships.
* **Why it happens**: The method lacks JDBC transaction wrapping.
* **Exact Fix**: Annotate the method with `@Transactional` from `org.springframework.transaction.annotation`.
* **Correct Code**:
  ```java
  import org.springframework.transaction.annotation.Transactional;

  @Service
  public class OrderService {
      
      @Transactional
      public Order createOrder(OrderRequestDTO dto) {
          // All logic here will rollback atomically if any RuntimeException is thrown
      }
  }
  ```

---

### 2.2. Potential Stack Trace Information Disclosure
* **Severity**: `MEDIUM`
* **File Name**: Whole Project (Missing Global Exception Handler)
* **Problem**: If an order is not found or a database insert error occurs, raw server details and database configurations could be output inside the HTTP response stack trace. This reveals database structure details and library version properties to potential attackers.
* **Why it happens**: The backend lacks a `@ControllerAdvice` Exception handler to sanitize API error output responses.
* **Exact Fix**: Implement a global controller exception handler.
* **Correct Code**:
  ```java
  package com.dropprint.project.config;

  import org.springframework.http.HttpStatus;
  import org.springframework.http.ResponseEntity;
  import org.springframework.web.bind.annotation.ControllerAdvice;
  import org.springframework.web.bind.annotation.ExceptionHandler;

  import java.util.Map;

  @ControllerAdvice
  public class GlobalExceptionHandler {

      @ExceptionHandler(RuntimeException.class)
      public ResponseEntity<?> handleRuntime(RuntimeException ex) {
          return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                  .body(Map.of("error", ex.getMessage())); // Returns sanitized error message instead of raw stack trace
      }
  }
  ```

---

### 2.3. OutOfMemory Risk on Big File Uploads
* **Severity**: `LOW-MEDIUM`
* **File Name**: [SupabaseStorageService.java](file:///c:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/src/main/java/com/dropprint/project/service/SupabaseStorageService.java#L31)
* **Problem**: The service buffers the entire uploaded file directly into memory using `file.getBytes()`. Under high concurrency (many simultaneous user uploads), this can quickly trigger JVM heap starvation and crash the server with `java.lang.OutOfMemoryError`.
* **Why it happens**: Fully buffers file data as a raw byte array in memory:
  ```java
  HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);
  ```
* **Best Practice**: Stream the files using resource streams or restrict concurrent upload count configurations.

---

## 3. Dependency Security Audits

### 3.1. Outdated Core Libraries
* **Severity**: `LOW`
* **File Name**: [pom.xml](file:///c:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/pom.xml)
* **Problem**:
  * Spring Boot version `4.1.0` (as defined in `pom.xml` line 8) is actually **invalid** or a futuristic version! The current stable versions are Spring Boot `3.x.x` (e.g. `3.2.x` or `3.3.x`).
  * Ensure your parent POM references a valid, stable released version of Spring Boot to avoid dependency compile clashes and build failures in your CI/CD environments.
* **Correct Code**:
  ```xml
  <parent>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-parent</artifactId>
      <version>3.3.0</version> <!-- Use stable 3.x release -->
      <relativePath/>
  </parent>
  ```
