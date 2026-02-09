# How Tab Navigation Buttons Were Added to Tabs - Simple Explanation

## 🎯 Simple Answer

**Yes, that's the functionality!** The buttons are added as **regular FormIO components** inside each tab, just like text fields or other form fields.

---

## 📋 How It Works (Step by Step)

### Step 1: Created a Custom FormIO Component

I created a custom component called `TabNavigationButtons` that FormIO can use:

```typescript
// src/components/formio/TabNavigationButtons.ts
export class TabNavigationButtonsComponent {
  // This is a custom FormIO component
  // It renders buttons (Save & Exit, Next, Previous)
}
```

### Step 2: Registered the Component

I registered it so FormIO knows about it:

```typescript
// src/utils/formio-component-registry.ts
Formio.Components.setComponent('tabnavigationbuttons', TabNavigationButtons)
```

Now FormIO recognizes `type: 'tabnavigationbuttons'` as a valid component type.

### Step 3: Added Buttons to Each Tab's Components Array

The script adds button components to each tab, just like adding any other field:

```javascript
// For Tab 1: Personal Information
tab.components = [
  // ... existing fields (firstName, lastName, etc.) ...
  
  // Add button components
  {
    type: 'tabnavigationbuttons',
    key: 'personalInfo_saveExit',
    action: 'saveAndExit',
    formId: 11
  },
  {
    type: 'tabnavigationbuttons',
    key: 'personalInfo_next',
    action: 'next',
    formId: 11
  }
]

// For Tab 2: Contact Details
tab.components = [
  // ... existing fields (address, city, etc.) ...
  
  // Add button components
  {
    type: 'tabnavigationbuttons',
    key: 'contactDetails_previous',
    action: 'previous',
    formId: 11
  },
  {
    type: 'tabnavigationbuttons',
    key: 'contactDetails_saveExit',
    action: 'saveAndExit',
    formId: 11
  }
]
```

---

## 🏗️ Form Structure (Before vs After)

### BEFORE (Original Form Structure:

```json
{
  "display": "form",
  "components": [
    {
      "type": "tabs",
      "components": [
        {
          "type": "panel",
          "key": "personalInfo",
          "label": "Personal Information",
          "components": [
            {
              "type": "textfield",
              "key": "firstName",
              "label": "First Name"
            },
            {
              "type": "textfield",
              "key": "lastName",
              "label": "Last Name"
            }
          ]
        },
        {
          "type": "panel",
          "key": "contactDetails",
          "label": "Contact Details",
          "components": [
            {
              "type": "textfield",
              "key": "address",
              "label": "Address"
            }
          ]
        }
      ]
    }
  ]
}
```

### AFTER (With Buttons Added):

```json
{
  "display": "form",
  "components": [
    {
      "type": "tabs",
      "components": [
        {
          "type": "panel",
          "key": "personalInfo",
          "label": "Personal Information",
          "components": [
            {
              "type": "textfield",
              "key": "firstName",
              "label": "First Name"
            },
            {
              "type": "textfield",
              "key": "lastName",
              "label": "Last Name"
            },
            // ✅ BUTTONS ADDED HERE
            {
              "type": "tabnavigationbuttons",
              "key": "personalInfo_saveExit",
              "action": "saveAndExit",
              "formId": 11
            },
            {
              "type": "tabnavigationbuttons",
              "key": "personalInfo_next",
              "action": "next",
              "formId": 11
            }
          ]
        },
        {
          "type": "panel",
          "key": "contactDetails",
          "label": "Contact Details",
          "components": [
            {
              "type": "textfield",
              "key": "address",
              "label": "Address"
            },
            // ✅ BUTTONS ADDED HERE
            {
              "type": "tabnavigationbuttons",
              "key": "contactDetails_previous",
              "action": "previous",
              "formId": 11
            },
            {
              "type": "tabnavigationbuttons",
              "key": "contactDetails_saveExit",
              "action": "saveAndExit",
              "formId": 11
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 🔍 Visual Representation

```
Form Structure:
┌─────────────────────────────────────┐
│ FORM (ID: 11)                       │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ TABS Component                  │ │
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ TAB 1: Personal Info       │ │ │
│ │ │                             │ │ │
│ │ │ Components Array:           │ │ │
│ │ │ [                           │ │ │
│ │ │   firstName (textfield),    │ │ │
│ │ │   lastName (textfield),    │ │ │
│ │ │   email (textfield),        │ │ │
│ │ │   ✅ saveExit (button),     │ │ │ ← Added here
│ │ │   ✅ next (button)          │ │ │ ← Added here
│ │ │ ]                           │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ TAB 2: Contact Details      │ │ │
│ │ │                             │ │ │
│ │ │ Components Array:           │ │ │
│ │ │ [                           │ │ │
│ │ │   address (textfield),      │ │ │
│ │ │   city (textfield),         │ │ │
│ │ │   ✅ previous (button),     │ │ │ ← Added here
│ │ │   ✅ saveExit (button)      │ │ │ ← Added here
│ │ │ ]                           │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 💡 Key Points

1. **Buttons are just FormIO components** - They're added to the `components` array of each tab, just like text fields

2. **Each button is a separate component** - Each button (Previous, Save & Exit, Next) is a separate component instance

3. **They appear at the bottom of each tab** - Because they're added to the end of the components array

4. **The script does it automatically** - The script (`add-navigation-buttons.ts`) programmatically adds these components to each tab

---

## 🛠️ How the Script Works

```javascript
// 1. Get the form from database
const form = await payload.findByID({ collection: 'forms', id: 11 })

// 2. Find the tabs component
const tabsComponent = form.schema.components.find(comp => comp.type === 'tabs')

// 3. Loop through each tab
for (let i = 0; i < tabsComponent.components.length; i++) {
  const tab = tabsComponent.components[i]
  
  // 4. Add buttons to tab's components array
  tab.components.push({
    type: 'tabnavigationbuttons',
    action: 'next',
    formId: 11
  })
}

// 5. Save the form back to database
await payload.update({ collection: 'forms', id: 11, data: { schema: form.schema } })
```

---

## ✅ Summary

**Simple Answer:**
- ✅ Created a custom FormIO component (`TabNavigationButtons`)
- ✅ Registered it with FormIO
- ✅ Added button components to each tab's `components` array (just like any other field)
- ✅ Saved the form schema back to the database

**That's it!** The buttons are now part of the form structure, just like text fields or any other FormIO component.

---

## 🔄 You Can Also Add Them Manually

If you want to add buttons manually in the FormIO builder:

1. Open form 11 in FormIO builder
2. Go to a tab
3. Click "Add Component"
4. Search for "Tab Navigation Buttons"
5. Configure:
   - Action: `next`, `previous`, or `saveAndExit`
   - Form ID: `11`
6. Save

The script just automates this process for all tabs at once!
