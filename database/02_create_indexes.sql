-- Index pour améliorer les performances
CREATE INDEX idx_invitations_user_id ON invitations(user_id);
CREATE INDEX idx_invitations_unique_url ON invitations(unique_url);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_invitation_guests_invitation_id ON invitation_guests(invitation_id);