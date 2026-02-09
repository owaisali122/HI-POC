# Tab Navigation Buttons for Multi-Tab Forms

This document explains how to use the Tab Navigation Buttons feature for multi-tab FormIO forms.

## Overview

The Tab Navigation Buttons feature provides three types of buttons for multi-tab forms:

1. **Save & Exit** - Saves current form data as a draft and redirects user away
2. **Next** - Saves current tab data and navigates to the next tab
3. **Previous** - Navigates to the previous tab (disabled on first tab)

## Features

- ✅ Automatic draft saving
- ✅ Resume from saved state
- ✅ Tab navigation with validation
- ✅ Required field validation before Next
- ✅ Button state management (Previous disabled on first tab, Next disabled until required fields filled)
- ✅ Current tab tracking for resume functionality

## Database Changes

The `form-submissions` collection has been extended with:

- `status` field: `'draft'` or `'submitted'`
- `currentTab` field: Tracks which tab the user was on

## API Endpoints

### Save Draft
```
POST /api/forms/draft
Body: {
  formId: number,
  data: object,
  currentTab?: number | string
}
```

### Get Draft
```
GET /api/forms/draft/[submissionId]
```

### Update Draft
```
PUT /api/forms/draft/[submissionId]
Body: {
  data: object,
  currentTab?: number | string
}
```

### Resume Draft
```
GET /api/forms/draft/resume?formId=11&email=user@example.com
```

## Adding Buttons to Your Form

### Option 1: Using the Script (Recommended)

Run the script to automatically add buttons to all tabs in form ID 11:

```bash
pnpm tsx scripts/add-navigation-buttons.ts
```

This script will:
- Find all tabs in the form
- Add Previous button (except on first tab)
- Add Save & Exit button (on all tabs)
- Add Next button (except on last tab)

### Option 2: Manual Addition via Form Builder

1. Open your form in the FormIO builder
2. Navigate to the tab where you want to add buttons
3. Click "Add Component"
4. Search for "Tab Navigation Buttons" in the custom components
5. Configure the button:
   - **Key**: Unique identifier (e.g., `personalInfo_next`)
   - **Label**: Display text (optional)
   - **Action**: Select one of:
     - `saveAndExit` - Save & Exit button
     - `next` - Next button
     - `previous` - Previous button
   - **Form ID**: The form ID (e.g., `11`)

6. Repeat for each tab as needed

## Button Behavior

### Save & Exit Button

- Validates current tab
- Saves all form data as draft
- Stores current tab index
- Redirects user to previous page (or home if no history)

### Next Button

- Validates current tab (checks required fields)
- Saves form data as draft
- Updates current tab to next tab index
- Navigates to next tab
- **Disabled** until all required fields in current tab are filled

### Previous Button

- Navigates to previous tab
- Shows previously entered data
- **Disabled** on the first tab

## Resume Functionality

When a user returns to a form with a saved draft:

1. Check for existing draft using the resume endpoint
2. Load draft data into the form
3. Navigate to the saved `currentTab`
4. Display all previously entered data

Example implementation:

```typescript
// On form load
const checkDraft = async () => {
  const email = formData.email // Get from form or user session
  const response = await fetch(`/api/forms/draft/resume?formId=11&email=${email}`)
  const result = await response.json()
  
  if (result.hasDraft && result.submission) {
    // Load draft data
    form.submission = result.submission.data
    
    // Navigate to saved tab
    if (result.submission.currentTab) {
      // Navigate to tab
      tabsComponent.setActiveTab(result.submission.currentTab)
    }
  }
}
```

## Validation

The Next button automatically validates required fields in the current tab:

- Checks all components with `validate.required: true`
- Disables Next button if any required field is empty
- Shows validation errors when Next is clicked with invalid data

## Customization

### Button Styling

Buttons use Bootstrap classes and can be customized via CSS:

```css
.tab-navigation-buttons {
  /* Container styles */
}

.tab-navigation-buttons .btn {
  /* Button styles */
}
```

### Button Text

Button text can be customized in the FormIO builder by setting the `label` property.

## Troubleshooting

### Buttons Not Appearing

1. Ensure the custom component is registered:
   - Check browser console for "✅ Tab Navigation Buttons component registered successfully"
   - Verify `registerCustomComponents()` is called before form initialization

2. Check form structure:
   - Ensure form has tabs component
   - Verify buttons are added to tab components, not root form

### Draft Not Saving

1. Check API endpoint:
   - Verify `/api/forms/draft` endpoint is accessible
   - Check browser network tab for errors

2. Check form ID:
   - Ensure `formId` in button configuration matches actual form ID

### Navigation Not Working

1. Check tab structure:
   - Verify tabs are using FormIO's tabs component
   - Check that tab indices are correct

2. Check browser console:
   - Look for JavaScript errors
   - Verify form instance is available

## Example Form Schema

```json
{
  "display": "form",
  "components": [
    {
      "type": "tabs",
      "key": "formTabs",
      "components": [
        {
          "type": "panel",
          "key": "personalInfo",
          "label": "Personal Information",
          "components": [
            {
              "type": "textfield",
              "key": "firstName",
              "label": "First Name",
              "validate": { "required": true }
            },
            {
              "type": "tabnavigationbuttons",
              "key": "personalInfo_buttons",
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
              "key": "email",
              "label": "Email",
              "validate": { "required": true }
            },
            {
              "type": "tabnavigationbuttons",
              "key": "contact_previous",
              "action": "previous",
              "formId": 11
            },
            {
              "type": "tabnavigationbuttons",
              "key": "contact_saveExit",
              "action": "saveAndExit",
              "formId": 11
            },
            {
              "type": "tabnavigationbuttons",
              "key": "contact_next",
              "action": "next",
              "formId": 11
            }
          ]
        }
      ]
    }
  ]
}
```

## Security Considerations

- Draft submissions are stored with `status: 'draft'`
- Drafts can be updated by anyone (via API with proper validation)
- Consider adding user authentication for production use
- Drafts can be identified by form ID and email (if provided)

## Future Enhancements

Potential improvements:
- User authentication for draft ownership
- Draft expiration (auto-delete old drafts)
- Draft sharing between devices
- Progress indicator showing completed tabs
- Auto-save on field change
