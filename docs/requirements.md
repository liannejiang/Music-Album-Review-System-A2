# MARS — Music Album Review System

Student: Lei-An Jiang (n12656631)
Unit: IFN636 Software Life Cycle Management, Assessment 1

> This file consolidates the requirements from the assessment report (Section 1.2) and the acceptance criteria from the Jira backlog into a single reference used during implementation. This is a working document instead of a separate specification, the report is authoritative.

---

## 1. How to work in this repo

**One story per branch. One branch per pull request. Never combine stories.**

- Work only on the story named in the request. Do not refactor, rename or
  "improve" files that the story does not touch.
- Do not create commits. The student commits manually.
- After finishing a story, print a short summary of files changed and the
  acceptance criteria it satisfies, so the student can write the commit message.
- Never write secrets into source. `MONGO_URI` and `JWT_SECRET` come from
  `.env`, which must stay in `.gitignore`.
- Do not add CI/CD config. CI/CD is explicitly out of scope for this assessment.

### Conventions

| Thing | Convention | Example |
|---|---|---|
| Branch | `feature/<JIRA-KEY>-<slug>` | `feature/MAR-16-create-review` |
| Commit | `MAR-16: add review creation endpoint` | |
| API prefix | `/api` | |
| Admin routes | `/api/admin/...` | |
| HTTP on forbidden | `403` | |
| HTTP on duplicate | `409` | |

---

## 2. Stack and structure

Inherited from the template, unchanged:

- Backend: Node.js + Express + Mongoose (MongoDB Atlas)
- Frontend: React 18 (Create React App) + Tailwind + axios + react-router-dom
- Auth: JWT bearer token in `Authorization` header

```
backend/
  config/db.js
  models/       User.js, Album.js, Review.js
  controllers/  authController.js, albumController.js, reviewController.js
  middleware/    authMiddleware.js
  routes/       authRoutes.js, albumRoutes.js, reviewRoutes.js
  utils/        aggregateRating.js
  scripts/      seedAlbums.js
  server.js
frontend/
  src/pages/       Login, Register, Catalogue, AlbumDetail, AlbumForm
  src/components/  AlbumCard, SearchBar, StarSelector, ReviewCard, ReviewForm,
                   ConfirmDialog, EmptyState, ProtectedRoute
  src/context/     AuthContext.js
```

### Deletions from the template

The task feature is replaced entirely, not kept alongside. Delete:

- `backend/models/Task.js`
- `backend/controllers/taskController.js`
- `backend/routes/taskRoutes.js`
- the `/api/tasks` mount in `server.js`
- any frontend task pages/components

### Deviations from the template (deliberate — do not "fix" back)

| Item | Template | MARS | Reason |
|---|---|---|---|
| `User.role` | absent | `enum ['user','admin']`, default `'user'` | two-role model |
| JWT expiry | `30d` | `60m` | NFR-01 |
| JWT payload | `{ id }` | `{ id, role }` | role check without extra DB read |
| Duplicate email | `400` | `409` | acceptance criteria |
| Backend port | `5001` | matches design document |
| Logout | absent | `POST /api/auth/logout` | MAR-9 |
| Middleware | `protect` only | + `requireRole`, `requireOwnership` | FR-10 |

Note: the template's `userSchema.pre('save')` hook is missing a `next()` call
after hashing. Fix this in MAR-7.

---

## 3. Roles

| Role | Can |
|---|---|
| Visitor (unauthenticated) | register, log in only |
| User | browse, search, view details, read reviews, CRUD **own** reviews |
| Admin | browse, search, view details, read reviews, CRUD **albums** |

An admin **cannot** create, edit or delete reviews. This is enforced on the
server, not only by hiding UI. A user **cannot** touch albums.

Admin accounts are not self-selectable at registration. They are promoted
directly in the database.

---

## 4. Requirements

### Functional

| ID | Requirement |
|---|---|
| FR-01 | An admin has the authority to create albums manually. |
| FR-02 | Both authenticated user and admin can view the album catalogue on the home page and search via the search bar. |
| FR-03 | An admin has the authority to edit and update album details including album name, track list and artist name. |
| FR-04 | An admin has the authority to delete an album. |
| FR-05 | A user can create and publish one review per album, with a mandatory 1–5 star rating and a comment of at most 250 characters. |
| FR-06 | Both authenticated user and admin can view reviews, ratings and aggregated ratings. |
| FR-07 | A user can edit their own review and republish it; the aggregated rating updates instantly. |
| FR-08 | A user can delete their own review; the aggregated rating updates instantly and the user may submit a new review afterwards. |
| FR-09 | The aggregated rating (1–5 stars) updates instantly after any review is created, updated or deleted. |
| FR-10 | The system shall enforce on the server that only an admin may create, update or delete albums, and that a user may act only on reviews they authored. |
| FR-11 | A visitor can register an account, and a registered user or admin can log in and log out. |

### Non-functional

| ID | Type | Requirement |
|---|---|---|
| NFR-01 | Security | Only an authorised admin has access to create, update and delete albums; passwords are bcrypt-hashed; secrets are externalised and never committed. |
| NFR-02 | Performance | The catalogue and search views render within 2 seconds and 95% of API responses return within 500 ms. |
| NFR-03 | Privacy | The system shall never expose an email address to another account in a review or profile. |
| NFR-04 | Data integrity | Every review references an existing account and an existing album; deleting an album cascades to its reviews. |
| NFR-05 | Usability | Every form exposes normal, empty, validation-error and success states; contrast meets WCAG 2.1 AA. |
| NFR-06 | Deployability | The app runs on Node.js 20 on Ubuntu with externalised config and pm2 auto-restart, deployable to a fresh EC2 instance by the documented procedure. |

---

## 5. Data model

### User (extend the template's schema)

```
name          String   required
email         String   required, unique
password      String   required, bcrypt-hashed on save
role          String   enum ['user','admin'], default 'user'
university    String   (inherited, unused)
address       String   (inherited, unused)
createdAt     Date
```

`displayName` in the design document maps to the template's existing `name`
field. Do not add a second field.

### Album

```
title          String   required
artistName     String   required
releaseYear    Number
coverImageUrl  String
tracks         [Track]  at least 1
createdAt / updatedAt   timestamps: true
```

### Track (embedded subdocument, not a separate collection)

```
trackNumber   Number   required
title         String   required
durationSec   Number
```

### Review

```
userId      ObjectId  ref 'User',  required
albumId     ObjectId  ref 'Album', required
stars       Number    required, min 1, max 5, integer only
comment     String    maxlength 250
createdAt / updatedAt   timestamps: true
```

Compound unique index on `{ userId, albumId }` — enforces one review per user
per album at the database level (FR-05).

---

## 6. API contract

| Method | Path | Guard | Story |
|---|---|---|---|
| POST | `/api/auth/register` | — | MAR-7 |
| POST | `/api/auth/login` | — | MAR-8 |
| POST | `/api/auth/logout` | protect | MAR-9 |
| GET | `/api/albums` | protect | MAR-13 |
| GET | `/api/albums?q=` | protect | MAR-14 |
| GET | `/api/albums/:id` | protect | MAR-15 |
| GET | `/api/albums/:id/reviews` | protect | MAR-15 |
| POST | `/api/admin/albums` | protect + requireRole('admin') | MAR-10 |
| GET | `/api/admin/albums/:id` | protect + requireRole('admin') | MAR-11 |
| PUT | `/api/admin/albums/:id` | protect + requireRole('admin') | MAR-11 |
| DELETE | `/api/admin/albums/:id` | protect + requireRole('admin') | MAR-12 |
| POST | `/api/reviews` | protect + requireRole('user') | MAR-16 |
| PUT | `/api/reviews/:id` | protect + requireOwnership | MAR-17 |
| DELETE | `/api/reviews/:id` | protect + requireOwnership | MAR-18 |

`GET /api/admin/albums/:id` exists to serve the edit form's pre-fill and is
distinct from `GET /api/albums/:id` (MAR-15): the admin route requires the
`admin` role, while the MAR-15 route is available to any authenticated user.

Album responses include a computed `averageRating` (one decimal) and
`reviewCount`. When `reviewCount` is 0, `averageRating` is `null` so the client
can render "No ratings yet" rather than a zero score.

Review responses include the reviewer's `name` only. **Never serialise `email`
or `password` into a review or album response** (NFR-03).

---

## 7. Stories

### Iteration 1 — Foundation (3–7 Aug 2026)

#### MAR-7 · Register an account · FR-11, NFR-01 · 5 pts
`feature/MAR-7-auth`

As a visitor, I want to register with my email and password so that I can access
the platform.

**AC**
- Given a unique email and a password of at least 8 characters containing a
  letter and a digit, when I submit, an account is created with `role: 'user'`
  and I am redirected to the login page.
- After successful registration, the stored password is hashed.
- When the email already exists, the response is HTTP 409 and a message is shown.

**Tasks**
- Add `role` to the User schema; fix the missing `next()` in the pre-save hook.
- Registration form component with normal, error and success states.
- Validate email format and password rules on both client and server.
- `POST /api/auth/register` returns 409 on duplicate.

#### MAR-8 · Log in · FR-11 · 3 pts
`feature/MAR-8-login`

**AC**
- On success, a message is shown and I land on the catalogue home page.
- On invalid credentials, one generic error message is shown and no token is
  issued. Do not reveal whether the email or the password was wrong.

**Tasks**
- Login form with error state.
- `POST /api/auth/login`.
- Sign JWT with `{ id, role }` and `expiresIn: '60m'`.

#### MAR-9 · Log out · FR-11 · 2 pts
`feature/MAR-9-logout`

**AC**
- On logout the token is discarded and I return to the login view.
- Pressing back or entering a URL directly after logout redirects to login.

**Tasks**
- `POST /api/auth/logout` (stateless: respond 200, client clears the token).
- `ProtectedRoute` component guarding every authenticated route.

#### MAR-10 · Role guard + Create an album · FR-01, FR-10, NFR-01 · 3 pts
`feature/MAR-10-role-guard`, then `feature/MAR-10-create-album`

Split into two branches. **Build the guard first** — every later story depends
on it.

**AC**
- An admin can submit title, artist, release year, cover URL and track list; the
  album is created and becomes immediately searchable.
- A non-admin calling the endpoint directly receives HTTP 403.

**Tasks (guard branch)**
- `requireRole(role)` — reads `req.user.role`, responds 403 on mismatch.
- `requireOwnership(model, field)` — loads the document, compares its owner
  field to `req.user.id`, responds 403 on mismatch and 404 if absent.

**Tasks (album branch)**
- Album + Track schemas.
- Album create form with normal, error and success states.
- `POST /api/admin/albums`.

#### MAR-11 · Update an album · FR-03, FR-10 · 3 pts
`feature/MAR-11-update-album`

**AC**
- Editing album name, track list or artist name persists and sets `updatedAt`.
- A non-admin calling the endpoint directly receives HTTP 403.

#### MAR-12 · Delete an album · FR-04, FR-10, NFR-04 · 5 pts
`feature/MAR-12-delete-album`

**AC**
- A delete button is visible on the album detail page for admins; after
  confirming, the album and all its reviews are removed.
- A non-admin calling the endpoint directly receives HTTP 403.

**Note on sequencing.** The Review model does not exist yet in Iteration 1. Ship
the endpoint with the cascade marked `// TODO(MAR-12): cascade reviews` and
complete it in Iteration 3 after MAR-16. This carry-over is deliberate and is
recorded in the iteration review.

---

### Iteration 2 — Catalogue (10–14 Aug 2026)

#### MAR-13 · Catalogue browsing · FR-02, NFR-02 · 3 pts
`feature/MAR-13-catalogue`

**AC**
- When logged in, the home page shows album cards with cover, title, artist and
  average rating.
- If no albums exist, an empty-state message is shown rather than a blank page.

**Tasks**
- `GET /api/albums` with pagination, `pageSize = 12`.
- Catalogue grid component and its empty state.

#### MAR-14 · Search albums · FR-02, NFR-02 · 5 pts
`feature/MAR-14-search`

**AC**
- A term matching a title, an artist name or a track title returns all matching
  albums; matching is case-insensitive and partial.
- A term with no matches shows an empty-state message.
- Clicking a result opens that album's detail page.

**Tasks**
- Search bar component.
- `GET /api/albums?q=` using `$or` across `title`, `artistName`, `tracks.title`
  with a case-insensitive regex.
- Record search response times against the public URL for NFR-02 evidence.

#### MAR-15 · View album details · FR-06, NFR-03 · 5 pts
`feature/MAR-15-album-detail`

**AC**
- The detail page shows title, artist, release year, cover, track list,
  aggregate rating and all published reviews.
- Each review shows the reviewer's display name, stars, comment and timestamp —
  **never an email address**.
- With no reviews, "No ratings yet" is shown instead of a zero score.
- If I have already reviewed this album, my review appears with Edit and Delete
  controls instead of a blank review form.
- An admin sees no review form at all.

---

### Iteration 3 — Review and deployment (17–21 Aug 2026)

#### MAR-16 · Create a review · FR-05, FR-10, NFR-03 · 5 pts
`feature/MAR-16-create-review`

**AC**
- I submit a 1–5 star rating and a comment of up to 250 characters; the review
  appears at the top of the review list.
- With no rating selected, an inline error is shown and no request is sent.
- If I have already reviewed this album, I am directed to edit the existing
  review instead of creating a second one.
- The album's aggregate rating reflects the new review immediately.
- An admin calling the endpoint receives HTTP 403.

**Tasks**
- Review schema with the compound unique index.
- Star selector and comment field with a live character counter.
- `POST /api/reviews` with duplicate-review check and server-side validation
  that `stars` is an integer between 1 and 5.

#### MAR-17 · Edit my own review · FR-07, FR-09, FR-10 · 3 pts
`feature/MAR-17-edit-review`

**AC**
- Selecting Edit makes the card editable with Save and Cancel controls.
- Saving recalculates the aggregate rating.
- A token that is not the author's receives HTTP 403.

#### MAR-18 · Delete my own review · FR-08, FR-09, FR-10 · 3 pts
`feature/MAR-18-delete-review`

**AC**
- Selecting Delete shows a confirmation dialog stating the action cannot be
  undone.
- On confirm the review is removed, the aggregate recalculates, and the review
  form becomes available again.
- A token that is not the author's receives HTTP 403.

#### MAR-19 · Aggregate rating recalculation · FR-09 · 2 pts
`feature/MAR-19-aggregate-rating`

**AC**
- When a review is created, updated or deleted, the album's overall rating is
  recomputed.
- When the last review on an album is deleted, "No ratings yet" is shown.

**Tasks**
- `utils/aggregateRating.js` — arithmetic mean of all `stars` for an album,
  rounded to **one decimal place**.
- Call it **synchronously inside the same request** that writes the review, so
  the displayed value can never drift from the review list.
- Return `null` when there are no reviews.

#### MAR-12 (carry-over) · Cascade delete
`feature/MAR-12-delete-album`

Complete the TODO: deleting an album removes all reviews referencing it
(NFR-04).

#### MAR-21 · Seed catalogue data · 2 pts
`chore/MAR-21-seed`

**AC**
- The catalogue loads with at least 10 albums with complete metadata and track
  lists.

**Tasks**
- `scripts/seedAlbums.js`, idempotent (safe to re-run).
- Include one album with no reviews to demonstrate the "No ratings yet" state.

#### MAR-20 · EC2 deployment · NFR-01, NFR-06 · 5 pts
`chore/MAR-20-deploy`

**AC**
- With the instance running, opening the public URL loads the login page.
- Killing the process causes pm2 to restart it automatically.
- Scanning the repository history finds no secret or `.env` file.

**Tasks**
- EC2 t2.micro, security group open on 22 and 80 only.
- Node.js 20, pm2, nginx reverse-proxying port 80 to the app on 5001.
- MongoDB Atlas network access configured for the instance.
- `pm2 startup` + `pm2 save` so it survives reboot.
- README with setup, architecture summary, known limitations and deployment URL.
- Verify every success criterion against the public URL and capture screenshots.

---

## 8. Definition of done

A story is done when all of the following hold:

1. Every acceptance criterion is demonstrable in the running application.
2. The relevant 403 / 409 / empty / error states are reachable, not just the
   happy path.
3. No `email` or `password` field appears in any album or review API response.
4. No secret is added to tracked files.
5. A pull request exists with a self-review comment, and at least one follow-up
   commit addresses something raised in that self-review.
