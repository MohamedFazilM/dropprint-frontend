# Implementation Plan — Responsive Admin Interface

This plan outlines the changes required to make all admin pages, layouts, and navigation responsive.

## User Review Required

> [!IMPORTANT]
> The admin navigation bar will use pure Tailwind classes (`hidden md:flex` / `flex md:hidden`) and a React toggle state to show/hide a vertical drop-down list on screens under `768px` (medium viewport).

## Open Questions
- None. The changes will build on the existing Tailwind v4 styles.

## Proposed Changes

---

### [Component: Admin Navigation]

#### [MODIFY] [AdminNavbar.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/components/AdminNavbar.jsx)
- Reduce side padding from `px-8` to `px-4 sm:px-8`.
- Keep the desktop navigation links hidden on screens smaller than md (`hidden md:flex`).
- Implement a mobile menu button (hamburger icon) on screens smaller than md (`flex md:hidden`).
- Render a drop-down menu overlay containing navigation links when the mobile menu is active, ensuring proper overlay layers (`z-50`).

---

### [Pages: Admin Dashboard]

#### [MODIFY] [AdminDashboard.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminDashboard.jsx)
- Reduce page container padding from `p-8` to `p-4 sm:p-8`.
- Change stats cards grid layout from `grid-cols-1 sm:grid-cols-4` to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` to prevent cramped layouts on tablet viewports.
- Modify the Fulfillment Trends chart header to stack on mobile: change `flex justify-between items-center` to `flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center`.

---

### [Pages: Admin Orders]

#### [MODIFY] [AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx)
- Reduce page container padding from `p-8` to `p-4 sm:p-8`.
- Adjust details block within each order card (`grid-cols-1 md:grid-cols-12`) so contents flow nicely.
- Order items display: ensure composite t-shirt thumbnails wrap clean and text fits on smaller viewport widths.

---

### [Pages: Admin Products]

#### [MODIFY] [AdminProducts.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminProducts.jsx)
- Reduce page container padding from `p-8` to `p-4 sm:p-8`.
- Update the product items catalog table: add `whitespace-nowrap` to headers (`<th>`) and body cells (`<td>`) to ensure text details don't squish into tiny vertical lines, letting `overflow-x-auto` handle scrolling gracefully on mobile screens.

---

### [Pages: Admin Ledger]

#### [MODIFY] [AdminLedger.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminLedger.jsx)
- Reduce page container padding from `p-8` to `p-4 sm:p-8`.
- Update the transaction logs table: add `whitespace-nowrap` to table cells and headers so horizontal scroll works smoothly without compressing textual details.

---

### [Component: Ledger History Modal]

#### [MODIFY] [LedgerHistoryModal.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/components/LedgerHistoryModal.jsx)
- Adjust dialog container padding from `p-8` to `p-6 sm:p-8` to save precious viewport space on mobile devices.

---

## Verification Plan

### Automated Tests
- Propose `npm run build` command to confirm Vite builds successfully without any TS/JS build or lint syntax errors.

### Manual Verification
- Resize browser width down to mobile (e.g. 375px) and tablet (e.g. 768px) profiles.
- Verify that the navigation dropdown functions correctly and toggles links.
- Confirm stats cards grid adapts to 1, 2, or 4 columns depending on screen size.
- Verify tables are scrollable horizontally with no distorted text layouts.
