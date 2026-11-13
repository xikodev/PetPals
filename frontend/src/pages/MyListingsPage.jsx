import { useEffect, useState } from 'react'
import { getMyListings } from '../api/listings.js'
import './MyListingsPage.css'

const STATUS_LABELS = {
  draft: 'Draft',
  published: 'Published',
  removed: 'Removed',
}

export default function MyListingsPage() {
  const [status, setStatus] = useState('loading')
  const [listings, setListings] = useState([])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await getMyListings()
        if (!active) return
        setListings(data)
        setStatus('ready')
      } catch {
        if (active) setStatus('error')
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  if (status === 'loading') return <p>Loading your listings…</p>
  if (status === 'error') {
    return <p role="alert">Could not load your listings. Please try again later.</p>
  }

  return (
    <section className="listings-page">
      <h1>My listings</h1>

      {listings.length === 0 ? (
        <p className="listings-empty">You have no listings yet.</p>
      ) : (
        <ul className="listings-list">
          {listings.map((listing) => (
            <li key={listing.id} className="listing-card">
              <h2>{listing.service_type}</h2>
              <p>{listing.description}</p>
              <p className="listing-meta">
                {listing.rate} per {listing.rate_unit} ·{' '}
                {STATUS_LABELS[listing.status] ?? listing.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
