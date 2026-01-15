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
