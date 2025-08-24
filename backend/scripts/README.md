# Seller Synchronization Tool

This script ensures that all users with the 'seller' role have a corresponding entry in the Seller collection.

## Problem

In some cases, when an admin changes a user's role from 'customer' to 'seller', the user's role is updated in the User collection but no corresponding record is created in the Seller collection. This causes issues with seller-specific features.

## Solution

The `syncSellerRecords.js` script:

1. Finds all users with the role 'seller'
2. Checks if they have a corresponding record in the Seller collection
3. Creates seller records for any that don't have one

## How to Run

### Windows

Double-click the `sync-sellers.bat` file in the root directory.

### Mac/Linux

Run the following commands:

```bash
cd backend
node scripts/syncSellerRecords.js
```

## Prevention

The issue has been fixed in the user update controller, so it shouldn't occur again for future role changes. This script is mainly to fix existing inconsistencies.
