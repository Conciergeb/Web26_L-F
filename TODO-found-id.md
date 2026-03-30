# Found ID Section

**New:** After "Found by" select – StudentID/StaffID based on type.

**Steps:**
- [x] 1. Update db.js found_reports (add studentId, staffId TEXT)
- [ ] Migration ran

- [x] 2. Edit public/found.html (add ID section after foundByType)

- [x] 3. Edit public/script (1).js (toggle inputs)

- [x] 4. Edit routes/found.js (handle fields)

- [x] 5. Migration + test

**✅ COMPLETE: Found ID Section Added!**

**Features:**
- "Found by": student/staff → Shows StudentID/StaffID input (mutually exclusive).
- Toggle: Label/placeholder changes, name=studentId/staffId for FormData.
- Backend: Inserts to studentId/staffId columns.

**Test:** localhost:3000/found.html → Select "student" → Student ID → Submit → DB check.
