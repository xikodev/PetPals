-- PetPals initial PostgreSQL schema, based on database.md.
-- Creates 14 application tables and the three initial service categories.
-- Run once against an empty application schema; existing tables cause failure.
-- Requires permission to install btree_gist for concurrent booking protection.
-- All timestamps are timezone-aware; all prices are recorded in EUR.
-- This file does not configure authentication or connect to any database.
--
-- Backend responsibilities: Google token validation; role/ownership checks;
-- verification and suspension checks; availability/block checks; permitted
-- booking transitions; confirmation initiation by the helper and participant
-- identity checks; completed-booking review eligibility; dispute access;
-- preserving booking snapshots and preventing listing-helper reassignment.
-- Calendar credentials remain references to a separate secure credential store.

BEGIN;

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name TEXT NOT NULL CHECK (btrim(first_name) <> ''),
    last_name TEXT NOT NULL CHECK (btrim(last_name) <> ''),
    email TEXT NOT NULL CHECK (btrim(email) <> ''),
    photo_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('owner', 'helper', 'administrator')),
    google_subject TEXT NOT NULL UNIQUE CHECK (btrim(google_subject) <> ''),
    verification_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    reviewed_by INTEGER REFERENCES users(id) ON DELETE RESTRICT,
    reviewed_at TIMESTAMPTZ,
    suspended_until TIMESTAMPTZ,
    created_by INTEGER REFERENCES users(id) ON DELETE RESTRICT,
    calendar_id TEXT,
    calendar_credential_ref TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pets (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name TEXT NOT NULL CHECK (btrim(name) <> ''),
    species TEXT NOT NULL CHECK (btrim(species) <> ''),
    breed TEXT,
    birth_date DATE NOT NULL,
    care_notes TEXT,
    photo_url TEXT NOT NULL,
    -- Supports the booking constraint that the pet belongs to its owner.
    CONSTRAINT pets_id_owner_unique UNIQUE (id, owner_id)
);

CREATE TABLE service_types (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE CHECK (btrim(name) <> ''),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE service_listings (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    helper_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    service_type_id INTEGER NOT NULL REFERENCES service_types(id) ON DELETE RESTRICT,
    description TEXT NOT NULL CHECK (btrim(description) <> ''),
    rate DECIMAL(10,2) NOT NULL CHECK (rate >= 0 AND rate <> 'NaN'::numeric),
    rate_unit TEXT NOT NULL CHECK (rate_unit IN ('hour', 'day')),
    photo_url TEXT NOT NULL,
    latitude DECIMAL(9,6) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DECIMAL(9,6) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'removed'))
);

CREATE TABLE listing_availability (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES service_listings(id) ON DELETE RESTRICT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('available', 'blocked')),
    CONSTRAINT availability_valid_period CHECK (starts_at < ends_at)
);

CREATE TABLE bookings (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES service_listings(id) ON DELETE RESTRICT,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE RESTRICT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    request_message TEXT,
    street TEXT NOT NULL,
    house_number TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    city TEXT NOT NULL,
    country_code CHAR(2) NOT NULL CHECK (country_code ~ '^[A-Z]{2}$'),
    latitude DECIMAL(9,6) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DECIMAL(9,6) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    status TEXT NOT NULL DEFAULT 'requested'
        CHECK (status IN ('requested', 'accepted', 'declined', 'in_progress', 'completed')),
    agreed_rate DECIMAL(10,2) NOT NULL
        CHECK (agreed_rate >= 0 AND agreed_rate <> 'NaN'::numeric),
    agreed_rate_unit TEXT NOT NULL CHECK (agreed_rate_unit IN ('hour', 'day')),
    total_price DECIMAL(10,2) NOT NULL
        CHECK (total_price >= 0 AND total_price <> 'NaN'::numeric),
    service_description TEXT NOT NULL,
    pet_care_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    decided_at TIMESTAMPTZ,
    CONSTRAINT booking_valid_period CHECK (starts_at < ends_at),
    CONSTRAINT booking_pet_owner FOREIGN KEY (pet_id, owner_id)
        REFERENCES pets(id, owner_id) ON DELETE RESTRICT,
    -- Per listing, not per helper. Adjacent [start, end) bookings are allowed.
    -- Completed reservations retain their historical time slots.
    CONSTRAINT bookings_no_overlapping_reservations EXCLUDE USING gist (
        listing_id WITH =,
        tstzrange(starts_at, ends_at, '[)') WITH &&
    ) WHERE (status IN ('accepted', 'in_progress', 'completed'))
);

CREATE TABLE booking_confirmations (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    stage TEXT NOT NULL CHECK (stage IN ('start', 'complete')),
    method TEXT NOT NULL CHECK (method IN ('qr', 'button')),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'expired')),
    qr_token_hash TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    owner_confirmed_at TIMESTAMPTZ,
    helper_confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT confirmation_valid_expiry CHECK (expires_at > created_at),
    CONSTRAINT confirmation_qr_token CHECK (
        (method = 'qr' AND qr_token_hash IS NOT NULL AND btrim(qr_token_hash) <> '')
        OR (method = 'button' AND qr_token_hash IS NULL)
    ),
    CONSTRAINT confirmation_requires_both_participants CHECK (
        status <> 'confirmed'
        OR (owner_confirmed_at IS NOT NULL AND helper_confirmed_at IS NOT NULL)
    ),
    CONSTRAINT owner_confirmation_within_attempt CHECK (
        owner_confirmed_at IS NULL
        OR (owner_confirmed_at >= created_at AND owner_confirmed_at < expires_at)
    ),
    CONSTRAINT helper_confirmation_within_attempt CHECK (
        helper_confirmed_at IS NULL
        OR (helper_confirmed_at >= created_at AND helper_confirmed_at < expires_at)
    )
);

-- Expire a pending attempt before replacing it. Once confirmed, a stage
-- cannot have another pending or confirmed attempt.
CREATE UNIQUE INDEX confirmation_one_active_attempt
    ON booking_confirmations (booking_id, stage)
    WHERE status IN ('pending', 'confirmed');

CREATE UNIQUE INDEX confirmation_unique_qr_token
    ON booking_confirmations (qr_token_hash) WHERE qr_token_hash IS NOT NULL;

CREATE TABLE booking_messages (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    message TEXT NOT NULL CHECK (btrim(message) <> ''),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL CHECK (btrim(review_text) <> ''),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT review_once_per_participant UNIQUE (booking_id, reviewer_id)
);

CREATE TABLE disputes (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    opened_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    description TEXT NOT NULL CHECK (btrim(description) <> ''),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
    resolved_by INTEGER REFERENCES users(id) ON DELETE RESTRICT,
    resolution TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ,
    CONSTRAINT resolved_dispute_has_decision CHECK (
        status <> 'resolved'
        OR (resolved_by IS NOT NULL AND resolution IS NOT NULL
            AND btrim(resolution) <> '' AND resolved_at IS NOT NULL)
    )
);

CREATE TABLE admin_actions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    listing_id INTEGER REFERENCES service_listings(id) ON DELETE RESTRICT,
    dispute_id INTEGER REFERENCES disputes(id) ON DELETE RESTRICT,
    action TEXT NOT NULL CHECK (action IN ('warning', 'suspension', 'listing_removal')),
    reason TEXT NOT NULL CHECK (btrim(reason) <> ''),
    suspended_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT listing_removal_has_listing CHECK (
        action <> 'listing_removal' OR listing_id IS NOT NULL
    ),
    CONSTRAINT suspension_has_end CHECK (
        action <> 'suspension'
        OR (suspended_until IS NOT NULL AND suspended_until > created_at)
    )
);

CREATE TABLE calendar_events (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    external_calendar_id TEXT NOT NULL,
    external_event_id TEXT,
    sync_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (sync_status IN ('pending', 'synced', 'failed')),
    metadata JSONB,
    last_error TEXT,
    CONSTRAINT calendar_event_once_per_participant UNIQUE (booking_id, user_id),
    CONSTRAINT synced_calendar_event_has_id CHECK (
        sync_status <> 'synced'
        OR (external_event_id IS NOT NULL AND btrim(external_event_id) <> '')
    )
);

CREATE TABLE notifications (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    message TEXT NOT NULL CHECK (btrim(message) <> ''),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMPTZ
);

CREATE TABLE platform_settings (
    key TEXT PRIMARY KEY CHECK (btrim(key) <> ''),
    value TEXT NOT NULL
);

-- Common lookup indexes; primary keys and unique constraints already create
-- their own indexes. The exclusion constraint also indexes reserved intervals.
CREATE INDEX users_verification_queue_idx ON users (verification_status, created_at);
CREATE INDEX pets_owner_idx ON pets (owner_id);
CREATE INDEX listings_helper_idx ON service_listings (helper_id);
CREATE INDEX listings_type_status_idx ON service_listings (service_type_id, status);
CREATE INDEX availability_listing_period_idx
    ON listing_availability (listing_id, starts_at, ends_at);
CREATE INDEX bookings_owner_created_idx ON bookings (owner_id, created_at);
CREATE INDEX bookings_listing_period_idx ON bookings (listing_id, starts_at, ends_at);
CREATE INDEX bookings_pet_idx ON bookings (pet_id);
CREATE INDEX bookings_status_idx ON bookings (status);
CREATE INDEX confirmations_booking_idx ON booking_confirmations (booking_id);
CREATE INDEX messages_booking_sent_idx ON booking_messages (booking_id, sent_at);
CREATE INDEX reviews_reviewer_idx ON reviews (reviewer_id);
CREATE INDEX disputes_booking_idx ON disputes (booking_id);
CREATE INDEX disputes_status_created_idx ON disputes (status, created_at);
CREATE INDEX admin_actions_user_created_idx ON admin_actions (user_id, created_at);
CREATE INDEX admin_actions_dispute_idx ON admin_actions (dispute_id);
CREATE INDEX calendar_events_user_idx ON calendar_events (user_id);
CREATE INDEX notifications_user_created_idx ON notifications (user_id, created_at);

INSERT INTO service_types (name) VALUES ('sitting'), ('walking'), ('feeding');

COMMIT;
