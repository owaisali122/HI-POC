import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FormStepper } from '@/components/FormStepper'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'forms',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
  })

  const form = docs[0]

  if (!form) {
    return { title: 'Form Not Found' }
  }

  return {
    title: form.title,
    description: form.description || `Fill out the ${form.title} form`,
  }
}

export default async function FormPage({ params }: PageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'forms',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
  })

  const form = docs[0]

  if (!form) {
    notFound()
  }

  // Prepare steps - for now, treat the whole form as a single step
  // In the future, you could split components into multiple steps
  const formSchema = form.schema as { display?: string; components: any[]; [key: string]: any }
  
  const steps = [
    {
      id: 'main',
      title: form.title,
      description: form.description || undefined,
      schema: formSchema,
    },
  ]

  const successMessage = (form.settings as any)?.successMessage || 'Thank you for your submission!'

  return (
    <div className="form-page">
      <style>{`
        .form-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 2rem;
        }
        
        .form-page-container {
          max-width: 900px;
          margin: 0 auto;
        }
        
        .form-page-nav {
          margin-bottom: 2rem;
        }
        
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        
        .back-link:hover {
          color: #3b82f6;
        }
        
        .back-link svg {
          width: 20px;
          height: 20px;
        }
      `}</style>

      <div className="form-page-container">
        <nav className="form-page-nav">
          <Link href="/forms" className="back-link">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to forms
          </Link>
        </nav>

        <FormStepper
          steps={steps}
          formId={String(form.id)}
          successMessage={successMessage}
        />
      </div>
    </div>
  )
}
