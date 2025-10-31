# Feature Access Control Implementation Guide

## ✅ Phase 1: Infrastructure (COMPLETED)

### Created Files:
1. **Redux Slice**: `src/store/slices/subscriptionSlice.ts`
   - Manages organization subscription state globally
   - Fetches subscription from `organization_subscriptions` view
   - Auto-loaded when user organization changes

2. **Custom Hook**: `src/hooks/useFeatureAccess.ts`
   - `useFeatureAccess(featureId)` - Check single feature
   - `useFeatureAccessBatch(featureIds[])` - Check multiple features
   - Returns: `{ hasAccess, plan, feature, isLoading }`

3. **Components**:
   - `src/components/common/FeatureGuard.tsx` - Wrapper component for protecting features
   - `src/components/common/UpgradeRequired.tsx` - Beautiful upgrade screen
   - `src/components/billing/SubscriptionLoader.tsx` - Auto-loads subscription in App.tsx

4. **Redux Store Updated**: Added subscription reducer

5. **App.tsx Updated**: Added `<SubscriptionLoader />` component

---

## 🔐 Phase 2: Module Protection

### Pattern for Wrapping Modules:

```typescript
// 1. Import FeatureGuard
import { FeatureGuard } from "@/components/common/FeatureGuard";

// 2. Rename main component to *Content
const YourModuleContent: React.FC<Props> = ({ projectId }) => {
  // ... existing code ...
};

// 3. Create wrapped version
const YourModule: React.FC<Props> = ({ projectId }) => {
  return (
    <FeatureGuard
      featureId="feature-id-from-pricing-json"
      featureName="Display Name"
      description="Brief description of what this feature does"
    >
      <YourModuleContent projectId={projectId} />
    </FeatureGuard>
  );
};

// 4. Export wrapped version
export default YourModule;
```

---

## 📋 Modules to Protect

### **Completed:**
✅ `EcosystemMappingEnhanced.tsx` - Feature ID: `ecosystem-map`

### **Pending Protection:**

| Module | File | Feature ID | Plan Required |
|--------|------|-----------|---------------|
| Plan Builder | `enhanced/PlanBuilderEnhanced.tsx` | `plan-builder` | Starter ✅ |
| Social Canvas | `SocialBusinessCanvasImproved.tsx` | `social-canvas` | Starter ✅ |
| Problem Tree | `ProblemTree.tsx` | `problem-tree` | Starter ✅ |
| Market Sizing | `enhanced/MarketSizingEnhanced.tsx` | `market-sizing` | Solo+ |
| Pricing Lab | `enhanced/PricingLabEnhanced.tsx` | `pricing` | Solo+ |
| Unit Economics | `enhanced/UnitEconomicsEnhanced.tsx` | `unit-economics` | Solo+ |
| Financial Modeler | `enhanced/FinancialModelerEnhanced.tsx` | `financial` | Solo+ |
| GTM Planner | `GTMPlanner.tsx` | `gtm` | Pro+ |
| Competitor Analysis | `CompetitorAnalysis.tsx` | `competitor-analysis` | Pro+ |
| Investor Room | `InvestorRoom.tsx` | `investor-room` | Pro+ |
| Risk Center | `RiskCenter.tsx` | `risk-center` | Business |
| Team Collaboration | `TeamCollaborationEnhanced.tsx` | `team-collaboration` | Solo+ |

---

## 🎯 Quick Implementation for Each Module

### Example 1: Market Sizing (Solo+)
```typescript
import { FeatureGuard } from "@/components/common/FeatureGuard";

const MarketSizingEnhancedContent: React.FC<Props> = ({ projectId }) => {
  // ... existing code ...
};

const MarketSizingEnhanced: React.FC<Props> = ({ projectId }) => {
  return (
    <FeatureGuard
      featureId="market-sizing"
      featureName="Market Sizing"
      description="Calculate TAM, SAM, SOM and revenue opportunities for your market"
    >
      <MarketSizingEnhancedContent projectId={projectId} />
    </FeatureGuard>
  );
};

export default MarketSizingEnhanced;
```

### Example 2: Investor Room (Pro+)
```typescript
import { FeatureGuard } from "@/components/common/FeatureGuard";

const InvestorRoomContent: React.FC<Props> = ({ projectId }) => {
  // ... existing code ...
};

const InvestorRoom: React.FC<Props> = ({ projectId }) => {
  return (
    <FeatureGuard
      featureId="investor-room"
      featureName="Investor Room"
      description="Create professional investor presentations and pitch decks"
    >
      <InvestorRoomContent projectId={projectId} />
    </FeatureGuard>
  );
};

export default InvestorRoom;
```

### Example 3: Risk Center (Business Only)
```typescript
import { FeatureGuard } from "@/components/common/FeatureGuard";

const RiskCenterContent: React.FC<Props> = ({ projectId }) => {
  // ... existing code ...
};

const RiskCenter: React.FC<Props> = ({ projectId }) => {
  return (
    <FeatureGuard
      featureId="risk-center"
      featureName="Risk Center"
      description="Identify, assess, and mitigate business risks"
    >
      <RiskCenterContent projectId={projectId} />
    </FeatureGuard>
  );
};

export default RiskCenter;
```

---

## 🔍 How It Works

### 1. **On App Load:**
   - `SubscriptionLoader` component checks if user has organization
   - Fetches subscription from `organization_subscriptions` view
   - Stores in Redux for global access

### 2. **When User Visits Module:**
   - `FeatureGuard` calls `useFeatureAccess(featureId)`
   - Hook checks Redux subscription state
   - Looks up feature in `pricing.json` grants
   - Returns `{ hasAccess: boolean, plan: string }`

### 3. **Based on Access:**
   - **Has Access** → Renders the module
   - **No Access** → Shows `UpgradeRequired` screen with:
     - Current plan badge
     - Which plans include this feature
     - Benefits list
     - CTA buttons to upgrade

---

## 🎨 Sidebar Integration (Phase 3)

### Show Lock Icons for Unavailable Features:

```typescript
import { useFeatureAccessBatch } from "@/hooks/useFeatureAccess";
import { Lock } from "lucide-react";

// In Sidebar component:
const sidebarItems = [...]; // Your existing items

const featureIds = sidebarItems.map(item => item.id);
const accessMap = useFeatureAccessBatch(featureIds);

// In render:
{sidebarItems.map((item) => {
  const access = accessMap[item.id];
  const isLocked = !access?.hasAccess;
  
  return (
    <SidebarItem key={item.id}>
      {item.label}
      {isLocked && <Lock className="h-3 w-3 ml-auto" />}
    </SidebarItem>
  );
})}
```

---

## 💡 Testing Access Control

### Test with Different Plans:

1. **Starter (Free):**
   - Access: plan-builder, social-canvas, problem-tree
   - Blocked: All others

2. **Solo ($24/mo):**
   - Access: All above + market-sizing, pricing, unit-economics, financial, team-collaboration
   - Blocked: gtm, competitor-analysis, investor-room, risk-center

3. **Pro Team ($59/mo):**
   - Access: All above + gtm, competitor-analysis, investor-room
   - Blocked: risk-center

4. **Business ($119/mo):**
   - Access: Everything

### Manually Test:
```sql
-- Update your organization's plan
UPDATE organizations
SET subscription_plan = 'solo' -- or 'pro-team', 'business'
WHERE id = 'your-org-id';

-- Refresh the page and try accessing different modules
```

---

## 🚀 Deployment Checklist

- [ ] All modules wrapped with `FeatureGuard`
- [ ] Sidebar shows lock icons for unavailable features
- [ ] Pricing page shows "Upgrade" for current plan
- [ ] Database migration applied (`add_subscription_tracking.sql`)
- [ ] Stripe webhook processing subscription updates
- [ ] Tested all plan levels

---

## 📊 Feature Access Matrix

| Feature | Starter | Solo | Pro Team | Business |
|---------|---------|------|----------|----------|
| Plan Builder | ✅ | ✅ | ✅ | ✅ |
| Social Canvas | ✅ | ✅ | ✅ | ✅ |
| Problem Tree | ✅ | ✅ | ✅ | ✅ |
| Ecosystem Map | ❌ | ✅ | ✅ | ✅ |
| Market Sizing | ❌ | ✅ | ✅ | ✅ |
| Pricing Lab | ❌ | ✅ | ✅ | ✅ |
| Unit Economics | ❌ | ✅ | ✅ | ✅ |
| Financial Modeler | ❌ | ✅ | ✅ | ✅ |
| Team Collaboration | ❌ | ✅ | ✅ | ✅ |
| GTM Planner | ❌ | ❌ | ✅ | ✅ |
| Competitor Analysis | ❌ | ❌ | ✅ | ✅ |
| Investor Room | ❌ | ❌ | ✅ | ✅ |
| Risk Center | ❌ | ❌ | ❌ | ✅ |

---

## 🎯 Next Steps

1. **Wrap remaining modules** using the pattern above
2. **Update Sidebar** to show lock icons
3. **Add "Upgrade" button** to pricing page for current plan users
4. **Test thoroughly** with different subscription levels
5. **Deploy** and monitor

---

## 💬 Need Help?

**Common Issues:**

1. **Module still accessible when it shouldn't be:**
   - Check `pricing.json` grants for that feature
   - Verify featureId matches exactly
   - Clear browser cache and reload

2. **Always shows upgrade screen:**
   - Check if subscription is loaded in Redux
   - Check browser console for errors
   - Verify organization has correct plan in database

3. **TypeScript errors:**
   - Ensure all imports are correct
   - Check component prop types match

**Support:** Check browser console logs for `[SubscriptionLoader]` messages to debug subscription loading.
