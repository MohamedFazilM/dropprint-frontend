# Plan: Merge Custom Graphics realistically onto T-Shirt and Support Separate Front & Back Designs

This plan outlines the changes to resolve:
1. **Realistic Graphic Merging**: Project uploaded designs directly onto the 3D T-shirt body mesh folds, shadows, and creases using Drei's `<Decal>` and Three.js portals, replacing the flat floating 2D plane.
2. **Dual-Side Customization**: Allow users to upload and customize a front design and/or a back design independently.

---

## Proposed Changes

### [Component: TShirtModel]

#### [MODIFY] [TShirtModel.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/components/TShirtModel.jsx)
- Import `createPortal` from `@react-three/fiber` to dynamically nest decals into the GLTF model's body mesh.
- Load separate `frontDecalTexture` and `backDecalTexture` depending on active previews.
- Track root group `rootRef` to measure unrotated world matrices (ignoring OrbitControls' active rotation `rotationY` temporarily during coordinate updates).
- Calculate exact local position, scale, and rotation of the projection box on the t-shirt body mesh.
- Render `<Decal>` components nested with `<meshStandardMaterial>` matching the t-shirt fabric properties (`roughness: 0.7`, `metalness: 0.1`) to ensure realistic integration.

---

### [Component: TShirtViewer]

#### [MODIFY] [TShirtViewer.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/components/TShirtViewer.jsx)
- Update parameter mapping to accept separate `frontPreviewUrl`, `frontDecalProps`, `backPreviewUrl`, and `backDecalProps` and feed them down to `TShirtModel`.

---

### [Pages: DesignStudio]

#### [MODIFY] [DesignStudio.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/DesignStudio.jsx)
- Split the design state into independent sets for Front and Back side assets:
  - **Front**: `frontFile`, `frontPreviewUrl`, `frontShapeProps`
  - **Back**: `backFile`, `backPreviewUrl`, `backShapeProps`
- Update the layout mode's Konva Stage so it targets and modifies the active print area's properties.
- Set the Konva shape nodes to `opacity={0.01}`. This keeps them fully interactive and enables dragging/scaling handles while showing the high-quality 3D decal underneath.
- Update checkout/cart mapping triggers to bundle both uploaded designs into the e-commerce design payload.

---

### [Store: cartStore]

#### [MODIFY] [cartStore.js](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/store/cartStore.js)
- Adapt cart item unique key checks so they check both front and back design IDs, preventing duplicate item collisions.

---

### [Pages: Cart]

#### [MODIFY] [Cart.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/Cart.jsx)
- Update product thumbnails to overlay the corresponding front or back custom graphics.
- Render dynamic tags indicating print placements (e.g., "Print Area: Front & Back" if both are customized).

---

### [Pages: Checkout]

#### [MODIFY] [Checkout.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/Checkout.jsx)
- Update background sync uploading loop to handle uploading both front and back designs if they are pending.
- Send both `designId` (for front) and `designBackId` (for back) to the order API.

---

### [Pages: AdminOrders]

#### [MODIFY] [AdminOrders.jsx](file:///c:/Users/ADMIN/Documents/dropprint-frontend/src/pages/admin/AdminOrders.jsx)
- Update the order details component to display thumbnails for both front and back custom graphic aspects.
- Display links to download both front and back design art files.

---

## Verification Plan

### Automated Tests
- Build verification using Vite to ensure compilation is clean and free of errors.

### Manual Verification
- Upload front design, adjust its size/rotation, and verify that it bends and fits within the t-shirt folds.
- Upload back design, select back aspect, and verify it updates the back side graphic separately.
- Click "Add to Cart" / "Buy Now" and verify that both designs appear correctly in the cart, checkout, and admin dashboards.
