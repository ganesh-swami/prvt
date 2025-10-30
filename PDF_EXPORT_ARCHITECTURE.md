# PDF Export Architecture - Clean & Reusable

## 🎯 Core Principle: ZERO CODE DUPLICATION

All PDF exports (individual AND comprehensive) use **THE SAME FUNCTIONS**.

---

## 📁 File Structure

```
src/utils/
├── pdfUtils.ts              # Common PDF utilities (create, download, headers, footers)
├── modulePDFExports.ts      # Module-specific content functions
└── comprehensiveModulePDFExport.ts  # Comprehensive export (chains modules)

src/components/modules/enhanced/
├── PlanBuilderPDFExport.tsx  # Uses shared functions ✅ REFACTORED
├── SocialCanvasExport.tsx    # TODO: Refactor to use shared functions
├── MarketSizingEnhanced.tsx  # TODO: Refactor to use shared functions
├── PricingLabEnhanced.tsx    # TODO: Refactor to use shared functions
├── UnitEconomicsEnhanced.tsx # TODO: Refactor to use shared functions
└── FinancialModelerEnhanced.tsx # TODO: Refactor to use shared functions
```

---

## 🔧 Shared Utility Functions (`pdfUtils.ts`)

### 1. PDF Lifecycle
- `createPDFInstance()` - Creates new jsPDF instance
- `downloadPDF(doc, filename)` - Downloads PDF file

### 2. Page Components
- `addTitlePage(doc, title, subtitle, color)` - Adds colored title page
- `addModuleSeparatorPage(doc, moduleName, color)` - Adds separator for comprehensive exports
- `addFooterToAllPages(doc, footerText)` - Adds page numbers and footer to all pages

---

## 📦 Module Content Functions (`modulePDFExports.ts`)

Each function follows this pattern:

```typescript
export const addModuleNameContent = (
  doc: jsPDF,           // Existing PDF instance
  data: DataType,       // Module-specific data
  startOnNewPage: boolean = false  // Whether to start on new page
): jsPDF => {
  // If starting on new page, add it first
  if (startOnNewPage) {
    doc.addPage();
  }
  
  // Start at yPos 20 (new page) or 40 (after separator)
  let yPos = startOnNewPage ? 20 : 40;
  
  // Add module content to PDF
  return doc;  // Return updated instance
};
```

**Key Points:**
- `startOnNewPage=true` → Adds new page, starts at yPos=20
- `startOnNewPage=false` → Stays on current page, starts at yPos=40 (avoids separator overlap)
- Always returns the updated doc instance for chaining

### ✅ Implemented:
- `addPlanBuilderContent(doc, sections, planData, startOnNewPage)`
- `addSocialCanvasContent(doc, canvasData, startOnNewPage)`

### 🔄 TODO - Need to Extract:
- `addMarketSizingContent(doc, results, valueUnit, startOnNewPage)`
- `addPricingLabContent(doc, results, pricingData, startOnNewPage)`
- `addUnitEconomicsContent(doc, results, startOnNewPage)`
- `addFinancialModelerContent(doc, results, startOnNewPage)`

---

## 🎨 Usage Patterns

### Pattern 1: Individual Module Export

```typescript
// Example: PlanBuilderPDFExport.tsx
import { createPDFInstance, addTitlePage, addFooterToAllPages, downloadPDF } from "@/utils/pdfUtils";
import { addPlanBuilderContent } from "@/utils/modulePDFExports";

const exportToPDF = () => {
  let doc = createPDFInstance();
  doc = addTitlePage(doc, "Business Plan", projectName, [59, 130, 246]);
  doc = addPlanBuilderContent(doc, sections, planData, true);
  doc = addFooterToAllPages(doc, "Business Plan");
  downloadPDF(doc, `business-plan-${projectName}`);
};
```

**Before**: 230 lines of duplicate code  
**After**: 14 lines using shared functions  
**Reduction**: 93% less code! 🎉

---

### Pattern 2: Comprehensive Multi-Module Export

```typescript
// Example: comprehensiveModulePDFExport.ts
import { createPDFInstance, addModuleSeparatorPage, addFooterToAllPages, downloadPDF } from "@/utils/pdfUtils";
import {
  addPlanBuilderContent,
  addSocialCanvasContent,
  addMarketSizingContent,
  // ... other modules
} from "@/utils/modulePDFExports";

const generateComprehensivePDF = () => {
  // Create base PDF
  let doc = createPDFInstance();
  
  // Add cover page
  doc = addTitlePage(doc, "Comprehensive Business Report", projectName, [59, 130, 246]);
  
  // Chain modules together
  doc = addModuleSeparatorPage(doc, "Business Plan", [59, 130, 246]);
  doc = addPlanBuilderContent(doc, sections, planData, false);
  
  doc = addModuleSeparatorPage(doc, "Social Canvas", [244, 63, 94]);
  doc = addSocialCanvasContent(doc, canvasData, false);
  
  doc = addModuleSeparatorPage(doc, "Market Sizing", [34, 197, 94]);
  doc = addMarketSizingContent(doc, marketData, valueUnit, false);
  
  // ... add more modules
  
  // Add footer to all pages
  doc = addFooterToAllPages(doc, "Comprehensive Report");
  
  // Download
  downloadPDF(doc, `comprehensive-report-${projectName}`);
};
```

---

## ✅ Benefits of This Architecture

1. **Zero Duplication** - One function per module, used everywhere
2. **Easy Updates** - Change design once, updates everywhere automatically
3. **Chainable** - Can combine modules in any order
4. **Reusable** - Same functions for individual OR comprehensive exports
5. **Testable** - Each function can be tested independently
6. **Maintainable** - Clear separation of concerns

---

## 🚀 Next Steps (In Order)

### 1. Extract Market Sizing PDF Code
- Find existing export code in MarketSizingEnhanced.tsx
- Create `addMarketSizingContent()` function
- Update individual export to use shared function

### 2. Extract Pricing Lab PDF Code
- Find existing export code in PricingLabEnhanced.tsx
- Create `addPricingLabContent()` function
- Update individual export to use shared function

### 3. Extract Unit Economics PDF Code
- Find existing export code in UnitEconomicsEnhanced.tsx
- Create `addUnitEconomicsContent()` function
- Update individual export to use shared function

### 4. Extract Financial Modeler PDF Code
- Find existing export code in FinancialModelerEnhanced.tsx
- Create `addFinancialModelerContent()` function
- Update individual export to use shared function

### 5. Update Comprehensive Export
- Replace ALL code in comprehensiveModulePDFExport.ts
- Use new shared functions
- Test complete workflow

### 6. Delete Old Files (AFTER testing!)
- Delete `modulePDFGenerators.ts` (old duplicate code)
- Clean up any unused imports

---

## 🎯 Current Status

- ✅ **pdfUtils.ts** - Created with all common functions
- ✅ **modulePDFExports.ts** - Created with Plan Builder & Social Canvas
- ✅ **PlanBuilderPDFExport.tsx** - Refactored to use shared functions (93% reduction!)
- ⏳ **Overlap Fix** - yPos changed from 30 to 40 to prevent header overlap
- 🔄 **Remaining** - 4 more modules need extraction (Market Sizing, Pricing, Unit Economics, Financial)

---

## 💡 Key Design Decisions

1. **Functions accept existing `doc` instance** - Enables chaining multiple modules
2. **Functions return updated `doc` instance** - Functional programming pattern
3. **`startOnNewPage` parameter** - Flexible for individual (true) vs comprehensive (false) exports
4. **Separator at yPos 40** - Prevents content overlap with module separator header
5. **Same color schemes** - Individual exports match comprehensive export sections

---

## 🔥 Example: Before vs After

### Before (Duplicate Code Everywhere)
```typescript
// PlanBuilderPDFExport.tsx - 230 lines
const doc = new jsPDF(...);
doc.setFillColor(59, 130, 246);
doc.rect(0, 0, pageWidth, 70, "F");
// ... 220 more lines

// comprehensiveModulePDFExport.ts - 180 lines
const doc = new jsPDF(...);
doc.setFillColor(59, 130, 246);
doc.rect(0, 0, pageWidth, 70, "F");
// ... 170 more lines (DUPLICATE!)
```

### After (Shared Functions)
```typescript
// PlanBuilderPDFExport.tsx - 14 lines
let doc = createPDFInstance();
doc = addTitlePage(doc, "Business Plan", projectName, [59, 130, 246]);
doc = addPlanBuilderContent(doc, sections, planData, true);
doc = addFooterToAllPages(doc, "Business Plan");
downloadPDF(doc, `business-plan-${projectName}`);

// comprehensiveModulePDFExport.ts - uses SAME functions!
let doc = createPDFInstance();
doc = addTitlePage(doc, "Comprehensive Report", projectName, [59, 130, 246]);
doc = addModuleSeparatorPage(doc, "Business Plan", [59, 130, 246]);
doc = addPlanBuilderContent(doc, sections, planData, false);
// ... chain other modules
```

**No duplication! Change design in one place, updates everywhere!** 🎉
