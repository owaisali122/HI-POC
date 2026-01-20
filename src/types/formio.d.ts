// Type declarations for formiojs and @formio/react
declare module 'formiojs/Formio' {
  export const Formio: {
    createForm: (element: HTMLElement, schema: object, options?: object) => Promise<any>
    FormBuilder: any
    Form: any
  }
}

declare module 'formiojs' {
  export const Formio: {
    createForm: (element: HTMLElement, schema: object, options?: object) => Promise<any>
    FormBuilder: any
    Form: any
  }
  export const FormBuilder: any
  export const Form: any
}

// @formio/react types are provided by the package itself
// These declarations are kept for backward compatibility if needed
declare module '@formio/react' {
  export { FormBuilder } from '@formio/react'
  export { Form } from '@formio/react'
}
