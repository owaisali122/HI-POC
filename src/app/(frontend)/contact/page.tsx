import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FormStepper } from '@/components/FormStepper'

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with us',
}

export default async function ContactPage() {
  const payload = await getPayload({ config })

  // Fetch the Contact Us form
  const { docs } = await payload.find({
    collection: 'forms',
    where: {
      slug: { equals: 'contact-us' },
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
      id: 'contact',
      title: 'Contact Us',
      description: 'We\'d love to hear from you. Send us a message!',
      schema: formSchema,
    },
  ]

  const successMessage = (form.settings as any)?.successMessage || 'Thank you for your message!'

  return (
    <div className="contact-page">
      <style>{`
        .contact-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          padding: 4rem 2rem;
        }
        
        .contact-container {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .contact-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .contact-title {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
        }
        
        .contact-subtitle {
          font-size: 1.25rem;
          color: #94a3b8;
        }
        
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          text-decoration: none;
          font-weight: 500;
          margin-bottom: 2rem;
          transition: color 0.2s;
        }
        
        .back-link:hover {
          color: #3b82f6;
        }
        
        .back-link svg {
          width: 20px;
          height: 20px;
        }
        
        .form-card {
          background: white;
          border-radius: 1.5rem;
          padding: 2.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
      `}</style>

      <div className="contact-container">
        <Link href="/" className="back-link">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <div className="contact-header">
          <h1 className="contact-title">Get In Touch</h1>
          <p className="contact-subtitle">Have a question or feedback? We're here to help.</p>
        </div>

        <div className="form-card">
          <FormStepper
            steps={steps}
            formId={String(form.id)}
            successMessage={successMessage}
          />
        </div>
      </div>
    </div>
  )
}
