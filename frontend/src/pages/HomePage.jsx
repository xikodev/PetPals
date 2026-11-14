import { Link, useOutletContext } from 'react-router-dom'
import './HomePage.css'

const services = [
  { icon: 'fa-house', title: 'Pet sitting', text: 'Care and company for your pet while you’re away.' },
  { icon: 'fa-dog', title: 'Dog walking', text: 'Help keeping up with your dog’s daily walks.' },
  { icon: 'fa-bowl-food', title: 'Feeding visits', text: 'Someone to stop by for meals and a check-in.' },
]

export default function HomePage() {
  const { status } = useOutletContext()

  return (
    <div className="home-page">
      <section className="home-intro" aria-labelledby="home-title">
        <h1 id="home-title">Pet care, close to home.</h1>
        <p className="home-description">
          PetPals connects pet owners with local helpers for sitting, walks, and feeding visits.
          Whether you need care or want to offer it, this is where you’ll get started.
        </p>
        <div className="home-actions">
          {status === 'authenticated' ? (
            <Link className="primary-link" to="/profile">My profile</Link>
          ) : (
            <Link className="primary-link" to="/login">
              <i className="fa-brands fa-google" aria-hidden="true" />
              <span>Sign in with Google</span>
            </Link>
          )}
        </div>
        <p className="preview-note">Existing members can sign in and edit their profile.</p>
      </section>

      <section className="home-services" aria-labelledby="services-title">
        <div className="section-heading">
          <h2 id="services-title">Care you’ll be able to find</h2>
        </div>
        <div className="service-grid">
          {services.map(service => (
            <article className="service-item" key={service.title}>
              <i className={`fa-solid ${service.icon} service-icon`} aria-hidden="true" />
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="how-section" aria-labelledby="how-title">
        <h2 id="how-title">How bookings will work</h2>
        <ol className="care-steps">
          <li><h3>Find a helper</h3><p>Compare nearby services, availability, and rates.</p></li>
          <li><h3>Request care</h3><p>Choose your pet and dates, then agree on the details with your helper.</p></li>
          <li><h3>Confirm and review</h3><p>Both of you confirm the start and finish. Leave a review when the booking is complete.</p></li>
        </ol>
      </section>
    </div>
  )
}
