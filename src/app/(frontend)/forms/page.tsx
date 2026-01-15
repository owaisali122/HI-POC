import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'

export const metadata = {
  title: 'Forms',
  description: 'Available forms',
}

export default async function FormsListPage() {
  const payload = await getPayload({ config })

  const { docs: forms } = await payload.find({
    collection: 'forms',
    where: {
      status: { equals: 'published' },
    },
    sort: '-createdAt',
  })

  return (
    <div className="forms-page">
      <style>{`
        .forms-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 4rem 2rem;
        }
        
        .forms-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .forms-header {
          text-align: center;
          margin-bottom: 4rem;
        }
        
        .forms-title {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #1e293b, #475569);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
        }
        
        .forms-subtitle {
          font-size: 1.25rem;
          color: #64748b;
        }
        
        .forms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }
        
        .form-card {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s, box-shadow 0.2s;
          text-decoration: none;
          display: block;
        }
        
        .form-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
        }
        
        .form-card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.75rem;
        }
        
        .form-card-description {
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        
        .form-card-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #3b82f6;
        }
        
        .form-card-cta svg {
          width: 20px;
          height: 20px;
          transition: transform 0.2s;
        }
        
        .form-card:hover .form-card-cta svg {
          transform: translateX(4px);
        }
        
        .no-forms {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 1rem;
          color: #64748b;
        }
        
        .no-forms-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
      `}</style>

      <div className="forms-container">
        <div className="forms-header">
          <h1 className="forms-title">Available Forms</h1>
          <p className="forms-subtitle">Select a form to fill out</p>
        </div>

        {forms.length > 0 ? (
          <div className="forms-grid">
            {forms.map((form) => (
              <Link
                key={form.id}
                href={`/forms/${form.slug}`}
                className="form-card"
              >
                <h2 className="form-card-title">{form.title}</h2>
                {form.description && (
                  <p className="form-card-description">{form.description}</p>
                )}
                <span className="form-card-cta">
                  Fill out form
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-forms">
            <div className="no-forms-icon">📋</div>
            <p>No forms available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
