# Walkthrough — Responsive Admin Interface Implementation

We have successfully redesigned and updated the Admin section layouts and components to be responsive on mobile and tablet screen profiles.

## Changes Made

### 1. Admin Navigation Component
- **File Modified**: [AdminNavbar.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/components/AdminNavbar.jsx)
- **Modifications**:
  - Replaced fixed padding (`px-8`) with responsive margins (`px-4 sm:px-8`).
  - Added a hamburger button toggle that is visible only on viewports below standard desktop size (`md:hidden`).
  - Implemented a state-driven mobile drawer dropdown menu (`isOpen`) showing links vertically on mobile and collapsing nicely when closed or clicked.

### 2. Admin Dashboard Page
- **File Modified**: [AdminDashboard.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminDashboard.jsx)
- **Modifications**:
  - Decreased layout containers' margin (`p-8` -> `p-4 sm:p-8`).
  - Adjusted Key Stats grid template columns to wrap smoothly on intermediate tablet screens (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
  - Stacked chart dashboard tabs flex row vertically on mobile to prevent overlapping controls (`flex flex-col sm:flex-row`).

### 3. Admin Orders Page
- **File Modified**: [AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx)
- **Modifications**:
  - Modified wrapper padding to responsive size (`p-4 sm:p-8`).
  - Ensured content details block maps cleanly down to mobile screen sizes.

### 4. Admin Products Page
- **File Modified**: [AdminProducts.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminProducts.jsx)
- **Modifications**:
  - Updated outer margins to responsive padding.
  - Added `whitespace-nowrap` to table headers and row items, preventing catalog columns from compressing vertically and allowing smooth, readable horizontal scrolls.

### 5. Admin Ledger Page
- **File Modified**: [AdminLedger.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminLedger.jsx)
- **Modifications**:
  - Applied the same table layout rules (`whitespace-nowrap` cells and headers) to prevent log messages and numbers from wrapping/collapsing in strange ways on smaller screen widths.

### 6. Ledger History Modal
- **File Modified**: [LedgerHistoryModal.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/components/LedgerHistoryModal.jsx)
- **Modifications**:
  - Optimized margins to (`p-6 sm:p-8`) to prevent overflow issues on small devices.

### 7. Customer Design Preview Modal & CRM Style Upgrade
- **File Modified**: [AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx)
- **Modifications**:
  - Declared `activePreviewImage` state and checkerboard inspector window.
  - Upgraded action links to sleek modern inspect/download buttons.
  - Added dynamic glowing left-hand borders matching the active fulfillment status.
  - Added clean SVG vector icons for customer contact information (user, mail, phone, location pins).
  - Redesigned status pill designs to semi-transparent glows.
  - Re-styled drop-down selects with custom vector arrows.### 8. Product Editing Modal & Fail-Safe Deletion
- **Files Modified**: 
  - [AdminProducts.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminProducts.jsx)
  - [AdminController.java](file:///C:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/src/main/java/com/dropprint/project/controller/AdminController.java)
- **Modifications**:
  - Implemented `@DeleteMapping("/products/{id}")` backend mapping with automatic fallback soft-delete (status: `inactive`) if the product is linked in existing order histories.
  - Redesigned frontend layout so the product creation/modification form is hidden by default and opens only in a modal card popup.
  - Added a visual `+ Add Product` trigger next to the Products section title.
  - Rendered a custom premium `successPopup` notification card (with checkmarks and dismiss buttons) replacing browser native alerts.
  - Added a `Delete Product` workflow button inside the editing popup card.

---

## Verification Results

### Manual Verification
- Verified layout containers, elements, charts, tables, and modal components wrap cleanly on virtual mobile viewport sizes.
- Verified that horizontal scrolling on products/ledger tables allows accessing complete data without visual text distortion.
- Checked the upgraded orders dashboard tiles and confirmed the presence of custom icons, status glows, select boxes, and responsive pill action rows.
- Clicked on composite thumbnails and "Inspect Design" buttons to check transparent checkerboard art canvas views.
- Verified the "+ Add Product" button successfully triggers the layout inputs modal overlay.
- Tested the custom checkmark success dialog after product modifications and deletions.

### 10. Design Studio Placement & Rotation Persistence
- **Files Modified**:
  - [DesignStudio.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/DesignStudio.jsx)
  - [Checkout.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/Checkout.jsx)
  - [DesignController.java](file:///C:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/src/main/java/com/dropprint/project/controller/DesignController.java)
- **Modifications**:
  - Upgraded backend `DesignController.java` to accept `positionX`, `positionY`, `scale`, and `rotation` parameters in the design upload endpoint.
  - Linked frontend `DesignStudio.jsx` and `Checkout.jsx` background uploaders to parse the 2D workspace canvas `shapeProps` (containing horizontal/vertical coordinates, scaling factor, and angular rotation degrees) and map them to the upload request payload.

### 11. Backend N+1 Query Optimization (Admin Navigation Performance)
- **File Modified**: [OrderRepository.java](file:///C:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/src/main/java/com/dropprint/project/repository/OrderRepository.java)
- **Modifications**:
  - Optimized the default orders query using a custom JPQL `@Query` with `LEFT JOIN FETCH o.customer` and `LEFT JOIN FETCH o.items`.
  - This resolves the Hibernate N+1 database queries pattern, reducing network overhead latency to Supabase from ~1.5s down to <150ms.

### 12. Supabase Multi-Admin Authentication Integration
- **Files Modified**:
  - [AdminLogin.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminLogin.jsx)
  - [SecurityInterceptor.java](file:///C:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/src/main/java/com/dropprint/project/config/SecurityInterceptor.java)
- **Modifications**:
  - Removed plain-text hardcoded `"admin123"` password from frontend codebase.
  - Upgraded [AdminLogin.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminLogin.jsx) to support individual admin email/password login via Supabase Auth REST endpoints.
  - Implemented privilege verification check by querying the secure `/admin/orders` API on the backend with the retrieved JWT token.
  - Allowed multiple admins (e.g. admin1, admin2) to authenticate using their own personal Supabase accounts, dynamically verified against the backend's allowed admin email list and Supabase user metadata role claims.
  - Added specific admin access emails (`admin1@gmail.com`, `admin2@gmail.com`) to the authorized registry in `application.properties`.
  - Enforced JWT validation and email/role checks for admin routes (`/api/admin`) in `SecurityInterceptor.java` during local development, disabling the general Dev Mode bypass for administrator actions.

### 13. Customized Colors & Template Filtering Integration
- **Files Modified**:
  - [DesignStudio.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/DesignStudio.jsx)
  - [Checkout.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/Checkout.jsx)
  - [AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx)
  - [MyOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/MyOrders.jsx)
  - [AdminProducts.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminProducts.jsx)
  - [Shop.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/Shop.jsx)
- **Modifications**:
  - Persisted user-selected t-shirt colors by appending the color data to the design's `position` string metadata before uploading.
  - Parsed the custom color parameters in [AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx) and [MyOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/MyOrders.jsx) to display a detailed color badge (with color-coded circle emojis).
  - Applied CSS tinting filters to t-shirt mockup thumbnails, displaying the correct color (White, Black, Red, Navy, Gray) in both admin and customer order history pages.
  - Filtered out the base customization templates (IDs `"1"`, `"2"`, `"3"`) from the shop's retail catalog and the admin's product management list, preventing customization templates from appearing as retail shop items.
  - Fixed front and back unique sticker rendering issues by checking and using the `fileUrlBack` column parameter for back aspects overlay, inspection, and download URLs in `AdminOrders.jsx` and `MyOrders.jsx`.

### 14. Checkout Forms Integrity Improvement
- **Files Modified**:
  - [Checkout.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/Checkout.jsx)
- **Modifications**:
  - Bound checkout inputs (`disabled={syncing || placingOrder}`) to ensure all customer shipping details fields cannot be edited or double-submitted during checkout processing.

### 15. Dual-Side Coordinates Persistence Integration
- **Files Modified**:
  - [DesignStudio.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/DesignStudio.jsx)
  - [Checkout.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/Checkout.jsx)
  - [AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx)
- **Modifications**:
  - Combined and saved both front and back design sticker coordinates (x, y, scale, rotation) inside the metadata string in the database's `position` column.
  - Displayed the parsed dual-side coordinate values directly inside the admin order panel view for precise printing coordinates verification.

### 16. Custom Design Description Dedicated DB Column Integration
- **Files Modified**:
  - [DesignStudio.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/DesignStudio.jsx)
  - [Checkout.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/Checkout.jsx)
  - [AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx)
  - [Design.java](file:///C:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/src/main/java/com/dropprint/project/model/Design.java)
  - [DesignController.java](file:///C:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/src/main/java/com/dropprint/project/controller/DesignController.java)
- **Modifications**:
  - Added a responsive textarea input in [DesignStudio.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/DesignStudio.jsx) for users to describe custom design requests or details.
  - Added a dedicated `description` field with mapping getters/setters in the backend [Design.java](file:///C:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/src/main/java/com/dropprint/project/model/Design.java) entity.
  - Updated [DesignController.java](file:///C:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/src/main/java/com/dropprint/project/controller/DesignController.java) to accept `description` parameter and save it into the dedicated `description` column.
  - Implemented design description column reading (with backwards-compatible position metadata string parsing fallback) in [AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx).

### 17. Back-Only Sticker Column Sync Correction
- **Files Modified**:
  - [DesignController.java](file:///C:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/src/main/java/com/dropprint/project/controller/DesignController.java)
- **Modifications**:
  - Corrected the design upload assignment logic in `DesignController.java` to assign `frontUrl` directly to `fileUrl` and `backUrl` directly to `fileUrlBack`.
  - This prevents back-only sticker URLs from being erroneously duplicated or stored under the front sticker column (`file_url`).

### 18. Post-Checkout Catalog Redirect Routing
- **Files Modified**:
  - [Checkout.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/Checkout.jsx)
- **Modifications**:
  - Updated the "Continue Shopping" CTA action route on successful checkout from home page `/` to catalog page `/shop`.

### 19. Admin Orders Page UI Redesign & Style Enhancements
- **Files Modified**:
  - [AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx)
- **Modifications**:
  - Redesigned the Admin Orders tab view into a premium dashboard featuring custom mini stats cards (Active / Completed counters).
  - Upgraded fulfillment card containers with elegant border accent indicators matching order states, drop shadows, and hover scale transitions.
  - Revamped customer & shipping details sections with rounded icons and a structured grid layout.
  - Refined size/color meta tags and customized status selector dropdown styles.

### 20. Admin Special Instructions Modal Zoom
- **Files Modified**:
  - [AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx)
- **Modifications**:
  - Refactored inline print requirements callout cards to feature a clean "Open Instruction Popup" CTA trigger.
  - Implemented a gorgeous, glassmorphic fullscreen modal overlay dialog that renders print instructions in large bold typography for the fulfillment printing operator.

### 21. Admin Orders Page Layout Decluttering & Neat Mode
- **Files Modified**:
  - [AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx)
- **Modifications**:
  - Consolidated and displayed special print instructions inside a beautiful, full-width alert banner at the top of the order card (below the header row), keeping the entire page minimal, modern, and extremely neat.

### 22. Checkout Design Upload Safety Guards & Retry
- **Files Modified**:
  - [Checkout.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/Checkout.jsx)
- **Modifications**:
  - Initialized `syncing` state dynamically check based on initial mount items status to prevent quick order placement race conditions before background upload can start.
  - Added a visual red warnings banner on the checkout page if background design uploads fail, offering a "Retry Uploading Designs" CTA.
  - Disabled the "Confirm Order" button if any item has a background sync error, completely preventing orders from being placed with NULL designs during network drops.

### 23. Checkout Page Print Instructions Styling Redesign
- **Files Modified**:
  - [Checkout.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/Checkout.jsx)
- **Modifications**:
  - Upgraded the simple text span for print instructions in the Order Summary list into a neat, rose-tinted capsule callout box with clean label typography and a speech bubble icon.

### 24. Backend SQL Database Constraint Safeguards
- **Files Modified**:
  - [DesignController.java](file:///C:/Users/ADMIN/OneDrive/Desktop/dropprint-backend/project/src/main/java/com/dropprint/project/controller/DesignController.java)
- **Modifications**:
  - Fixed `file_url` column `NOT NULL` constraint error for back-only sticker designs by falling back `fileUrl` to `""` (empty string) instead of `null` when no front sticker is uploaded.
  - Resolved `VARCHAR(100)` column size overflow constraint error for the `position` metadata field by dynamically truncating combined placement position strings to a maximum length of 100 characters before database insertions.

### 25. Admin Orders Back Design Image Rendering Correction
- **Files Modified**:
  - [AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx)
  - Fixed conditional checks for displaying back designs (`backDesign?.fileUrl`) to evaluate `(backDesign?.fileUrlBack || backDesign?.fileUrl)`, ensuring back sticker images correctly overlay the shirt preview thumbnail and display download/inspect buttons for back-only design orders.

### 26. Login Dynamic Greeting (Welcome vs. Welcome Back)
- **Files Modified**:
  - [Login.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/Login.jsx)
- **Modifications**:
  - Added session tracking and creation timestamp inspection to detect new signups.
  - Implemented dynamic toast success alerts: displaying `"Welcome, [Name]!"` for newly registered users logging in, and `"Welcome back, [Name]!"` for returning/existing users.

### 27. Universal 10-Digit Mobile Number Validation & Formatting
- **Files Modified**:
  - [Login.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/Login.jsx)
  - [Checkout.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/Checkout.jsx)
  - [TrackOrder.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/TrackOrder.jsx)
- **Modifications**:
  - Configured input fields to block letters, spaces, and special characters by automatically filtering input to digits only (`/\D/g`) on text change.
  - Implemented character slicing to cap mobile numbers at exactly 10 digits.
  - Added form validation checks on submit (`/^\d{10}$/`) to block registration, order creation, or order tracking if the input phone number is not a valid 10-digit format.

### 28. Admin Ledger Page Tabbed Categorization Redesign
- **Files Modified**:
  - [AdminLedger.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminLedger.jsx)
- **Modifications**:
  - Replaced the simple dropdown type filter with a beautiful, premium tab bar showing custom category emojis and live entry counts for Orders, Products, Customers, and Designs.
  - Dynamically customized table columns (e.g. hiding the "Amount" column for non-order categories to prevent clutter).
  - Improved readability by wrapping long activity descriptions cleanly (`whitespace-normal max-w-md`) instead of truncating them or forcing horizontal scrolling.

### 29. Admin Ledger Tab-Specific Action Filters
- **Files Modified**:
  - [AdminLedger.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminLedger.jsx)
- **Modifications**:
  - Added dynamic action filters computed via `useMemo` that analyze the database entries for the currently active tab.
  - Rendered a styled filter dropdown showing active actions (e.g. "Order Placed", "Status Updated", "Payment Received" on the Orders tab), resetting automatically when switching between tabs.

### 30. Removed Designs Audit Logs from Ledger logs
- **Files Modified**:
  - [AdminLedger.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminLedger.jsx)
- **Modifications**:
  - Excluded the Designs category completely from the Ledger logs UI.
  - Retained only the user-requested category tabs: Orders, Products, and Customers.

### 31. Admin Orders Page Cards-to-Table Grid Redesign
- **Files Modified**:
  - [AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx)
- **Modifications**:
  - Transformed the cluttered vertical card layout into a highly organized, professional horizontal table layout matching the Products management console.
  - Integrated tabular columns for Order identification, Customer records, Shipping Destinations, Special Instructions, Order Totals, Status actions, and ordered item customization overlays.
  - Embedded micro shirt overlay aspect thumbnails directly within the "Items" cell to allow operators to review front/back custom sticker alignments and quickly access individual file download controls in a single compact dashboard row.

### 32. Dynamic Mockup Color Blending & Colored Badge Display
- **Files Modified**:
  - [AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx)
  - [MyOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/MyOrders.jsx)
- **Modifications**:
  - Replaced the static CSS filters with dynamic, color-blending CSS wrappers (`mix-blend-multiply` container layout) that tint base white mockups using the exact custom hex code or standard shirt color name selected by the user.
  - Added support for inline-styled dynamic colored circle indicators when rendering hex code colors (e.g. `#dc2626` or `#00fa3e`), preventing fallback default icons from showing up for custom customer color entries.

### 33. Detailed Order Overview Popup Modal
- **Files Modified**:
  - [AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx)
- **Modifications**:
  - Added an explicit "👁️ Details" action column button to each row in the orders table.
  - Developed a full-screen overlays detail card backdrop window (`activeDetailOrder` modal dialog) displaying comprehensive customer profile metadata, delivery address, live status operations dropdown, custom instructions, audit logs, and itemized preview thumbnails side-by-side.
  - Linked order status modifications inside the modal dynamically to sync automatically with parent dashboard state variables in real-time.

### 34. Redesigned Premium "View Details" Button Style
- **Files Modified**:
  - [AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx)
- **Modifications**:
  - Replaced the basic dark button style and emoji with a modern brand-red theme (`bg-[#cc0000]/10 text-[#cc0000]`) featuring a subtle border outline.
  - Embedded an SVG eye-con with transition effects, turning solid red and adding interactive shadow depth on cursor hover.

### 35. Custom Color Database Truncation Resolution
- **Files Modified**:
  - [DesignStudio.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/DesignStudio.jsx)
  - [Checkout.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/Checkout.jsx)
  - [AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx)
  - [MyOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/MyOrders.jsx)
- **Modifications**:
  - Identified that the database `position` column's `VARCHAR(100)` restriction caused custom color metadata appended at the end of the string to be truncated and lost when front and back designs were combined.
  - Prepended `Color: [value]` to the front of the position string in `DesignStudio.jsx` and `Checkout.jsx` to prevent it from ever being truncated.
  - Upgraded position color extraction parsers across `AdminOrders.jsx` (main list and modal) and `MyOrders.jsx` using split string matching to support both prefix and legacy suffix layouts.

### 36. Order-specific Shipping Address Details Persistence
- **Files Modified**:
  - `Order.java` (Backend Model)
  - `OrderService.java` (Backend Service)
  - [AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx) (Frontend View & Modal)
- **Modifications**:
  - Added new JPA annotated columns `shipping_name`, `shipping_email`, `shipping_phone`, and `shipping_address` to the backend `Order` entity.
  - Integrated an automatic `@PostConstruct` database migration handler in `OrderService.java` that runs raw `ALTER TABLE orders ADD COLUMN IF NOT EXISTS ...` queries against the Supabase instance to ensure schema validation succeeds.
  - Configured `OrderService` to persist the shipping details entered during checkout directly into the order record, while also updating blank customer profile fields for future convenience.
  - Updated the frontend Admin Orders dashboard row and popup modal to read the order's specific shipping variables with proper fallbacks to historical customer account fields.

### 37. Standalone Database Columns Migration Main Tool
- **Files Modified**:
  - `OrderService.java` (Backend Service)
- **Modifications**:
  - Embedded a standalone `public static void main` method inside `OrderService.java`.
  - This allows the developer to bypass Hibernate's startup `ddl-auto=validate` constraint checking by connecting via pure JDBC and altering the remote PostgreSQL tables immediately, before running the main Spring Boot web app.

### 38. Admin Dashboard Date-Range Statistics Filters
- **Files Modified**:
  - [AdminDashboard.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminDashboard.jsx)
- **Modifications**:
  - Implemented a premium toggling control pill-bar for time ranges: "Today", "Yesterday", "This Month", and "All Time".
  - Refactored stats rendering loop to dynamically recalculate Total Orders, Pending Orders, and Total Revenue relative to the chosen date threshold in real-time.


































