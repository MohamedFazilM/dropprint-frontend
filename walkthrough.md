# Walkthrough: Realistic Decal Merging and Separate Front & Back Customs

We have successfully implemented high-fidelity Three.js `<Decal>` projections to realistically merge custom graphics onto the t-shirt mesh (matching its folds, lighting, and textures), and added support for independent front and back custom graphic customization.

---

## Implemented Enhancements

### 1. Front and Back Custom Graphic Alignment
- **[TShirtModel.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/components/TShirtModel.jsx)**:
  - Integrated React Three Fiber's `createPortal` to dynamically project three-dimensional `<Decal>` geometry onto the GLTF model's target body mesh (`mainMesh`), allowing the custom print to warp, wrap, and blend realistically with lighting, creases, and shadows.
  - Optimized the projection box depth (Z scale = `0.08` units) and Z coordinate (`z = ±0.07` units) to isolate the projection boundaries. This ensures that the front design is placed strictly on the front side and the back design is placed strictly on the back side, with zero bleed-through.
  - Configured the decal materials with `depthWrite={false}` and custom `polygonOffsetFactor={-10}` to completely eliminate coplanar Z-fighting (which was causing the fragmented/shredded look), delivering a solid and smooth design merge.

### 2. Independent Front & Back Customization
- **[DesignStudio.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/DesignStudio.jsx)**:
  - Split the single preview/file state into separate hooks for both Front and Back sides:
    - **Front**: `frontFile`, `frontPreviewUrl`, `frontShapeProps`
    - **Back**: `backFile`, `backPreviewUrl`, `backShapeProps`
  - Refactored the Konva Stage layout workspace so that it resolves and edits the active aspect side contextually based on the active `printArea` ("Front" or "Back").
  - Set the Konva shape elements' `opacity` to `0.01`. This keeps the bounding box and adjustment anchors fully visible and interactive for dragging/scaling, while making the flat image itself invisible so the high-fidelity Three.js 3D projected decal underneath is visible in real-time.
  - Passed both sets of preview URLs and custom coordinates down to the 3D viewer.
  - Rewrote e-commerce submit triggers to package both uploaded graphics into the item customization payload.
- **[TShirtViewer.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/components/TShirtViewer.jsx)**:
  - Updated parameters and routing configurations to map both front and back design previews and projection specifications down to `TShirtModel`.

### 3. Unified E-Commerce & Checkout Integration
- **[Cart.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/Cart.jsx)**:
  - Updated e-commerce thumbnail previews to overlay the custom front graphic on the front aspect image, or the custom back graphic on the back aspect image.
  - Formatted a combined `designId` key (e.g. `frontId_backId`) to handle items uniquely.
  - Automatically displays a "Print Area: Front & Back" label if the user customized both sides.
- **[Checkout.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/Checkout.jsx)**:
  - Extended the asynchronous background upload synchronization effect to detect and upload both front and back pending files separately.
  - Configured order items payload mappings to send both `designId` (front print) and `designBackId` (back print) to the order placement API.
- **[AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx)**:
  - Redesigned the order details component to display thumbnails for both front and back custom graphic aspects side-by-side if both are present in the order.
  - Added dedicated download links for both front and back high-resolution artwork prints.
