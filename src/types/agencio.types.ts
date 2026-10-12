// Domain types, mirroring what the API actually sends.
//
// The API is snake_case throughout (they are Prisma column names) and money
// arrives as plain numbers — sendResponse serialises Decimal to number and a
// @db.Date column to "YYYY-MM-DD" — so nothing here needs a transform layer.

