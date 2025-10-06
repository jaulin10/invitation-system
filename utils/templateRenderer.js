// utils/templateRenderer.js
// Moteur de rendu de templates pour votre système

class TemplateRenderer {
  /**
   * Remplace les variables dans le HTML du template
   */
  static renderTemplate(htmlContent, cssContent, invitationData) {
    // Variables à remplacer
    const variables = {
      title: invitationData.title || "",
      event_date: this.formatDate(invitationData.event_date) || "",
      event_time: invitationData.event_time || "",
      event_location: invitationData.event_location || "",
      contact_phone: invitationData.contact_phone || "",
      event_theme: invitationData.event_theme || "",
      custom_message: invitationData.custom_message || "",
      guest_photo_url:
        invitationData.guest_photo_url || "/images/default-photo.jpg",
      unique_url: invitationData.unique_url || "",
      public_url: invitationData.public_url || "",
    };

    // Remplacer les variables dans le HTML
    let renderedHtml = htmlContent;
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      renderedHtml = renderedHtml.replace(regex, variables[key]);
    });

    // Ajouter les custom_data si présents
    if (invitationData.custom_data) {
      Object.keys(invitationData.custom_data).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        renderedHtml = renderedHtml.replace(
          regex,
          invitationData.custom_data[key]
        );
      });
    }

    // Combiner HTML et CSS
    const fullHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${variables.title}</title>
    <style>${cssContent}</style>
</head>
<body>
    ${renderedHtml}
    <script>
        // Script pour le formulaire RSVP
        const invitationId = '${invitationData.id}';
        const uniqueUrl = '${variables.unique_url}';
        
        // Gestion du formulaire RSVP
        document.addEventListener('DOMContentLoaded', function() {
            const rsvpForm = document.getElementById('rsvpForm');
            if (rsvpForm) {
                rsvpForm.addEventListener('submit', handleRSVPSubmit);
            }
            
            // Toggle présent/absent
            document.querySelectorAll('input[name="presence"]').forEach(radio => {
                radio.addEventListener('change', function() {
                    const presentForm = document.getElementById('presentForm');
                    const absentForm = document.getElementById('absentForm');
                    
                    if (this.value === 'present') {
                        presentForm.classList.remove('hidden');
                        absentForm.classList.add('hidden');
                    } else {
                        presentForm.classList.add('hidden');
                        absentForm.classList.remove('hidden');
                    }
                });
            });
            
            // Toggle cadeau
            document.querySelectorAll('input[name="gift"]').forEach(radio => {
                radio.addEventListener('change', function() {
                    const giftDetails = document.getElementById('giftDetails');
                    if (this.value === 'yes') {
                        giftDetails.classList.remove('hidden');
                    } else {
                        giftDetails.classList.add('hidden');
                    }
                });
            });
        });
        
        async function handleRSVPSubmit(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const presence = formData.get('presence');
            
            const data = {
                attendance_status: presence === 'present' ? 'confirmed' : 'declined',
                special_message: ''
            };
            
            if (presence === 'present') {
                // Formulaire présent
                data.father_name = formData.get('pere') || '';
                data.mother_name = formData.get('mere') || '';
                data.children_0_2 = parseInt(formData.get('age0_2')) || 0;
                data.children_2_5 = parseInt(formData.get('age2_5')) || 0;
                data.children_5_10 = parseInt(formData.get('age5_10')) || 0;
                data.guest_name = data.father_name || data.mother_name;
            } else {
                // Formulaire absent
                data.father_name = formData.get('pereAbsent') || '';
                data.mother_name = formData.get('mereAbsent') || '';
                data.absence_reason = formData.get('raison') || '';
                data.gift_intent = formData.get('gift') || 'no';
                data.gift_type = formData.get('giftType') || '';
                data.guest_name = data.father_name || data.mother_name;
            }
            
            try {
                const response = await fetch(\`/api/invitations/public/\${uniqueUrl}/rsvp\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    document.getElementById('confirmationMsg').classList.remove('hidden');
                    rsvpForm.reset();
                    setTimeout(() => {
                        document.getElementById('confirmationMsg').classList.add('hidden');
                    }, 5000);
                } else {
                    alert('Erreur: ' + result.message);
                }
            } catch (error) {
                console.error('Erreur RSVP:', error);
                alert('Erreur lors de l\'envoi de votre réponse');
            }
        }
    </script>
</body>
</html>
    `;

    return fullHtml;
  }

  /**
   * Formater la date pour l'affichage
   */
  static formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return date.toLocaleDateString("fr-FR", options);
  }
}

module.exports = TemplateRenderer;

// ===== EXEMPLE D'UTILISATION =====

/*
// Dans invitationController.js - méthode showPublicInvitation

static async showPublicInvitation(req, res) {
  try {
    const { uniqueUrl } = req.params;
    
    const invitationData = await Invitation.findByUniqueUrl(uniqueUrl);
    
    if (!invitationData) {
      return res.status(404).send('Invitation non trouvée');
    }
    
    // Récupérer le template
    const template = await Template.findById(invitationData.template_id);
    
    if (!template) {
      return res.status(404).send('Template non trouvé');
    }
    
    // Incrémenter les vues
    const invitation = await Invitation.findById(invitationData.id);
    await invitation.incrementViewCount();
    
    // Rendre le template avec les données
    const TemplateRenderer = require('../utils/templateRenderer');
    const renderedHtml = TemplateRenderer.renderTemplate(
      template.html_content,
      template.css_content,
      invitationData
    );
    
    res.send(renderedHtml);
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).send('Erreur serveur');
  }
}
*/
