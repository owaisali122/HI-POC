import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FormStepper } from '@/components/FormStepper'

export const metadata = {
  title: 'Register',
  description: 'Create a new account',
}

export default async function RegisterPage() {
  const payload = await getPayload({ config })

  // Fetch the User Registration form
  const { docs } = await payload.find({
    collection: 'forms',
    where: {
      slug: { equals: 'user-registration' },
      status: { equals: 'published' },
    },
    limit: 1,
  })

  const form = docs[0]

  if (!form) {
    notFound()
  }

  const formSchema = form.schema as { display?: string; components: any[]; [key: string]: any }
  
  const steps = [
    {
      id: 'register',
      title: 'Create Your Account',
      description: 'Join us today and get started',
      schema: formSchema,
    },
  ]

  const successMessage = (form.settings as any)?.successMessage || 'Registration successful!'

  return (
    <div className="register-page">
      <style>{`
        .register-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #3b82f6 100%);
          padding: 4rem 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .register-container {
          max-width: 500px;
          width: 100%;
        }
        
        .register-card {
          background: white;
          border-radius: 1.5rem;
          padding: 2.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
        }
        
        .register-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .register-logo {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
        
        .register-logo svg {
          width: 32px;
          height: 32px;
          color: white;
        }
        
        .register-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }
        
        .register-subtitle {
          color: #64748b;
        }
        
        .register-footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }
        
        .register-footer p {
          color: #64748b;
        }
        
        .register-footer a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
        }
        
        .register-footer a:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <div className="register-logo">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="register-title">Create Account</h1>
            <p className="register-subtitle">Join us to get started</p>
          </div>

          <FormStepper
            steps={steps}
            formId={String(form.id)}
            successMessage={successMessage}
          />

          <div className="register-footer">
            <p>Already have an account? <Link href="/admin">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
