# AI Marketplace Engine (AME) — Master System Documentation

This document serves as the authoritative guide for the **AI Marketplace Engine (AME)**, a modular, independent, and high-performance AI subsystem designed specifically for fixed-price task marketplaces.

---

## 1. System Architecture Overview

The AI Marketplace Engine operates as a completely decoupled microservice that communicates with the main freelancing website exclusively via **REST APIs**, **secure Webhooks**, and **Redis Event Streams**. 

### 1.1 Microservices Integration Blueprint

```mermaid
graph TD
    subgraph MarketplaceWebsite["Workly Freelancing Website (Existing)"]
        UI["Web/Mobile UI"]
        WebBE["Next.js Backend API"]
        FirebaseDB[("Firebase Firestore")]
    end

    subgraph AME["AI Marketplace Engine (AME)"]
        GW["FastAPI API Gateway"]
        Orch["Marketplace AI Orchestrator"]
        Postgres[("PostgreSQL + pgvector")]
        RedisDB[("Redis Cache & Event Bus")]
        Dash["HTML5 Operations Dashboard"]

        subgraph AgentsGroup["Specialized AI Agents Tree"]
            Ag1["1. AI Ranking Agent"]
            Ag2["2. AI Search Agent"]
            Ag3["3. AI Fresh Talent Agent"]
            Ag4["4. AI Trust Score Agent"]
            Ag5["5. AI Review Verification Agent"]
            Ag6["6. AI Fraud Detection Agent"]
            Ag7["7. AI Recommendation Agent"]
            Ag8["8. AI Visibility Rotation Agent"]
            Ag9["9. AI Portfolio Analysis Agent"]
            Ag10["10. AI Skill Verification Agent"]
            Ag11["11. AI Dispute Analysis Agent"]
            Ag12["12. AI Analytics Agent"]
            Ag13["13. AI Learning Agent"]
            Ag14["14. AI Notification Agent"]
            Ag15["15. AI Operations (AIOps) Agent"]
        end
    end

    UI -->|HTTPS User Query| WebBE
    WebBE -->|Ingest REST Events| GW
    GW -->|Route Events| Orch
    Orch -->|Trigger Async Tasks| RedisDB
    Orch -->|Store Analytical Records| Postgres
    Orch -->|Spawn Parallel Agents| AgentsGroup
    AgentsGroup -->|Audit Decisions| Orch
    Orch -->|POST Signed HMAC Webhooks| WebBE
    WebBE -->|Real-time Sync| FirebaseDB
    Dash -->|Telemetry Audit| AIOps
```

---

## 2. Event Sequence & Lifecycle Flows

The Orchestrator coordinates agent execution upon receiving events from the marketplace.

### 2.1 Double-Blind Review Completion Flow

This flowchart illustrates how the Review Verification Agent, Trust Agent, and Orchestrator execute in sequence when a review is submitted:

```mermaid
sequenceDiagram
    autonumber
    participant Web as Workly Platform
    participant Orch as Master AI Orchestrator
    participant RV as Review Verification Agent
    participant TS as Trust Score Agent
    participant WH as Webhook Dispatcher

    Web->>Orch: POST /events/review-created (Review payload)
    Note over Orch: Validate API key header (X-AME-API-Key)
    Orch->>RV: Audit review comments & ratings
    Note over RV: Run sentiment analysis & check delivery timelines
    RV-->>Orch: Return audit metrics (is_unfair, confidence)
    
    alt Review is Unfair (arbitrary downrate)
        Orch->>TS: Adjust trust score (0 penalty points)
        Note over TS: Bypass rating penalty due to unfairness
    else Review is Valid
        Orch->>TS: Adjust trust score (-2 or +2 points)
    end
    
    TS-->>Orch: Return updated user trust scores
    Orch->>WH: Sign and dispatch response payload
    WH->>Web: POST Webhook (recalculated trust scores)
```

---

## 3. Database Entity Relationship Diagram (ERD)

The database schema stores user performance attributes, trust audit timelines, disputes evidence, and operational telemetry.

```mermaid
erDiagram
    user_scores {
        string id PK "Firebase UID"
        string role
        string name
        float trust_score
        float trust_penalty
        float ranking_score
        float job_success_rate
        float on_time_delivery_rate
        float response_time_seconds
        int repeat_clients_count
        float portfolio_quality_score
        int completed_projects_count
        boolean is_fresh_talent
        int fresh_talent_jobs_count
        int first_impression_count
        int first_impression_goal
        json embedding "Vector float array"
        datetime created_at
    }

    job_profiles {
        string id PK "Firebase Task ID"
        string title
        string description
        string category
        float budget
        string location
        string poster_id
        string status
        json embedding
        datetime created_at
    }

    trust_score_histories {
        int id PK
        string user_id FK
        float old_score
        float new_score
        float change_amount
        string reason
        datetime timestamp
    }

    ranking_histories {
        int id PK
        string user_id FK
        float old_score
        float new_score
        string reason
        datetime timestamp
    }

    review_verifications {
        int id PK
        string review_id
        string task_id
        string from_user_id
        string to_user_id
        int rating
        string comment
        boolean is_verified
        float unfairness_probability
        string evidence_summary
        datetime analyzed_at
    }

    fraud_detection_logs {
        int id PK
        string user_id
        string entity_type
        string entity_id
        string fraud_type
        float confidence
        string evidence
        boolean resolved
        datetime created_at
    }

    dispute_analyses {
        int id PK
        string dispute_id
        string task_id
        string client_id
        string freelancer_id
        json evidence_timeline
        string summary
        string recommended_resolution
        float recommended_refund_percentage
        datetime analyzed_at
    }

    user_scores ||--o{ trust_score_histories : tracks
    user_scores ||--o{ ranking_histories : records
```

---

## 4. Operational Specifications of the 15 AI Agents

### 4.1 AI Ranking Agent
Calculates the search listing score. **Important:** Proposal quality or AI-generated bidding checks have 0% weight.
$$\text{Rank Score} = (\text{JSR} \times 0.3) + (\text{Trust Score} \times 0.3) + (\text{Portfolio Quality} \times 0.2) + (\text{On-Time Delivery} \times 0.1) + (\text{Repeat Clients Boost} \times 0.05) + (\text{Response Speed} \times 0.05)$$

### 4.2 AI Search Agent
Translates string queries into 1536 float arrays. Performs cosine comparisons inside PostgreSQL with a fallback to local Python NumPy logic if the `pgvector` extension is not compiled.

### 4.3 AI Fresh Talent Agent
Grants newly registered freelancers a temporary +15 ranking points bump. Guarantees 1,000 search page impressions (`first_impression_goal`) and rotates priority dynamically.

### 4.4 AI Trust Score Agent
Maintains scoring bounded between 0.0 and 100.0. Penalty adjustments apply: -10 for cancellations, -15 for active disputes, and -20 for off-platform escrow bypass details.

### 4.5 AI Review Verification Agent
Evaluates negative feedback. Bypasses trust score deductions and job success penalties for reviews flagged as unfair.

### 4.6 AI Fraud Detection Agent
NLP regex analysis scans messaging for phone numbers, email handles, or payment terms (PayPal, wire transfer) to block escrow leakage. It also runs portfolio image hashing checks to flag plagiarized items.

### 4.7 AI Recommendation Agent
Content-based recommendation mapping. Matches open tasks to freelancers based on category and skills overlap.

### 4.8 AI Visibility Rotation Agent
Uses an epsilon-greedy algorithm (10% exploration threshold). Shuffles the bottom-tier list back into search results to avoid platform visibility monopolies.

### 4.9 AI Portfolio Analysis Agent
Grades profiles on description completeness, links, and project file attachments.

### 4.10 AI Skill Verification Agent
Validates stated expertise by checking completed order counts and durations against standard technology taxonomies.

### 4.11 AI Dispute Analysis Agent
Parses milestones completed against deadlines missed. Proposes refund allocations (e.g., 60% client refund, 40% provider payout) for human admin review.

### 4.12 AI Analytics Agent
Synthesizes system operations, including click-through rates (CTR) on matching results, API request times, and fraud cases.

### 4.13 AI Learning Agent
Updates JSR ratios and ranking parameters after successful projects.

### 4.14 AI Notification Agent
Dispatches security warning messages and ranking alerts.

### 4.15 AI Operations (AIOps) Agent
Tracks system telemetry (CPU cores, memory leaks, thread pool depths) and triggers alerts if boundaries are exceeded.

---

## 5. Deployment Guide & Scaling

### 5.1 Docker Architecture
To deploy the engine locally:
1. Populate your environment variables inside the local `.env` configuration file.
2. Spin up containers in single-click mode:
   ```bash
   docker-compose up --build -d
   ```

### 5.2 Kubernetes Production Orchestration
Deploy AME onto a cloud cluster (GKE, EKS) with standard scaling setups:
```bash
# Apply settings
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Run stateful database & redis deployment
kubectl apply -f k8s/deployment.yaml
```

---

## 6. Integration Guide for the Freelancing Website

To connect your existing Next.js / Firebase marketplace to AME, you only need to configure three elements:

### 6.1 Set Environment Variables
Add these to the Next.js `.env` configuration:
```env
AME_BASE_URL=http://your-ame-cluster-ip:8000
AME_API_KEY=workly_ame_secret_key
AME_WEBHOOK_SECRET=workly_ame_webhook_secret
```

### 6.2 Forward Events from Next.js
Whenever a relevant user action occurs, send the payload to AME:
```typescript
async function trackEvent(eventType: string, data: object) {
  const url = `${process.env.AME_BASE_URL}/api/events/${eventType}`;
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-AME-API-Key": process.env.AME_API_KEY as string
    },
    body: JSON.stringify(data)
  });
}
```

### 6.3 Securely Consume AME Webhook Decisions
Set up an endpoint at `/api/webhooks/ame` inside Next.js to receive callbacks. Verify the signature header using your `AME_WEBHOOK_SECRET`:
```typescript
import crypto from 'crypto';

export async function POST(req: Request) {
  const signature = req.headers.get("X-AME-Signature");
  const rawBody = await req.text();
  
  const expectedSignature = crypto
    .createHmac("sha256", process.env.AME_WEBHOOK_SECRET as string)
    .update(rawBody)
    .digest("hex");
    
  if (signature !== expectedSignature) {
    return new Response("Unauthorized signature", { status: 403 });
  }
  
  const payload = JSON.parse(rawBody);
  // Apply decisions directly to Firestore (e.g. update user's trustScore or ban user)
  return new Response("OK", { status: 200 });
}
```
