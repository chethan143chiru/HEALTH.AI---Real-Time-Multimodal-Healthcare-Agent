# Security Specification for Health.ai

## Data Invariants
1. A **User** profile must have a valid `id` matching their Auth UID. Users cannot elevate their own role to 'admin'.
2. A **Prediction** must be linked to a valid `userId` (the author) and cannot be modified after creation.
3. **Feedback** can be submitted by anyone (anonymous or authenticated) but can only be read by administrators to protect user privacy.

## The Dirty Dozen (Attack Payloads)
1. **Identity Spoofing**: Attempt to create a user profile with a different UID.
2. **Privilege Escalation**: Attempt to set `role: 'admin'` during registration.
3. **Ownership Bypass**: User A attempts to read User B's predictions.
4. **Data Tampering**: Attempt to update a prediction result after it has been saved.
5. **Junk Injection**: Attempt to save a 1MB string into the `message` field of feedback.
6. **Anonymous Scraping**: Attempt to list all feedback documents without being an admin.
7. **Future Dating**: Attempt to set `createdAt` to a future date instead of `serverTimestamp()`.
8. **Shadow Field Injection**: Attempt to add an `isVerified: true` field to a user document that isn't in the schema.
9. **Orphaned Prediction**: Attempt to create a prediction for a `userId` that doesn't exist.
10. **ID Poisoning**: Attempt to use `../../junk` as a document ID.
11. **Admin Impersonation**: Attempt to read the `users` collection as a standard user.
12. **Mass Deletion**: Attempt to delete all predictions in a collection.

## Test Strategy
We will implement security rules that reject all the above payloads.
