# Curation Context API Contract

**Context**: Data editing and approval interface for curators
**Port**: 3002
**Base URL**: `http://localhost:3002`

## Endpoints

### 1. Display Evidence List

**Endpoint**: `GET /`

**Description**: Renders list of all evidences with their status, sorted by most recent first

**Query Parameters**:
- `status` (optional): Filter by status ("pending", "approved", "rejected", or "all")
  - Default: "all"
- `page` (optional): Page number for pagination (1-based)
  - Default: 1
- `limit` (optional): Results per page
  - Default: 50

**Response**: HTML page with evidence table

**Table Columns**:
- Título (title)
- Autores (authors, first 3 shown)
- Ano (year)
- Status (badge with color: pending=yellow, approved=green, rejected=red)
- Data de Submissão (submission date)
- Ações (actions: "Editar" link)

**Example Response Structure**:
```html
<div class="curation-list">
  <h2>Curadoria de Referências</h2>

  <div class="filters">
    <a href="/?status=all">Todas</a>
    <a href="/?status=pending">Pendentes</a>
    <a href="/?status=approved">Aprovadas</a>
    <a href="/?status=rejected">Rejeitadas</a>
  </div>

  <table class="evidence-table">
    <thead>
      <tr>
        <th>Título</th>
        <th>Autores</th>
        <th>Ano</th>
        <th>Status</th>
        <th>Data</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Diversity Of Plant Uses...</td>
        <td>HANAZAKI, N.; TAMASHIRO, J. Y.; ...</td>
        <td>2000</td>
        <td><span class="badge pending">Pendente</span></td>
        <td>2025-12-24</td>
        <td><a href="/evidence/edit/{id}">Editar</a></td>
      </tr>
    </tbody>
  </table>

  <div class="pagination">
    <!-- Pagination controls -->
  </div>
</div>
```

**Status Code**: 200 OK

---

### 2. Display Evidence Edit Form

**Endpoint**: `GET /evidence/edit/:id`

**Description**: Renders edit form for a specific evidence, pre-populated with existing data

**Path Parameters**:
- `id`: id (string UUID v4) of the evidence

**Response**: HTML page with editable form (same structure as acquisition form, but pre-filled)

**Additional Elements**:
- Status change section (radio buttons: pending, approved, rejected)
- "Salvar Alterações" button
- "Cancelar" link back to evidence list

**404 Response**: If evidence ID not found
```html
<div class="error-page">
  <h2>Referência Não Encontrada</h2>
  <p>A referência solicitada não existe.</p>
  <a href="/">Voltar à Lista</a>
</div>
```

**Status Code**: 200 OK (or 404 Not Found)

---

### 3. Update Evidence Content

**Endpoint**: `PUT /evidence/update/:id`

**Description**: Updates evidence data (metadata, communities, plants) without changing status

**Path Parameters**:
- `id`: id (string UUID v4) of the evidence

**Request Body** (application/x-www-form-urlencoded):
Same format as acquisition submit, with all fields editable

**Processing**:
1. Parse form data into nested structure
2. Validate using same rules as acquisition
3. If valid:
   - Update all fields except status
   - Set `updatedAt` timestamp
   - Update `doc` in `biocultdb_records` (SQLite)
   - Redirect to edit form with success message
4. If invalid:
   - Re-render form with errors and preserve data

**Success Response**:
- **Status**: 302 Redirect
- **Location**: `/evidence/edit/:id?success=true`

**Validation Error Response**:
- **Status**: 400 Bad Request
- **Content-Type**: text/html
- **Body**: Form with error messages

---

### 4. Change Evidence Status

**Endpoint**: `POST /evidence/status/:id`

**Description**: Changes only the status field of a evidence (approve or reject)

**Path Parameters**:
- `id`: id (string UUID v4) of the evidence

**Request Body** (application/x-www-form-urlencoded):
```
status=approved
```

**Valid Status Values**:
- `pending`
- `approved`
- `rejected`

**Processing**:
1. Validate status value
2. Update only `status` field and `updatedAt` timestamp
3. Redirect to evidence list

**Success Response**:
- **Status**: 302 Redirect
- **Location**: `/?success=status-updated&id={id}&status={new_status}`

**Validation Error Response**:
- **Status**: 400 Bad Request
- **Body**: Error message (invalid status value)

---

### 5. Add Community (Edit Mode)

**Endpoint**: `POST /evidence/:id/community/add`

**Description**: HTMX endpoint that returns HTML fragment for adding a community to existing evidence during editing

**Path Parameters**:
- `id`: id (string UUID v4) of the evidence being edited

**Request Body**: Current community count (for indexing)

**Response**: Same community form fragment as acquisition context

**Status Code**: 200 OK

---

### 6. Add Plant (Edit Mode)

**Endpoint**: `POST /evidence/:id/plant/add/:communityIndex`

**Description**: HTMX endpoint that returns HTML fragment for adding a plant to a community during editing

**Path Parameters**:
- `id`: id (string UUID v4) of the evidence being edited
- `communityIndex`: Index of the community (0-based)

**Response**: Same plant form fragment as acquisition context

**Status Code**: 200 OK

---

## SQL Queries

### List Evidences with Filters

**Query** (all evidences):
```sql
SELECT id, titulo, autores, ano, status, created_at
FROM biocultdb_records
ORDER BY created_at DESC
LIMIT ? OFFSET ?;
-- params: [limit, (page - 1) * limit]
```

**Query** (filtered by status):
```sql
SELECT id, titulo, autores, ano, status, created_at
FROM biocultdb_records
WHERE status = ?
ORDER BY created_at DESC
LIMIT ? OFFSET ?;
-- params: ["pending", limit, (page - 1) * limit]
```

### Get Single Evidence for Editing

```sql
SELECT id, doc, created_at, updated_at FROM biocultdb_records WHERE id = ?;
```

### Update Evidence Content

```javascript
// doc is fetched, merged with edited fields in JS (comunidades[] replaced wholesale),
// updatedAt set, then rewritten in one statement
const updated = { ...existingEvidence, titulo, autores, ano, resumo, DOI, comunidades, updatedAt: new Date().toISOString() };
```
```sql
UPDATE biocultdb_records SET doc = ?, updated_at = ? WHERE id = ?;
-- params: [JSON.stringify(updated), updated.updatedAt, id]
```

### Update Evidence Status Only

```javascript
const updated = { ...existingEvidence, status: "approved", updatedAt: new Date().toISOString() };
```
```sql
UPDATE biocultdb_records SET doc = ?, updated_at = ? WHERE id = ?;
-- params: [JSON.stringify(updated), updated.updatedAt, id]
```

---

## UI Patterns

### Status Badges

```html
<span class="badge pending">Pendente</span>
<span class="badge approved">Aprovada</span>
<span class="badge rejected">Rejeitada</span>
```

**CSS Classes**:
- `.badge.pending`: Yellow/orange background
- `.badge.approved`: Green background
- `.badge.rejected`: Red background

### Status Change Section

```html
<div class="status-section">
  <h3>Alterar Status</h3>
  <form action="/evidence/status/{id}" method="POST">
    <label>
      <input type="radio" name="status" value="pending" <%= status === 'pending' ? 'checked' : '' %>>
      Pendente
    </label>
    <label>
      <input type="radio" name="status" value="approved" <%= status === 'approved' ? 'checked' : '' %>>
      Aprovada
    </label>
    <label>
      <input type="radio" name="status" value="rejected" <%= status === 'rejected' ? 'checked' : '' %>>
      Rejeitada
    </label>
    <button type="submit">Atualizar Status</button>
  </form>
</div>
```

### Success Messages

**Query Parameter Handling**:
- `?success=true`: "Alterações salvas com sucesso"
- `?success=status-updated&status=approved`: "Referência aprovada com sucesso"
- `?success=status-updated&status=rejected`: "Referência rejeitada"

---

## Security Considerations

### No Authentication (Per Spec)

- Curation interface accessible without login
- Access control handled at network level (port exposure, firewall)
- Unraid deployment assumes trusted network

### Input Validation

- Same validation rules as acquisition context
- UUID v4 format validation for :id parameters
- Status enum validation

### Audit Trail (Out of Scope)

- No change history tracking in initial version
- `updatedAt` timestamp provides basic tracking
- Future enhancement: Full audit log with user attribution

---

## Error Responses

### Invalid Evidence ID

**Status**: 404 Not Found

**Body**: HTML error page
```html
<div class="error-page">
  <h2>Referência Não Encontrada</h2>
  <p>A referência com ID {id} não existe.</p>
  <a href="/">Voltar à Lista</a>
</div>
```

### Invalid Status Value

**Status**: 400 Bad Request

**Body**: HTML error page
```html
<div class="error-page">
  <h2>Status Inválido</h2>
  <p>O status deve ser "pending", "approved" ou "rejected".</p>
  <a href="/">Voltar à Lista</a>
</div>
```

### Database Update Failure

**Status**: 500 Internal Server Error

**Body**: HTML error page
```html
<div class="error-page">
  <h2>Erro ao Atualizar Referência</h2>
  <p>Ocorreu um erro ao salvar as alterações. Por favor, tente novamente.</p>
  <a href="/evidence/edit/{id}">Voltar ao Formulário</a>
</div>
```

---

## Performance Considerations

### Pagination

- Default 50 evidences per page
- Indexes on `status` and `createdAt` for efficient queries
- Skip/limit for pagination (acceptable for <10,000 total records)

### Edit Form Pre-population

- Single SQLite query fetches complete evidence document
- No lazy loading needed for nested communities/plants
- Typical evidence size: 5-50KB

---

## Integration Points

### Shared with Acquisition Context

- Same validation logic (`services/validation.js`)
- Same data models (`models/Evidence.js`)
- Same database service (`services/database.js`)
- Same HTMX form fragments for adding communities/plants

### Impact on Presentation Context

- When status changes to "approved", evidence becomes visible in public search
- When status changes to "rejected" or "pending", evidence hidden from public

---

## Example Workflows

### Workflow 1: Approve Pending Evidence

1. Curator accesses `/` (evidence list)
2. Filters by status "pending": `/?status=pending`
3. Clicks "Editar" on a evidence: `GET /evidence/edit/{id}`
4. Reviews content, makes any corrections: `PUT /evidence/update/{id}`
5. Changes status to "approved": `POST /evidence/status/{id}` with `status=approved`
6. Redirected to list with success message
7. Evidence now visible in presentation context (port 3003)

### Workflow 2: Edit and Reject Evidence

1. Curator accesses evidence list
2. Opens evidence for editing: `GET /evidence/edit/{id}`
3. Reviews content and identifies issues
4. Changes status to "rejected": `POST /evidence/status/{id}` with `status=rejected`
5. Evidence remains hidden from public presentation

### Workflow 3: Edit Evidence Content

1. Curator opens approved evidence for editing
2. Corrects typo in plant name or adds missing community
3. Submits update: `PUT /evidence/update/{id}`
4. Status remains "approved", content updated
5. Updated content immediately reflects in presentation context

---

## Future Enhancements (Out of Scope)

- Bulk status changes (approve/reject multiple evidences)
- Comments/notes on evidences for curator communication
- Revision history with rollback capability
- Duplicate evidence detection and merging
- Taxonomic validation integration with external APIs
- Email notifications when status changes
