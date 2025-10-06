-- Ajout de champs supplémentaires pour correspondre à vos templates

-- Ajouter des champs à la table invitations
ALTER TABLE invitations ADD COLUMN event_time VARCHAR(50);
ALTER TABLE invitations ADD COLUMN contact_phone VARCHAR(20);
ALTER TABLE invitations ADD COLUMN event_theme VARCHAR(100);
ALTER TABLE invitations ADD COLUMN guest_photo_url VARCHAR(255);

-- Ajouter des champs à la table invitation_guests pour les spécificités enfants
ALTER TABLE invitation_guests ADD COLUMN father_name VARCHAR(100);
ALTER TABLE invitation_guests ADD COLUMN mother_name VARCHAR(100);
ALTER TABLE invitation_guests ADD COLUMN children_0_2 INTEGER DEFAULT 0;
ALTER TABLE invitation_guests ADD COLUMN children_2_5 INTEGER DEFAULT 0;
ALTER TABLE invitation_guests ADD COLUMN children_5_10 INTEGER DEFAULT 0;
ALTER TABLE invitation_guests ADD COLUMN gift_intent VARCHAR(10); -- 'yes'/'no'
ALTER TABLE invitation_guests ADD COLUMN gift_type VARCHAR(200);
ALTER TABLE invitation_guests ADD COLUMN absence_reason TEXT;
ALTER TABLE invitation_guests ADD COLUMN special_message TEXT;

-- Index pour les nouvelles colonnes
CREATE INDEX idx_invitations_contact_phone ON invitations(contact_phone);
CREATE INDEX idx_guests_attendance ON invitation_guests(attendance_status);