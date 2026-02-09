# How Next and Previous Buttons Work - Detailed Explanation

## 🎯 Overview

The Next and Previous buttons allow users to navigate between tabs in a multi-tab form while automatically saving their progress and validating required fields.

---

## 📋 Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FORM WITH 2 TABS                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Tab 1: Personal Information                                │
│  ┌────────────────────────────────────────────┐            │
│  │ [First Name*] [Last Name*]                  │            │
│  │ [Email*] [Phone]                            │            │
│  │                                              │            │
│  │ [Save & Exit]  [Next →]                     │            │
│  └────────────────────────────────────────────┘            │
│                                                              │
│  Tab 2: Contact Details                                     │
│  ┌────────────────────────────────────────────┐            │
│  │ [Address*] [City*] [State*]                 │            │
│  │                                              │            │
│  │ [← Previous]  [Save & Exit]                 │            │
│  └────────────────────────────────────────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔵 NEXT BUTTON - How It Works

### Step-by-Step Process:

#### 1. **Button State Management (Automatic)**
```javascript
// The button checks if it should be enabled or disabled
const updateNextButtonState = async () => {
  // Check if we're on the last tab
  if (currentTabIndex >= totalTabs - 1) {
    nextBtn.disabled = true  // Disable on last tab
    return
  }

  // Check all required fields in current tab
  const requiredFields = currentTab.components.filter(
    comp => comp.validate?.required && comp.key
  )
  
  // Check if all required fields are filled
  let allRequiredFilled = true
  for (const field of requiredFields) {
    const value = form.data[field.key]
    if (!value || value.trim() === '') {
      allRequiredFilled = false  // Found empty required field
      break
    }
  }

  // Enable/disable button based on validation
  nextBtn.disabled = !allRequiredFilled
}
```

**What happens:**
- ✅ Button is **ENABLED** when all required fields in current tab are filled
- ❌ Button is **DISABLED** when any required field is empty
- ❌ Button is **DISABLED** on the last tab (no next tab to go to)

#### 2. **User Clicks Next Button**

```
User clicks "Next" button
         ↓
    [Validation Check]
         ↓
    [Save Draft]
         ↓
    [Navigate to Next Tab]
```

#### 3. **Validation Process**
```javascript
nextBtn.addEventListener('click', async () => {
  // Step 1: Validate current tab
  const errors = await form.checkValidity(form.data, true)
  
  if (errors && errors.length > 0) {
    form.showErrors(errors)  // Show error messages
    return  // Stop - don't navigate
  }
  
  // If validation passes, continue...
})
```

**What happens:**
- FormIO validates all fields in the current tab
- If errors found → Shows error messages, stops navigation
- If no errors → Continues to save and navigate

#### 4. **Save Draft**
```javascript
// Save all form data to database
await fetch('/api/forms/draft', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    formId: 11,
    data: form.data,  // All form data (all tabs)
    currentTab: currentTabIndex + 1,  // Next tab index
  }),
})
```

**What happens:**
- Saves ALL form data (from all tabs) to database
- Sets `status: 'draft'` in database
- Stores `currentTab: 1` (next tab index)
- User can resume later from this point

#### 5. **Navigate to Next Tab**
```javascript
// Find the tabs component
const tabsComponent = form.components.find(
  comp => comp.type === 'tabs' || comp.type === 'panel'
)

// Navigate to next tab
if (tabsComponent && tabsComponent.setActiveTab) {
  tabsComponent.setActiveTab(currentTabIndex + 1)
} else {
  // Fallback: Click the tab element
  const nextTabElement = document.querySelector(
    `[data-tab-index="${currentTabIndex + 1}"]`
  )
  nextTabElement.click()
}
```

**What happens:**
- Switches to the next tab
- Shows the next tab's fields
- Previously entered data is still visible (saved in form.data)

---

## 🔴 PREVIOUS BUTTON - How It Works

### Step-by-Step Process:

#### 1. **Button State Management (Automatic)**
```javascript
const updatePreviousButtonState = () => {
  const currentTabIndex = getCurrentTabIndex()
  
  // Disable on first tab (index 0)
  prevBtn.disabled = currentTabIndex === 0
  prevBtn.style.opacity = currentTabIndex === 0 ? '0.5' : '1'
  prevBtn.style.cursor = currentTabIndex === 0 ? 'not-allowed' : 'pointer'
}
```

**What happens:**
- ✅ Button is **ENABLED** on tab 2, 3, 4, etc.
- ❌ Button is **DISABLED** on tab 1 (first tab)
- Button state updates automatically when tabs change

#### 2. **User Clicks Previous Button**

```
User clicks "Previous" button
         ↓
    [Navigate to Previous Tab]
         ↓
    [Show Previous Data]
```

#### 3. **Navigate to Previous Tab**
```javascript
prevBtn.addEventListener('click', () => {
  const currentTabIndex = getCurrentTabIndex()
  
  if (currentTabIndex === 0) {
    return  // Can't go back from first tab
  }

  // Find tabs component
  const tabsComponent = form.components.find(
    comp => comp.type === 'tabs' || comp.type === 'panel'
  )
  
  // Navigate to previous tab
  if (tabsComponent && tabsComponent.setActiveTab) {
    tabsComponent.setActiveTab(currentTabIndex - 1)
  } else {
    // Fallback: Click the tab element
    const prevTabElement = document.querySelector(
      `[data-tab-index="${currentTabIndex - 1}"]`
    )
    prevTabElement.click()
  }
})
```

**What happens:**
- Checks if we're on first tab (if yes, do nothing)
- Switches to the previous tab
- Shows previously entered data (stored in form.data)
- **Note:** Previous button does NOT save draft (only Next and Save & Exit do)

---

## 📊 Complete Example Flow

### Scenario: User filling out a 2-tab form

```
┌─────────────────────────────────────────────────────────────┐
│ INITIAL STATE                                               │
├─────────────────────────────────────────────────────────────┤
│ Tab 1: Personal Information                                │
│ - First Name: [empty]                                       │
│ - Last Name: [empty]                                        │
│ - Email: [empty]                                            │
│                                                              │
│ Buttons: [Save & Exit] [Next (DISABLED)]                   │
│          ↑ Next is disabled because required fields empty   │
└─────────────────────────────────────────────────────────────┘

         ↓ User fills in required fields

┌─────────────────────────────────────────────────────────────┐
│ AFTER FILLING REQUIRED FIELDS                               │
├─────────────────────────────────────────────────────────────┤
│ Tab 1: Personal Information                                 │
│ - First Name: "John" ✓                                       │
│ - Last Name: "Doe" ✓                                         │
│ - Email: "john@example.com" ✓                                │
│                                                              │
│ Buttons: [Save & Exit] [Next (ENABLED)]                    │
│          ↑ Next is now enabled!                             │
└─────────────────────────────────────────────────────────────┘

         ↓ User clicks "Next"

┌─────────────────────────────────────────────────────────────┐
│ VALIDATION & SAVE                                           │
├─────────────────────────────────────────────────────────────┤
│ 1. ✅ Validate Tab 1 fields                                │
│ 2. 💾 Save draft to database:                              │
│    {                                                         │
│      formId: 11,                                            │
│      data: { firstName: "John", lastName: "Doe", ... },     │
│      currentTab: 1,  // Next tab index                      │
│      status: "draft"                                        │
│    }                                                         │
│ 3. ➡️ Navigate to Tab 2                                    │
└─────────────────────────────────────────────────────────────┘

         ↓ Navigation complete

┌─────────────────────────────────────────────────────────────┐
│ TAB 2 DISPLAYED                                             │
├─────────────────────────────────────────────────────────────┤
│ Tab 2: Contact Details                                       │
│ - Address: [empty]                                          │
│ - City: [empty]                                             │
│ - State: [empty]                                            │
│                                                              │
│ Buttons: [← Previous (ENABLED)] [Save & Exit]              │
│          ↑ Previous is enabled (not on first tab)           │
└─────────────────────────────────────────────────────────────┘

         ↓ User clicks "Previous"

┌─────────────────────────────────────────────────────────────┐
│ BACK TO TAB 1                                               │
├─────────────────────────────────────────────────────────────┤
│ Tab 1: Personal Information                                 │
│ - First Name: "John" ✓ (data preserved)                   │
│ - Last Name: "Doe" ✓ (data preserved)                       │
│ - Email: "john@example.com" ✓ (data preserved)             │
│                                                              │
│ Buttons: [Save & Exit] [Next (ENABLED)]                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Key Technical Details

### How Tab Index is Determined

```javascript
const getCurrentTabIndex = () => {
  // Find the tabs component
  const tabsComponent = form.components.find(
    comp => comp.type === 'tabs' || comp.type === 'panel'
  )
  
  // Find which tab is currently active
  const activeTab = tabsComponent.tabs.find((tab, index) => {
    const tabElement = document.querySelector(`[data-tab-index="${index}"]`)
    return tabElement?.classList.contains('active') || 
           tabElement?.getAttribute('aria-selected') === 'true'
  })
  
  return tabsComponent.tabs.indexOf(activeTab)
}
```

### How Required Fields are Checked

```javascript
// Get all components in current tab
const currentTab = tabsComponent.tabs[currentTabIndex]

// Filter to find required fields
const requiredFields = currentTab.components.filter((comp) => 
  comp.validate?.required && comp.key
)

// Check each required field
for (const field of requiredFields) {
  const value = form.data[field.key]
  
  // Check if empty
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    allRequiredFilled = false
    break
  }
}
```

### How Data Persists Across Tabs

```javascript
// All form data is stored in form.data object
form.data = {
  firstName: "John",      // From Tab 1
  lastName: "Doe",         // From Tab 1
  email: "john@example.com", // From Tab 1
  address: "123 Main St",  // From Tab 2
  city: "New York",        // From Tab 2
  // ... all fields from all tabs
}

// When navigating between tabs, form.data is preserved
// So when you go back to Tab 1, the data is still there
```

---

## ⚠️ Important Notes

1. **Next Button Validation:**
   - Only checks required fields in the CURRENT tab
   - Does NOT check fields in other tabs
   - Button state updates automatically as user types

2. **Previous Button:**
   - Does NOT save draft (only navigates)
   - Does NOT validate (just goes back)
   - Always shows previously entered data

3. **Data Saving:**
   - Next button saves draft automatically
   - Save & Exit button saves draft
   - Previous button does NOT save (user can use Save & Exit if needed)

4. **Tab Navigation:**
   - Uses FormIO's built-in tab navigation
   - Falls back to DOM click if FormIO API not available
   - Preserves all form data during navigation

---

## 🧪 Testing the Buttons

### Test Next Button:
1. Go to Tab 1
2. Leave required fields empty → Next button should be **disabled**
3. Fill required fields → Next button should be **enabled**
4. Click Next → Should validate, save, and navigate to Tab 2

### Test Previous Button:
1. Go to Tab 2
2. Previous button should be **enabled**
3. Click Previous → Should navigate back to Tab 1
4. Go to Tab 1 → Previous button should be **disabled**

### Test Data Persistence:
1. Fill Tab 1 fields
2. Click Next to go to Tab 2
3. Fill Tab 2 fields
4. Click Previous to go back to Tab 1
5. Verify Tab 1 data is still there ✓
6. Click Next again
7. Verify Tab 2 data is still there ✓

---

## 🐛 Troubleshooting

### Next Button Always Disabled?
- Check if required fields are actually filled
- Check browser console for errors
- Verify form.data contains the field values

### Previous Button Not Working?
- Check if you're on the first tab (should be disabled)
- Check browser console for errors
- Verify tabs component exists in form

### Data Not Persisting?
- Check if draft is being saved (check Network tab)
- Verify form.data object contains the values
- Check browser console for errors

---

## 📝 Summary

**Next Button:**
- ✅ Validates required fields
- ✅ Saves draft automatically
- ✅ Navigates to next tab
- ✅ Disabled until required fields filled

**Previous Button:**
- ✅ Navigates to previous tab
- ✅ Shows saved data
- ✅ Disabled on first tab
- ❌ Does NOT save draft

Both buttons work together to provide a smooth multi-tab form experience with automatic saving and validation!
