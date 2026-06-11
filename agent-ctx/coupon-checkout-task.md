# Task: Add Coupon Code Input to Checkout Form

## Task ID: coupon-checkout

## Agent: Main Developer

## Summary
Added a "3 Coupon Code" section to the checkout form between the Shipping Address and Payment sections, with full coupon validation, removable badge, and real-time total updates.

## Changes Made

### File: `/home/z/my-project/src/components/store/CheckoutForm.tsx`

1. **Imports**: Replaced `Tag` icon with `X` icon (for the remove button on the coupon badge)

2. **New state variables**:
   - `couponType`: `'percentage' | 'fixed'` — stores the coupon discount type from API
   - `couponRawValue`: number — stores the raw value (e.g., 10 for 10% or $10) for display
   - `couponLoading`: boolean — loading state for the Apply button

3. **Updated `handleApplyCoupon`**:
   - Now uses `data.valid` (not `res.ok`) to check success, matching API response format
   - Stores `data.type`, `data.value`, and `data.discountAmount` from the API
   - Handles both percentage and fixed discount types
   - Has proper loading state management with `finally` block

4. **Added `handleRemoveCoupon`**: Resets all coupon-related state

5. **Updated total calculation**: `total = subtotal + shipping - couponDiscount` (uses `couponDiscount` which now holds the pre-calculated `discountAmount` from API)

6. **New "3 Coupon Code" section** (between Shipping and Payment):
   - Numbered heading with neutral-900 circle (consistent with sections 1 & 2)
   - Input with placeholder "Enter coupon code" and neutral-200 border styling
   - Apply button with neutral-900 bg style (matching Place Order button)
   - Loading spinner on Apply button during validation
   - Error message in rose-500 when validation fails
   - Animated green badge showing discount (e.g., "10% off applied" or "-$10.00 applied")
   - X button on badge to remove the coupon (with AnimatePresence for smooth exit)

7. **Updated Payment section**: Renumbered from 3 → 4

8. **Removed old sidebar coupon input**: The duplicate coupon input that was in the Order Summary sidebar has been removed (it was redundant with the new form section)

9. **Updated sidebar discount line**: Now uses `couponDiscount` directly (the pre-calculated amount from API) instead of the old computed `discountAmount`

## API Integration
- Endpoint: `POST /api/coupons/validate` with body `{ code, subtotal }`
- Response: `{ valid, type, value, discount, discountAmount }`
- Handles both `percentage` (shows "X% off applied") and `fixed` (shows "-$X.XX applied") types

## Lint Status
- `CheckoutForm.tsx` passes lint with 0 errors
- Pre-existing lint error in `Dashboard.tsx` (unrelated to this task)