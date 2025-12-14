# 🎯 **SPARRING DOCUMENT - ENTERPRISE RETURN SYSTEM**

## 📊 **ARCHITECTUUR BESLISSINGEN**

### **1️⃣ DATABASE LAYER (Prisma + PostgreSQL)**

#### **Return Model - DRY & Robuust**

```prisma
enum ReturnStatus {
  REQUESTED         // Klant heeft retour aangevraagd
  LABEL_CREATED     // Label gegenereerd
  LABEL_SENT        // Email verstuurd naar klant
  IN_TRANSIT        // Pakket onderweg naar ons
  RECEIVED          // Ontvangen in warehouse
  INSPECTED         // Geïnspecteerd (conditie check)
  APPROVED          // Goedgekeurd
  REJECTED          // Afgekeurd (niet compleet/beschadigd)
  REFUND_PENDING    // Terugbetaling in behandeling
  REFUND_PROCESSED  // Terugbetaling verwerkt
  CLOSED            // Retour afgerond
}

enum ReturnReason {
  DEFECTIVE         // Defect product
  WRONG_ITEM        // Verkeerd artikel ontvangen
  NOT_AS_DESCRIBED  // Niet zoals beschreven
  CHANGED_MIND      // Van gedachten veranderd
  DAMAGED_SHIPPING  // Beschadigd tijdens verzending
  OTHER             // Anders
}

model Return {
  id            String        @id @default(cuid())
  orderId       String        @map("order_id")
  
  // MyParcel integration
  myparcelId    Int?          @unique @map("myparcel_id")
  trackingCode  String?       @unique @map("tracking_code")
  trackingUrl   String?       @map("tracking_url")
  labelUrl      String?       @map("label_url")
  
  // Return details
  reason        ReturnReason
  reasonDetails String?       @map("reason_details")
  status        ReturnStatus  @default(REQUESTED)
  
  // Financial
  refundAmount  Decimal?      @map("refund_amount") @db.Decimal(10, 2)
  refundMethod  String?       @map("refund_method") // ORIGINAL_PAYMENT, BANK_TRANSFER
  
  // Inspection (warehouse team)
  inspectedAt   DateTime?     @map("inspected_at")
  inspectedBy   String?       @map("inspected_by") // User ID
  inspectionNotes String?     @map("inspection_notes")
  
  // Items to return
  items         Json          // [{productId, quantity, condition}]
  
  // Communication
  customerNotes String?       @map("customer_notes")
  adminNotes    String?       @map("admin_notes")
  emailSentAt   DateTime?     @map("email_sent_at")
  
  // Metadata
  metadata      Json?         // MyParcel response, etc.
  
  // Timestamps
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")
  receivedAt    DateTime?     @map("received_at")
  refundedAt    DateTime?     @map("refunded_at")
  closedAt      DateTime?     @map("closed_at")
  
  // Relations
  order         Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  @@map("returns")
  @@index([orderId])
  @@index([status])
  @@index([createdAt])
}
```

**💡 Waarom deze structure?**
- ✅ **Complete status flow** (van aanvraag tot refund)
- ✅ **Warehouse inspection** (kwaliteitscontrole)
- ✅ **Financial tracking** (refund bedragen)
- ✅ **Audit trail** (alle timestamps)
- ✅ **Flexible items** (JSON voor meerdere producten)
- ✅ **DRY**: 1 model voor alle retour types

---

### **2️⃣ WEBHOOK LAYER (MyParcel Events)**

#### **Webhook Events om te Handlen**

```typescript
MyParcel Webhook Events:
1. shipment.created       → Return.status = LABEL_CREATED
2. shipment.in_transit    → Return.status = IN_TRANSIT
3. shipment.delivered     → Return.status = RECEIVED
4. shipment.returned      → Return.status = FAILED (terug naar klant)
5. shipment.cancelled     → Return.status = CLOSED
```

#### **Webhook Security (CRITICAL!)**

```typescript
✅ SECURITY MEASURES:
1. Signature Verification
   - MyParcel stuurt HMAC signature
   - Verify met shared secret
   - Reject invalid signatures

2. IP Whitelist
   - Only accept from MyParcel IPs
   - Log blocked attempts

3. Idempotency
   - Track processed webhook IDs
   - Skip duplicates (MyParcel can retry)

4. Rate Limiting
   - Max X webhooks per minute
   - Prevent flood attacks

5. Async Processing
   - Queue webhooks (Bull/Redis)
   - Process in background
   - Don't block webhook response
```

---

### **3️⃣ FRONTEND UI (Next.js - Customer)**

#### **Return Request Page** `/orders/[id]/return`

**Flow:**
1. **Order Validation**
   - Check if eligible (delivered, within 14 days)
   - Show error if not eligible

2. **Return Form**
   ```tsx
   - Reason selector (dropdown - DRY enum values)
   - Item selector (checkboxes voor multi-item orders)
   - Quantity selector
   - Notes textarea (optional)
   - Photo upload (optional - beschadiging bewijzen)
   ```

3. **Confirmation**
   - Summary van return
   - Estimated refund amount
   - Terms & conditions checkbox
   - Submit button

4. **Success State**
   - Tracking code shown
   - Email confirmation bericht
   - Download label button
   - Print instructions button

**Components (DRY):**
```tsx
/components/returns/
  ├── return-request-form.tsx       → Main form
  ├── return-reason-selector.tsx    → Reason dropdown
  ├── return-item-selector.tsx      → Product checkboxes
  ├── return-summary.tsx            → Review before submit
  ├── return-success.tsx            → Success state
  └── return-tracking.tsx           → Status tracking
```

---

### **4️⃣ ADMIN UI (Next.js Dashboard)**

#### **Returns Management** `/dashboard/returns`

**List View:**
```tsx
Table Columns:
- ID (clickable)
- Order Number (link naar order detail)
- Customer Name + Email
- Reason
- Status (badge met kleur)
- Amount
- Created Date
- Actions (View, Approve, Reject)

Filters:
- Status (multi-select)
- Reason (multi-select)
- Date range picker
- Search (order number, customer email)

Bulk Actions:
- Mark as received
- Send reminder email
- Export to CSV
```

**Detail View:** `/dashboard/returns/[id]`
```tsx
Sections:
1. Return Info Card
   - Status timeline (visual stepper)
   - Tracking code + link
   - Customer details
   - Reason + notes

2. Items Card
   - Product list met afbeeldingen
   - Quantities
   - Condition checkboxes (admin fills)

3. Inspection Card (Warehouse Team)
   - Received date picker
   - Condition notes textarea
   - Photo upload (warehouse fotos)
   - Approve/Reject buttons

4. Refund Card
   - Amount calculator (auto)
   - Refund method selector
   - Process refund button
   - Refund history

5. Communication Card
   - Email history
   - Send custom email button
   - Internal notes textarea

Actions Bar:
- Send Return Email
- Download Label
- Download Instructions
- Print Packing Slip
- Update Status
```

---

### **5️⃣ SECURITY HARDENING**

#### **Backend Security**

```typescript
✅ IMPLEMENTED:
1. Environment Variables
   - No secrets in code
   - .env in .gitignore
   - Separate dev/prod configs

2. API Authentication
   - JWT tokens voor admin routes
   - Rate limiting (Express middleware)
   - CORS configuration

✅ TO ADD:
3. Input Validation (Zod)
   - Validate ALL request bodies
   - Sanitize user input (XSS prevention)
   - Type-safe schemas

4. SQL Injection Prevention
   - Prisma uses prepared statements (✅ safe)
   - Never raw queries

5. Authorization
   - Role-based access (admin only for certain routes)
   - Resource ownership checks (klant kan alleen eigen returns zien)

6. Audit Logging
   - Log ALL admin actions
   - Log failed auth attempts
   - Store in AuditLog model

7. Error Handling
   - Never expose stack traces in production
   - Log errors server-side
   - Return generic messages to client
```

#### **Frontend Security**

```typescript
✅ TO IMPLEMENT:
1. CSRF Protection
   - Token in forms
   - Verify on backend

2. XSS Prevention
   - Sanitize HTML output
   - Use React (auto-escaped)
   - No dangerouslySetInnerHTML without sanitization

3. Client-side Validation
   - Validate before submit
   - Show user-friendly errors
   - But ALWAYS validate backend too!

4. Secure File Upload
   - Check file types (MIME + extension)
   - Limit file sizes
   - Scan for malware (production)
   - Store in separate domain/CDN
```

---

### **6️⃣ TESTING STRATEGY**

#### **Test Pyramid (DRY Approach)**

```
        E2E Tests (5%)
       /            \
      Integration Tests (15%)
     /                      \
    Unit Tests (80%)
```

**Unit Tests (Jest + Vitest)**
```typescript
Backend:
- Services (myparcel-return.service.test.ts)
- Utils (validation, formatting)
- Email templates

Frontend:
- Components (return-form.test.tsx)
- Hooks (useReturn.test.ts)
- Utils
```

**Integration Tests**
```typescript
Backend:
- API routes (returns.routes.test.ts)
- Database operations (Prisma)
- Webhook handlers

Frontend:
- Form submission flows
- API integration
```

**E2E Tests (Playwright)**
```typescript
Critical Paths:
1. Happy path: Klant vraagt retour aan → Label → Email
2. Admin path: Admin keurt retour goed → Refund
3. Webhook path: MyParcel update → Status change
```

---

## 🎯 **IMPLEMENTATIE PLAN**

### **FASE 1: DATABASE (30 min)**
- [ ] Add Return model to schema.prisma
- [ ] Add Return relation to Order model
- [ ] Run prisma migrate
- [ ] Generate Prisma client
- [ ] Test database connection

### **FASE 2: BACKEND UPDATES (45 min)**
- [ ] Update return.routes.ts (use Prisma instead of mock)
- [ ] Add Zod validation schemas
- [ ] Implement webhook handler
- [ ] Add authorization middleware
- [ ] Add audit logging

### **FASE 3: FRONTEND UI (60 min)**
- [ ] Return request form (customer)
- [ ] Return tracking page (customer)
- [ ] Admin returns list page
- [ ] Admin return detail page
- [ ] Email/PDF download buttons

### **FASE 4: TESTING (30 min)**
- [ ] Unit tests voor critical functions
- [ ] Integration test voor return flow
- [ ] E2E test (happy path)

### **FASE 5: SECURITY & DOCS (15 min)**
- [ ] Security review checklist
- [ ] Update documentation
- [ ] Deployment guide

**TOTAL: ~3 uur voor volledige implementatie**

---

## ✅ **SPARRING CONCLUSIE**

**AKKOORD OM TE IMPLEMENTEREN?**

✅ **JA** → Start met Fase 1 (Database)
⏸️ **NEE** → Bespreek aanpassingen eerst

**Opmerkingen/Vragen:**
_[Ruimte voor feedback]_




