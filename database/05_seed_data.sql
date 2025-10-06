-- Insertion de templates d'exemple
INSERT INTO invitation_templates (name, category, html_content, css_content, is_premium, thumbnail_url) VALUES 
(
    'Anniversaire Enfant - Thème Jungle',
    'enfant',
    '<div class="invitation-card">
        <h1>{{title}}</h1>
        <div class="event-details">
            <p>🎂 Date: {{event_date}}</p>
            <p>📍 Lieu: {{event_location}}</p>
            <p class="message">{{custom_message}}</p>
        </div>
        <div class="jungle-theme">
            <div class="animal">🦁</div>
            <div class="animal">🐵</div>
            <div class="animal">🦒</div>
        </div>
    </div>',
    '.invitation-card {
        background: linear-gradient(135deg, #66bb6a, #43a047);
        border-radius: 20px;
        padding: 40px;
        text-align: center;
        color: white;
        font-family: "Comic Sans MS", cursive;
        max-width: 400px;
        margin: 20px auto;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }
    h1 { font-size: 2.5em; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
    .event-details p { font-size: 1.2em; margin: 10px 0; }
    .message { font-style: italic; margin: 20px 0; }
    .jungle-theme { margin-top: 20px; }
    .animal { display: inline-block; font-size: 3em; margin: 0 10px; animation: bounce 2s infinite; }
    @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); } }',
    false,
    '/assets/templates/enfant-jungle-preview.jpg'
),
(
    'Soirée Élégante - Femme',
    'femme-adulte',
    '<div class="invitation-card elegant">
        <div class="header">
            <h1>{{title}}</h1>
            <div class="ornament">✨</div>
        </div>
        <div class="event-details">
            <p class="date">{{event_date}}</p>
            <p class="location">{{event_location}}</p>
            <div class="message">{{custom_message}}</div>
        </div>
        <div class="footer">
            <p>RSVP requis</p>
        </div>
    </div>',
    '.invitation-card.elegant {
        background: linear-gradient(45deg, #f8bbd9, #e91e63);
        border-radius: 15px;
        padding: 50px;
        text-align: center;
        color: white;
        font-family: "Georgia", serif;
        max-width: 450px;
        margin: 20px auto;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        position: relative;
    }
    .header h1 { font-size: 2.8em; margin-bottom: 10px; font-weight: 300; }
    .ornament { font-size: 2em; margin: 15px 0; }
    .event-details { margin: 30px 0; }
    .date, .location { font-size: 1.3em; margin: 15px 0; font-weight: 600; }
    .message { font-style: italic; margin: 25px 0; font-size: 1.1em; line-height: 1.5; }
    .footer { margin-top: 30px; font-size: 0.9em; opacity: 0.9; }',
    true,
    '/assets/templates/femme-elegante-preview.jpg'
),
(
    'Anniversaire Classique - Homme',
    'homme-adulte',
    '<div class="invitation-card masculine">
        <div class="header">
            <h1>{{title}}</h1>
        </div>
        <div class="event-details">
            <div class="detail-item">
                <span class="label">Date:</span>
                <span class="value">{{event_date}}</span>
            </div>
            <div class="detail-item">
                <span class="label">Lieu:</span>
                <span class="value">{{event_location}}</span>
            </div>
            <div class="message">{{custom_message}}</div>
        </div>
        <div class="accent-line"></div>
    </div>',
    '.invitation-card.masculine {
        background: linear-gradient(135deg, #37474f, #546e7a);
        border-radius: 10px;
        padding: 40px;
        text-align: left;
        color: white;
        font-family: "Arial", sans-serif;
        max-width: 500px;
        margin: 20px auto;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    }
    .header h1 { font-size: 2.5em; margin-bottom: 30px; font-weight: bold; text-align: center; }
    .detail-item { margin: 20px 0; display: flex; align-items: center; }
    .label { font-weight: bold; width: 80px; color: #ffcc02; }
    .value { font-size: 1.2em; }
    .message { margin: 30px 0; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 5px; text-align: center; }
    .accent-line { height: 4px; background: #ffcc02; margin-top: 30px; }',
    false,
    '/assets/templates/homme-classique-preview.jpg'
);

-- Insertion d'un utilisateur de test (mot de passe: "test123")
INSERT INTO users (email, password, first_name, last_name, is_premium) VALUES 
('test@example.com', '$2a$10$rOZCz8NRzVq5bYOH7Jm9NeIhzYMUO5KYdBqZjHnrj9QdLqbqe0aTK', 'Test', 'User', true);

-- Insertion d'une invitation d'exemple
INSERT INTO invitations (user_id, template_id, title, event_date, event_location, custom_message, is_public, unique_url) VALUES 
(1, 1, 'Anniversaire de Lucas - 8 ans!', '2024-12-15 14:00:00', 'Parc de la Villette, Paris', 'Venez célébrer les 8 ans de Lucas avec des jeux, des surprises et un délicieux gâteau!', true, 'lucas-8ans-2024');