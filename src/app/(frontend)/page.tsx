import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function HomePage() {
  const payload = await getPayload({ config })

  // Fetch published forms count
  const { totalDocs: formsCount } = await payload.find({
    collection: 'forms',
    where: { status: { equals: 'published' } },
    limit: 0,
  })

  return (
    <div className="home-page">
      <style>{`
        .home-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }
        
        /* Hero Section */
        .hero {
          padding: 6rem 2rem;
          text-align: center;
        }
        
        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .hero-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 9999px;
          color: #60a5fa;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
        }
        
        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          color: white;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }
        
        .hero-title span {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .hero-subtitle {
          font-size: 1.25rem;
          color: #94a3b8;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }
        
        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 0.75rem;
          text-decoration: none;
          transition: all 0.2s;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
        }
        
        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        
        .btn svg {
          width: 20px;
          height: 20px;
        }
        
        /* Features Section */
        .features {
          padding: 4rem 2rem;
          background: #0f172a;
        }
        
        .features-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .feature-card {
          background: linear-gradient(135deg, #1e293b, #334155);
          border-radius: 1rem;
          padding: 2rem;
          text-decoration: none;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .feature-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        
        .feature-icon svg {
          width: 28px;
          height: 28px;
          color: white;
        }
        
        .feature-icon.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .feature-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
        .feature-icon.green { background: linear-gradient(135deg, #10b981, #059669); }
        .feature-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); }
        
        .feature-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.75rem;
        }
        
        .feature-description {
          color: #94a3b8;
          line-height: 1.6;
        }
        
        .feature-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #3b82f6;
          font-weight: 600;
          margin-top: 1rem;
        }
        
        .feature-link svg {
          width: 16px;
          height: 16px;
          transition: transform 0.2s;
        }
        
        .feature-card:hover .feature-link svg {
          transform: translateX(4px);
        }
        
        /* Footer */
        .footer {
          padding: 3rem 2rem;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .footer-text {
          color: #64748b;
        }
        
        .footer-text a {
          color: #3b82f6;
          text-decoration: none;
        }
      `}</style>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">
            ✨ {formsCount} Forms Available
          </span>
          <h1 className="hero-title">
            Build Dynamic Forms with <span>Form.io</span>
          </h1>
          <p className="hero-subtitle">
            Create, manage, and deploy beautiful forms in minutes. 
            Design once in the admin panel, use anywhere on your site.
          </p>
          <div className="hero-buttons">
            <Link href="/register" className="btn btn-primary">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Register Now
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-grid">
          <Link href="/register" className="feature-card">
            <div className="feature-icon blue">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="feature-title">User Registration</h3>
            <p className="feature-description">
              Create your account to access all features and manage your submissions.
            </p>
            <span className="feature-link">
              Get Started
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>

          <Link href="/contact" className="feature-card">
            <div className="feature-icon purple">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="feature-title">Contact Us</h3>
            <p className="feature-description">
              Have questions or feedback? Reach out to us and we'll respond promptly.
            </p>
            <span className="feature-link">
              Send Message
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>

          <Link href="/forms" className="feature-card">
            <div className="feature-icon green">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="feature-title">All Forms</h3>
            <p className="feature-description">
              Browse all available forms including surveys, feedback, and more.
            </p>
            <span className="feature-link">
              View Forms
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>

          <Link href="/admin" className="feature-card">
            <div className="feature-icon orange">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="feature-title">Admin Panel</h3>
            <p className="feature-description">
              Manage forms, view submissions, and configure your application.
            </p>
            <span className="feature-link">
              Go to Admin
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">
          Built with <a href="https://payloadcms.com" target="_blank" rel="noopener noreferrer">Payload CMS</a> and <a href="https://form.io" target="_blank" rel="noopener noreferrer">Form.io</a>
        </p>
      </footer>
    </div>
  )
}
