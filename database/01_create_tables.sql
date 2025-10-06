-- Table des utilisateurs
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des templates d'invitation
CREATE TABLE invitation_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(20) CHECK (category IN ('enfant', 'femme-adulte', 'homme-adulte', 'general')) NOT NULL,
    html_content TEXT NOT NULL,
    css_content TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    thumbnail_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des invitations créées par les utilisateurs
CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES invitation_templates(id),
    title VARCHAR(200) NOT NULL,
    event_date TIMESTAMP,
    event_location TEXT,
    custom_message TEXT,
    custom_data JSONB,
    is_public BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    unique_url VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des paiements
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(50) NOT NULL,
    payment_type VARCHAR(20) CHECK (payment_type IN ('premium_upgrade', 'template_purchase', 'custom_design')) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des invités (pour tracking des RSVP)
CREATE TABLE invitation_guests (
    id SERIAL PRIMARY KEY,
    invitation_id INTEGER REFERENCES invitations(id) ON DELETE CASCADE,
    guest_name VARCHAR(100),
    guest_email VARCHAR(255),
    guest_phone VARCHAR(20),
    attendance_status VARCHAR(10) CHECK (attendance_status IN ('pending', 'confirmed', 'declined')) DEFAULT 'pending',
    plus_one INTEGER DEFAULT 0,
    dietary_restrictions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);