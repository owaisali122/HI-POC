import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import type { Form } from '../src/payload-types'

/**
 * Seed script to populate database with sample FormIO forms
 * Run with: pnpm seed:forms
 */

const sampleForms: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Employee Feedback Form',
    slug: 'employee-feedback',
    description: 'Collect feedback from employees about their work experience and satisfaction',
    status: 'published',
    schema: {
      display: 'form',
      components: [
        {
          type: 'textfield',
          label: 'Employee Name',
          key: 'employeeName',
          input: true,
          required: true,
          placeholder: 'Enter your full name',
          validate: {
            required: true,
            minLength: 2,
            maxLength: 100,
            pattern: "^[a-zA-Z\\s'-]+$",
            customMessage: 'Name must be at least 2 characters and contain only letters, spaces, hyphens, and apostrophes',
          },
        },
        {
          type: 'email',
          label: 'Email Address',
          key: 'email',
          input: true,
          required: true,
          placeholder: 'employee@company.com',
          validate: {
            required: true,
          },
        },
        {
          type: 'select',
          label: 'Department',
          key: 'department',
          input: true,
          required: true,
          placeholder: 'Select your department',
          data: {
            values: [
              { label: 'Select Department', value: '' },
              { label: 'Human Resources', value: 'hr' },
              { label: 'Engineering', value: 'engineering' },
              { label: 'Sales', value: 'sales' },
              { label: 'Marketing', value: 'marketing' },
              { label: 'Finance', value: 'finance' },
              { label: 'Operations', value: 'operations' },
              { label: 'Customer Support', value: 'customer_support' },
              { label: 'Legal', value: 'legal' },
              { label: 'Other', value: 'other' },
            ],
          },
          validate: {
            required: true,
          },
        },
        {
          type: 'select',
          label: 'Overall Satisfaction',
          key: 'overallSatisfaction',
          input: true,
          required: true,
          placeholder: 'Select your satisfaction level',
          data: {
            values: [
              { label: 'Select Satisfaction Level', value: '' },
              { label: 'Very Satisfied', value: 'very_satisfied' },
              { label: 'Satisfied', value: 'satisfied' },
              { label: 'Neutral', value: 'neutral' },
              { label: 'Dissatisfied', value: 'dissatisfied' },
              { label: 'Very Dissatisfied', value: 'very_dissatisfied' },
            ],
          },
          validate: {
            required: true,
          },
        },
        {
          type: 'selectboxes',
          label: 'Would you recommend our company?',
          key: 'recommendCompany',
          input: true,
          required: true,
          values: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
            { label: 'Maybe', value: 'maybe' },
          ],
          validate: {
            required: true,
          },
        },
        {
          type: 'textarea',
          label: 'Additional Comments',
          key: 'additionalComments',
          input: true,
          required: false,
          rows: 4,
          placeholder: 'Please share any additional feedback or suggestions...',
          validate: {
            maxLength: 1000,
          },
        },
      ],
    },
    settings: {
      submitButtonText: 'Submit Feedback',
      successMessage: 'Thank you for your feedback! We appreciate your input.',
      allowMultipleSubmissions: true,
    },
  },
  {
    title: 'Contact Us Form',
    slug: 'contact-us',
    description: 'General contact form for customer inquiries and support requests',
    status: 'published',
    schema: {
      display: 'form',
      components: [
        {
          type: 'columns',
          columns: [
            {
              size: 6,
              components: [
                {
                  type: 'textfield',
                  label: 'First Name',
                  key: 'firstName',
                  input: true,
                  required: true,
                  placeholder: 'John',
                  validate: {
                    required: true,
                    minLength: 2,
                    maxLength: 50,
                    pattern: "^[a-zA-Z\\s'-]+$",
                  },
                },
              ],
            },
            {
              size: 6,
              components: [
                {
                  type: 'textfield',
                  label: 'Last Name',
                  key: 'lastName',
                  input: true,
                  required: true,
                  placeholder: 'Doe',
                  validate: {
                    required: true,
                    minLength: 2,
                    maxLength: 50,
                    pattern: "^[a-zA-Z\\s'-]+$",
                  },
                },
              ],
            },
          ],
        },
        {
          type: 'email',
          label: 'Email Address',
          key: 'email',
          input: true,
          required: true,
          placeholder: 'john.doe@example.com',
          validate: {
            required: true,
          },
        },
        {
          type: 'phoneNumber',
          label: 'Phone Number',
          key: 'phone',
          input: true,
          required: false,
          placeholder: '(555) 123-4567',
          inputMask: '(999) 999-9999',
          validate: {
            pattern: '^\\(\\d{3}\\)\\s\\d{3}-\\d{4}$',
            customMessage: 'Please enter a valid phone number in format (555) 123-4567',
          },
        },
        {
          type: 'select',
          label: 'Inquiry Type',
          key: 'inquiryType',
          input: true,
          required: true,
          placeholder: 'Select inquiry type',
          data: {
            values: [
              { label: 'Select Inquiry Type', value: '' },
              { label: 'General Question', value: 'general' },
              { label: 'Product Support', value: 'support' },
              { label: 'Sales Inquiry', value: 'sales' },
              { label: 'Technical Issue', value: 'technical' },
              { label: 'Billing Question', value: 'billing' },
              { label: 'Partnership Opportunity', value: 'partnership' },
              { label: 'Other', value: 'other' },
            ],
          },
          validate: {
            required: true,
          },
        },
        {
          type: 'select',
          label: 'Priority',
          key: 'priority',
          input: true,
          required: true,
          placeholder: 'Select priority',
          data: {
            values: [
              { label: 'Select Priority', value: '' },
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' },
              { label: 'Urgent', value: 'urgent' },
            ],
          },
          validate: {
            required: true,
          },
        },
        {
          type: 'textarea',
          label: 'Message',
          key: 'message',
          input: true,
          required: true,
          rows: 6,
          placeholder: 'Please provide details about your inquiry...',
          validate: {
            required: true,
            minLength: 10,
            maxLength: 2000,
            customMessage: 'Message must be between 10 and 2000 characters',
          },
        },
      ],
    },
    settings: {
      submitButtonText: 'Send Message',
      successMessage: 'Thank you for contacting us! We will get back to you soon.',
      allowMultipleSubmissions: true,
    },
  },
  {
    title: 'Job Application Form',
    slug: 'job-application',
    description: 'Online job application form for prospective candidates',
    status: 'published',
    schema: {
      display: 'form',
      components: [
        {
          type: 'textfield',
          label: 'Full Name',
          key: 'fullName',
          input: true,
          required: true,
          placeholder: 'Enter your full name',
          validate: {
            required: true,
            minLength: 2,
            maxLength: 100,
          },
        },
        {
          type: 'email',
          label: 'Email Address',
          key: 'email',
          input: true,
          required: true,
          placeholder: 'candidate@example.com',
          validate: {
            required: true,
          },
        },
        {
          type: 'phoneNumber',
          label: 'Phone Number',
          key: 'phone',
          input: true,
          required: true,
          placeholder: '(555) 123-4567',
          inputMask: '(999) 999-9999',
          validate: {
            required: true,
            pattern: '^\\(\\d{3}\\)\\s\\d{3}-\\d{4}$',
          },
        },
        {
          type: 'select',
          label: 'Position Applied For',
          key: 'position',
          input: true,
          required: true,
          placeholder: 'Select position',
          data: {
            values: [
              { label: 'Select Position', value: '' },
              { label: 'Software Engineer', value: 'software_engineer' },
              { label: 'Senior Software Engineer', value: 'senior_software_engineer' },
              { label: 'Product Manager', value: 'product_manager' },
              { label: 'UX Designer', value: 'ux_designer' },
              { label: 'Data Scientist', value: 'data_scientist' },
              { label: 'DevOps Engineer', value: 'devops_engineer' },
              { label: 'Marketing Manager', value: 'marketing_manager' },
              { label: 'Sales Representative', value: 'sales_rep' },
              { label: 'Customer Success Manager', value: 'customer_success' },
            ],
          },
          validate: {
            required: true,
          },
        },
        {
          type: 'select',
          label: 'Years of Experience',
          key: 'experience',
          input: true,
          required: true,
          placeholder: 'Select experience level',
          data: {
            values: [
              { label: 'Select Experience', value: '' },
              { label: 'Entry Level (0-2 years)', value: 'entry' },
              { label: 'Mid Level (3-5 years)', value: 'mid' },
              { label: 'Senior Level (6-10 years)', value: 'senior' },
              { label: 'Executive Level (10+ years)', value: 'executive' },
            ],
          },
          validate: {
            required: true,
          },
        },
        {
          type: 'select',
          label: 'Education Level',
          key: 'education',
          input: true,
          required: true,
          placeholder: 'Select education level',
          data: {
            values: [
              { label: 'Select Education', value: '' },
              { label: 'High School Diploma', value: 'high_school' },
              { label: 'Associate Degree', value: 'associate' },
              { label: "Bachelor's Degree", value: 'bachelor' },
              { label: "Master's Degree", value: 'master' },
              { label: 'Doctorate', value: 'doctorate' },
              { label: 'Other', value: 'other' },
            ],
          },
          validate: {
            required: true,
          },
        },
        {
          type: 'radio',
          label: 'Work Authorization',
          key: 'workAuthorization',
          input: true,
          required: true,
          values: [
            { label: 'Authorized to work in the US', value: 'authorized' },
            { label: 'Will require sponsorship', value: 'sponsorship' },
            { label: 'Not authorized', value: 'not_authorized' },
          ],
          validate: {
            required: true,
          },
        },
        {
          type: 'textarea',
          label: 'Cover Letter',
          key: 'coverLetter',
          input: true,
          required: true,
          rows: 8,
          placeholder: 'Tell us why you are interested in this position...',
          validate: {
            required: true,
            minLength: 50,
            maxLength: 2000,
            customMessage: 'Cover letter must be between 50 and 2000 characters',
          },
        },
        {
          type: 'textfield',
          label: 'LinkedIn Profile (Optional)',
          key: 'linkedin',
          input: true,
          required: false,
          placeholder: 'https://linkedin.com/in/yourprofile',
          validate: {
            pattern: '^https?://(www\\.)?linkedin\\.com/.*',
            customMessage: 'Please enter a valid LinkedIn URL',
          },
        },
      ],
    },
    settings: {
      submitButtonText: 'Submit Application',
      successMessage: 'Thank you for your application! We will review it and get back to you soon.',
      allowMultipleSubmissions: false,
    },
  },
  {
    title: 'Customer Satisfaction Survey',
    slug: 'customer-satisfaction-survey',
    description: 'Survey to measure customer satisfaction and gather feedback on products and services',
    status: 'published',
    schema: {
      display: 'form',
      components: [
        {
          type: 'textfield',
          label: 'Customer Name',
          key: 'customerName',
          input: true,
          required: true,
          placeholder: 'Enter your name',
          validate: {
            required: true,
            minLength: 2,
            maxLength: 100,
          },
        },
        {
          type: 'email',
          label: 'Email Address',
          key: 'email',
          input: true,
          required: true,
          placeholder: 'customer@example.com',
          validate: {
            required: true,
          },
        },
        {
          type: 'select',
          label: 'Product/Service Used',
          key: 'productService',
          input: true,
          required: true,
          placeholder: 'Select product or service',
          data: {
            values: [
              { label: 'Select Product/Service', value: '' },
              { label: 'Product A', value: 'product_a' },
              { label: 'Product B', value: 'product_b' },
              { label: 'Product C', value: 'product_c' },
              { label: 'Service X', value: 'service_x' },
              { label: 'Service Y', value: 'service_y' },
              { label: 'Service Z', value: 'service_z' },
              { label: 'Multiple Products/Services', value: 'multiple' },
            ],
          },
          validate: {
            required: true,
          },
        },
        {
          type: 'select',
          label: 'How satisfied are you with our product/service?',
          key: 'productSatisfaction',
          input: true,
          required: true,
          placeholder: 'Select satisfaction level',
          data: {
            values: [
              { label: 'Select Satisfaction', value: '' },
              { label: 'Extremely Satisfied', value: 'extremely_satisfied' },
              { label: 'Very Satisfied', value: 'very_satisfied' },
              { label: 'Satisfied', value: 'satisfied' },
              { label: 'Somewhat Satisfied', value: 'somewhat_satisfied' },
              { label: 'Not Satisfied', value: 'not_satisfied' },
            ],
          },
          validate: {
            required: true,
          },
        },
        {
          type: 'select',
          label: 'How likely are you to recommend us to others?',
          key: 'recommendationLikelihood',
          input: true,
          required: true,
          placeholder: 'Select likelihood',
          data: {
            values: [
              { label: 'Select Likelihood', value: '' },
              { label: 'Extremely Likely (10)', value: '10' },
              { label: 'Very Likely (9)', value: '9' },
              { label: 'Likely (8)', value: '8' },
              { label: 'Somewhat Likely (7)', value: '7' },
              { label: 'Neutral (6)', value: '6' },
              { label: 'Somewhat Unlikely (5)', value: '5' },
              { label: 'Unlikely (4)', value: '4' },
              { label: 'Very Unlikely (3)', value: '3' },
              { label: 'Extremely Unlikely (2)', value: '2' },
              { label: 'Not at all (1)', value: '1' },
            ],
          },
          validate: {
            required: true,
          },
        },
        {
          type: 'selectboxes',
          label: 'What features do you value most? (Select all that apply)',
          key: 'valuedFeatures',
          input: true,
          required: false,
          values: [
            { label: 'Ease of Use', value: 'ease_of_use' },
            { label: 'Performance', value: 'performance' },
            { label: 'Customer Support', value: 'customer_support' },
            { label: 'Price/Value', value: 'price_value' },
            { label: 'Reliability', value: 'reliability' },
            { label: 'Innovation', value: 'innovation' },
            { label: 'Security', value: 'security' },
          ],
        },
        {
          type: 'radio',
          label: 'How often do you use our product/service?',
          key: 'usageFrequency',
          input: true,
          required: true,
          values: [
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Rarely', value: 'rarely' },
            { label: 'First Time', value: 'first_time' },
          ],
          validate: {
            required: true,
          },
        },
        {
          type: 'textarea',
          label: 'What can we improve?',
          key: 'improvements',
          input: true,
          required: false,
          rows: 5,
          placeholder: 'Please share your suggestions for improvement...',
          validate: {
            maxLength: 1000,
          },
        },
        {
          type: 'textarea',
          label: 'Additional Comments',
          key: 'additionalComments',
          input: true,
          required: false,
          rows: 4,
          placeholder: 'Any other feedback or comments...',
          validate: {
            maxLength: 1000,
          },
        },
      ],
    },
    settings: {
      submitButtonText: 'Submit Survey',
      successMessage: 'Thank you for taking the time to complete our survey! Your feedback is valuable to us.',
      allowMultipleSubmissions: true,
    },
  },
  {
    title: 'Personal Information',
    slug: 'personal-information',
    description: 'Collect personal and contact information from applicants',
    status: 'published',
    schema: {
      display: 'form',
      components: [
        {
          type: 'columns',
          columns: [
            {
              size: 6,
              components: [
                {
                  type: 'textfield',
                  label: 'First Name',
                  key: 'firstName',
                  input: true,
                  required: true,
                  placeholder: 'Enter first name',
                  validate: {
                    required: true,
                    minLength: 2,
                    maxLength: 50,
                    pattern: "^[a-zA-Z\\s'-]+$",
                    customMessage: 'First name must be at least 2 characters and contain only letters',
                  },
                },
              ],
            },
            {
              size: 6,
              components: [
                {
                  type: 'textfield',
                  label: 'Last Name',
                  key: 'lastName',
                  input: true,
                  required: true,
                  placeholder: 'Enter last name',
                  validate: {
                    required: true,
                    minLength: 2,
                    maxLength: 50,
                    pattern: "^[a-zA-Z\\s'-]+$",
                    customMessage: 'Last name must be at least 2 characters and contain only letters',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 'columns',
          columns: [
            {
              size: 6,
              components: [
                {
                  type: 'textfield',
                  label: 'Middle Name',
                  key: 'middleName',
                  input: true,
                  required: false,
                  placeholder: 'Optional',
                  validate: {
                    maxLength: 50,
                    pattern: "^[a-zA-Z\\s'-]*$",
                  },
                },
              ],
            },
            {
              size: 6,
              components: [
                {
                  type: 'select',
                  label: 'Suffix',
                  key: 'suffix',
                  input: true,
                  required: false,
                  placeholder: 'Select',
                  data: {
                    values: [
                      { label: 'Select', value: '' },
                      { label: 'Jr.', value: 'jr' },
                      { label: 'Sr.', value: 'sr' },
                      { label: 'II', value: 'ii' },
                      { label: 'III', value: 'iii' },
                      { label: 'IV', value: 'iv' },
                      { label: 'V', value: 'v' },
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          type: 'datetime',
          label: 'Date of Birth',
          key: 'dateOfBirth',
          input: true,
          required: true,
          placeholder: 'mm/dd/yyyy',
          widget: {
            type: 'calendar',
            dateFormat: 'MM/DD/YYYY',
            saveAs: 'date',
          },
          validate: {
            required: true,
          },
        },
        {
          type: 'select',
          label: 'Gender',
          key: 'gender',
          input: true,
          required: true,
          placeholder: 'Select',
          data: {
            values: [
              { label: 'Select', value: '' },
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' },
              { label: 'Prefer not to say', value: 'prefer_not_to_say' },
            ],
          },
          validate: {
            required: true,
          },
        },
        {
          type: 'textfield',
          label: 'Social Security number (SSN)',
          key: 'ssn',
          input: true,
          required: false,
          placeholder: 'XXX-XX-XXXX',
          inputMask: '999-99-9999',
          validate: {
            pattern: '^\\d{3}-\\d{2}-\\d{4}$',
            customMessage: 'Please enter a valid SSN in format XXX-XX-XXXX',
          },
        },
        {
          type: 'select',
          label: 'Are you a US Citizen or Permanent Resident?',
          key: 'citizenshipStatus',
          input: true,
          required: true,
          placeholder: 'Select',
          data: {
            values: [
              { label: 'Select', value: '' },
              { label: 'US Citizen', value: 'us_citizen' },
              { label: 'Permanent Resident', value: 'permanent_resident' },
              { label: 'Neither', value: 'neither' },
            ],
          },
          validate: {
            required: true,
          },
        },
        {
          type: 'email',
          label: 'Email Address',
          key: 'email',
          input: true,
          required: true,
          placeholder: 'email@example.com',
          validate: {
            required: true,
          },
        },
        {
          type: 'textfield',
          label: 'Address Line 1',
          key: 'addressLine1',
          input: true,
          required: true,
          placeholder: 'Address',
          validate: {
            required: true,
            minLength: 5,
            maxLength: 100,
          },
        },
        {
          type: 'textfield',
          label: 'Apartment or Suite Number',
          key: 'apartmentSuite',
          input: true,
          required: false,
          placeholder: 'Optional',
          validate: {
            maxLength: 20,
          },
        },
        {
          type: 'columns',
          columns: [
            {
              size: 6,
              components: [
                {
                  type: 'textfield',
                  label: 'City',
                  key: 'city',
                  input: true,
                  required: true,
                  placeholder: 'City',
                  validate: {
                    required: true,
                    minLength: 2,
                    maxLength: 50,
                    pattern: "^[a-zA-Z\\s'-]+$",
                    customMessage: 'City must be at least 2 characters',
                  },
                },
              ],
            },
            {
              size: 3,
              components: [
                {
                  type: 'select',
                  label: 'State',
                  key: 'state',
                  input: true,
                  required: true,
                  placeholder: 'Select',
                  data: {
                    values: [
                      { label: 'Select', value: '' },
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
                    ],
                  },
                  defaultValue: 'HI',
                  validate: {
                    required: true,
                  },
                },
              ],
            },
            {
              size: 3,
              components: [
                {
                  type: 'textfield',
                  label: 'Zip Code',
                  key: 'zipCode',
                  input: true,
                  required: true,
                  placeholder: 'Zip',
                  inputMask: '99999',
                  validate: {
                    required: true,
                    pattern: '^\\d{5}(-\\d{4})?$',
                    customMessage: 'Please enter a valid 5 or 9 digit zip code',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    settings: {
      submitButtonText: 'Next',
      successMessage: 'Your personal information has been saved successfully.',
      allowMultipleSubmissions: false,
    },
  },
  {
    title: 'Contact Details',
    slug: 'contact-detail',
    description: 'Collect contact information including phone and fax numbers',
    status: 'published',
    schema: {
      display: 'form',
      components: [
        {
          type: 'columns',
          columns: [
            {
              size: 6,
              components: [
                {
                  type: 'phoneNumber',
                  label: 'Work Phone Number',
                  key: 'workPhone',
                  input: true,
                  required: true,
                  placeholder: 'XXX-XXX-XXXX',
                  inputMask: '(999) 999-9999',
                  validate: {
                    required: true,
                    pattern: '^\\(\\d{3}\\)\\s\\d{3}-\\d{4}$',
                    customMessage: 'Please enter a valid work phone number in format (XXX) XXX-XXXX',
                  },
                },
              ],
            },
            {
              size: 6,
              components: [
                {
                  type: 'phoneNumber',
                  label: 'Work Fax Number',
                  key: 'workFax',
                  input: true,
                  required: false,
                  placeholder: 'XXX-XXX-XXXX',
                  inputMask: '(999) 999-9999',
                  validate: {
                    pattern: '^\\(\\d{3}\\)\\s\\d{3}-\\d{4}$',
                    customMessage: 'Please enter a valid fax number in format (XXX) XXX-XXXX',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 'columns',
          columns: [
            {
              size: 6,
              components: [
                {
                  type: 'phoneNumber',
                  label: 'Home Phone Number',
                  key: 'homePhone',
                  input: true,
                  required: false,
                  placeholder: 'XXX-XXX-XXXX',
                  inputMask: '(999) 999-9999',
                  validate: {
                    pattern: '^\\(\\d{3}\\)\\s\\d{3}-\\d{4}$',
                    customMessage: 'Please enter a valid home phone number in format (XXX) XXX-XXXX',
                  },
                },
              ],
            },
            {
              size: 6,
              components: [
                {
                  type: 'phoneNumber',
                  label: 'Cell Number',
                  key: 'cellNumber',
                  input: true,
                  required: false,
                  placeholder: 'XXX-XXX-XXXX',
                  inputMask: '(999) 999-9999',
                  validate: {
                    pattern: '^\\(\\d{3}\\)\\s\\d{3}-\\d{4}$',
                    customMessage: 'Please enter a valid cell number in format (XXX) XXX-XXXX',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    settings: {
      submitButtonText: 'Next',
      successMessage: 'Your contact details have been saved successfully.',
      allowMultipleSubmissions: false,
    },
  },
  {
    title: 'DHS Application Counselor Commitment',
    slug: 'dhs-application-counselor-commitment',
    description: 'Commitment agreement form for DHS Application Counselors',
    status: 'published',
    schema: {
      display: 'form',
      components: [
        {
          type: 'content',
          label: 'Commitment',
          key: 'commitmentTitle',
          input: false,
          html: '<h2>Commitment</h2><p>Please agree to the following:</p>',
        },
        {
          type: 'checkbox',
          label: 'I commit to full participation in required initial and on-going training',
          key: 'commitmentTraining',
          input: true,
          required: true,
          validate: {
            required: true,
          },
        },
        {
          type: 'checkbox',
          label: 'I will not provide financial incentives (such as rebates or giveaways) to potential health coverage consumers',
          key: 'commitmentNoIncentives',
          input: true,
          required: true,
          validate: {
            required: true,
          },
        },
        {
          type: 'checkbox',
          label: 'I agree to put consumer safety first',
          key: 'commitmentConsumerSafety',
          input: true,
          required: true,
          validate: {
            required: true,
          },
        },
        {
          type: 'checkbox',
          label: 'I agree to a criminal background check in accordance with State and Federal rules',
          key: 'commitmentBackgroundCheck',
          input: true,
          required: true,
          validate: {
            required: true,
          },
        },
      ],
    },
    settings: {
      submitButtonText: 'Next',
      successMessage: 'Your commitment has been recorded successfully.',
      allowMultipleSubmissions: false,
    },
  },
]

async function seedForms() {
  try {
    console.log('🚀 Starting form seed...')

    const payload = await getPayload({ config })

    // Get existing forms to check for duplicates
    const existingForms = await payload.find({
      collection: 'forms',
      limit: 100,
      where: {
        slug: {
          in: sampleForms.map((f) => f.slug),
        },
      },
    })

    const existingSlugs = new Set(existingForms.docs.map((f) => f.slug))
    const newForms = sampleForms.filter((f) => !existingSlugs.has(f.slug))
    const updateForms = sampleForms.filter((f) => existingSlugs.has(f.slug))

    if (existingForms.totalDocs > 0) {
      console.log(`📋 Found ${existingForms.totalDocs} existing form(s) with matching slugs.`)
    }

    // Update existing forms
    if (updateForms.length > 0) {
      console.log(`🔄 Updating ${updateForms.length} existing form(s)...`)
      for (const formData of updateForms) {
        try {
          const existing = existingForms.docs.find((f) => f.slug === formData.slug)
          if (existing) {
            const form = await payload.update({
              collection: 'forms',
              id: existing.id,
              data: formData,
            })
            console.log(`✅ Updated form: "${form.title}" (slug: ${form.slug})`)
          }
        } catch (error) {
          console.error(`❌ Error updating form "${formData.title}":`, error)
        }
      }
    }

    // Create new forms
    if (newForms.length > 0) {
      console.log(`📝 Creating ${newForms.length} new form(s)...`)
      for (const formData of newForms) {
        try {
          const form = await payload.create({
            collection: 'forms',
            data: formData,
          })
          console.log(`✅ Created form: "${form.title}" (slug: ${form.slug})`)
        } catch (error) {
          console.error(`❌ Error creating form "${formData.title}":`, error)
        }
      }
    } else if (updateForms.length === 0) {
      console.log('ℹ️  All forms already exist. No changes needed.')
    }

    const finalCount = await payload.find({
      collection: 'forms',
      limit: 100,
    })

    console.log('✨ Form seed completed successfully!')
    console.log(`📊 Total forms in database: ${finalCount.totalDocs}`)
    console.log(`   - Updated: ${updateForms.length}`)
    console.log(`   - Created: ${newForms.length}`)
  } catch (error) {
    console.error('❌ Error during seed:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

// Run the seed function
seedForms()
