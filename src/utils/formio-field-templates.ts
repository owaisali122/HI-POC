/**
 * Form.io Field Templates
 * 
 * Pre-configured field templates for common form fields.
 * Copy these JSON objects into your Form.io schema.
 */

export const formioFieldTemplates = {
  /**
   * SSN Field with Input Masking
   */
  ssn: {
    label: 'Social Security Number (SSN)',
    key: 'ssn',
    type: 'textfield',
    input: true,
    required: false,
    inputMask: '999-99-9999',
    placeholder: 'XXX-XX-XXXX',
    validate: {
      pattern: '^\\d{3}-\\d{2}-\\d{4}$',
      customMessage: 'SSN must be in format XXX-XX-XXXX',
    },
  },

  /**
   * Gender Dropdown
   */
  gender: {
    label: 'Gender',
    key: 'gender',
    type: 'select',
    input: true,
    required: true,
    data: {
      values: [
        { label: 'Select', value: '' },
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' },
        { label: 'Prefer not to say', value: 'prefer_not_to_say' },
      ],
    },
    placeholder: 'Select',
    widget: 'choicesjs',
    validate: {
      required: true,
    },
  },

  /**
   * US States Dropdown (all 50 states + DC)
   */
  state: {
    label: 'State',
    key: 'state',
    type: 'select',
    input: true,
    required: true,
    data: {
      values: [
        { label: 'Select State', value: '' },
        { label: 'Alabama', value: 'AL' },
        { label: 'Alaska', value: 'AK' },
        { label: 'Arizona', value: 'AZ' },
        { label: 'Arkansas', value: 'AR' },
        { label: 'California', value: 'CA' },
        { label: 'Colorado', value: 'CO' },
        { label: 'Connecticut', value: 'CT' },
        { label: 'Delaware', value: 'DE' },
        { label: 'Florida', value: 'FL' },
        { label: 'Georgia', value: 'GA' },
        { label: 'Hawaii', value: 'HI' },
        { label: 'Idaho', value: 'ID' },
        { label: 'Illinois', value: 'IL' },
        { label: 'Indiana', value: 'IN' },
        { label: 'Iowa', value: 'IA' },
        { label: 'Kansas', value: 'KS' },
        { label: 'Kentucky', value: 'KY' },
        { label: 'Louisiana', value: 'LA' },
        { label: 'Maine', value: 'ME' },
        { label: 'Maryland', value: 'MD' },
        { label: 'Massachusetts', value: 'MA' },
        { label: 'Michigan', value: 'MI' },
        { label: 'Minnesota', value: 'MN' },
        { label: 'Mississippi', value: 'MS' },
        { label: 'Missouri', value: 'MO' },
        { label: 'Montana', value: 'MT' },
        { label: 'Nebraska', value: 'NE' },
        { label: 'Nevada', value: 'NV' },
        { label: 'New Hampshire', value: 'NH' },
        { label: 'New Jersey', value: 'NJ' },
        { label: 'New Mexico', value: 'NM' },
        { label: 'New York', value: 'NY' },
        { label: 'North Carolina', value: 'NC' },
        { label: 'North Dakota', value: 'ND' },
        { label: 'Ohio', value: 'OH' },
        { label: 'Oklahoma', value: 'OK' },
        { label: 'Oregon', value: 'OR' },
        { label: 'Pennsylvania', value: 'PA' },
        { label: 'Rhode Island', value: 'RI' },
        { label: 'South Carolina', value: 'SC' },
        { label: 'South Dakota', value: 'SD' },
        { label: 'Tennessee', value: 'TN' },
        { label: 'Texas', value: 'TX' },
        { label: 'Utah', value: 'UT' },
        { label: 'Vermont', value: 'VT' },
        { label: 'Virginia', value: 'VA' },
        { label: 'Washington', value: 'WA' },
        { label: 'West Virginia', value: 'WV' },
        { label: 'Wisconsin', value: 'WI' },
        { label: 'Wyoming', value: 'WY' },
        { label: 'District of Columbia', value: 'DC' },
      ],
    },
    placeholder: 'Select State',
    widget: 'choicesjs',
    defaultValue: 'HI',
    validate: {
      required: true,
    },
  },

  /**
   * First Name Field
   */
  firstName: {
    label: 'First Name',
    key: 'firstName',
    type: 'textfield',
    input: true,
    required: true,
    placeholder: 'Enter first name',
    validate: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: "^[a-zA-Z\\s'-]+$",
      customMessage: "First name must contain only letters, spaces, hyphens, or apostrophes",
    },
  },

  /**
   * Last Name Field
   */
  lastName: {
    label: 'Last Name',
    key: 'lastName',
    type: 'textfield',
    input: true,
    required: true,
    placeholder: 'Enter last name',
    validate: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: "^[a-zA-Z\\s'-]+$",
      customMessage: "Last name must contain only letters, spaces, hyphens, or apostrophes",
    },
  },

  /**
   * Date of Birth Field
   */
  dateOfBirth: {
    label: 'Date of Birth',
    key: 'dateOfBirth',
    type: 'datetime',
    input: true,
    required: true,
    widget: {
      type: 'calendar',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: false,
    },
    enableDate: true,
    enableTime: false,
    format: 'MM/DD/YYYY',
    placeholder: 'mm/dd/yyyy',
    validate: {
      required: true,
    },
  },

  /**
   * Email Field
   */
  email: {
    label: 'Email Address',
    key: 'email',
    type: 'email',
    input: true,
    required: true,
    placeholder: 'example@email.com',
    validate: {
      required: true,
    },
  },

  /**
   * Phone Number Field with Masking
   */
  phone: {
    label: 'Phone Number',
    key: 'phone',
    type: 'phoneNumber',
    input: true,
    required: false,
    inputMask: '(999) 999-9999',
    placeholder: '(XXX) XXX-XXXX',
    validate: {
      pattern: '^\\(\\d{3}\\)\\s\\d{3}-\\d{4}$',
    },
  },

  /**
   * Address Line 1
   */
  addressLine1: {
    label: 'Address Line 1',
    key: 'addressLine1',
    type: 'textfield',
    input: true,
    required: true,
    placeholder: 'Street address',
    validate: {
      required: true,
    },
  },

  /**
   * Address Line 2 (Apartment/Suite)
   */
  addressLine2: {
    label: 'Apartment or Suite Number',
    key: 'addressLine2',
    type: 'textfield',
    input: true,
    required: false,
    placeholder: 'Optional',
  },

  /**
   * City Field
   */
  city: {
    label: 'City',
    key: 'city',
    type: 'textfield',
    input: true,
    required: true,
    placeholder: 'City',
    validate: {
      required: true,
    },
  },

  /**
   * Zip Code Field with Masking
   */
  zipCode: {
    label: 'Zip Code',
    key: 'zipCode',
    type: 'textfield',
    input: true,
    required: true,
    inputMask: '99999',
    placeholder: 'XXXXX',
    validate: {
      required: true,
      pattern: '^\\d{5}(-\\d{4})?$',
      customMessage: 'Please enter a valid 5 or 9 digit zip code',
    },
  },

  /**
   * Suffix Dropdown
   */
  suffix: {
    label: 'Suffix',
    key: 'suffix',
    type: 'select',
    input: true,
    required: false,
    data: {
      values: [
        { label: 'Select', value: '' },
        { label: 'Jr.', value: 'jr' },
        { label: 'Sr.', value: 'sr' },
        { label: 'II', value: 'ii' },
        { label: 'III', value: 'iii' },
        { label: 'IV', value: 'iv' },
      ],
    },
    placeholder: 'Select',
  },

  /**
   * US Citizenship Status Dropdown
   */
  citizenshipStatus: {
    label: 'Are you a US Citizen or Permanent Resident?',
    key: 'citizenshipStatus',
    type: 'select',
    input: true,
    required: true,
    data: {
      values: [
        { label: 'Select', value: '' },
        { label: 'US Citizen', value: 'us_citizen' },
        { label: 'Permanent Resident', value: 'permanent_resident' },
        { label: 'Other', value: 'other' },
      ],
    },
    placeholder: 'Select',
    validate: {
      required: true,
    },
  },
}

/**
 * Helper function to get a field template
 */
export function getFieldTemplate(fieldName: keyof typeof formioFieldTemplates) {
  return formioFieldTemplates[fieldName]
}

/**
 * Helper function to create a complete form schema with common fields
 */
export function createApplicantDetailsSchema() {
  return {
    display: 'form',
    components: [
      {
        type: 'columns',
        columns: [
          {
            size: 6,
            components: [
              formioFieldTemplates.firstName,
              formioFieldTemplates.lastName,
              formioFieldTemplates.dateOfBirth,
              formioFieldTemplates.ssn,
              formioFieldTemplates.email,
              formioFieldTemplates.addressLine1,
              formioFieldTemplates.addressLine2,
              formioFieldTemplates.zipCode,
            ],
          },
          {
            size: 6,
            components: [
              {
                label: 'Middle Name',
                key: 'middleName',
                type: 'textfield',
                input: true,
                required: false,
                placeholder: 'Optional',
              },
              formioFieldTemplates.suffix,
              formioFieldTemplates.gender,
              formioFieldTemplates.citizenshipStatus,
              formioFieldTemplates.city,
              formioFieldTemplates.state,
            ],
          },
        ],
      },
    ],
  }
}
