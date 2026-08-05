import { Card } from '@dreamingcloud/ui';

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Card className="prose prose-neutral max-w-none">
        <h1>Politique de confidentialité</h1>
        <p>
          DreamingCloud traite vos données personnelles pour fournir le service d’aspirations et de
          contributions, conformément au RGPD.
        </p>
        <h2>Données collectées</h2>
        <ul>
          <li>Identifiants de compte (e-mail, nom d’utilisateur, profil)</li>
          <li>Contenus publiés (aspirations, commentaires, messages de contribution)</li>
          <li>Données techniques nécessaires à la sécurité (sessions, journaux d’audit)</li>
        </ul>
        <h2>Vos droits</h2>
        <p>
          Vous pouvez exporter ou supprimer votre compte depuis votre profil (`GET
          /api/v1/me/export`, `DELETE /api/v1/me`). Pour toute demande, contactez
          privacy@dreamingcloud.app.
        </p>
        <h2>Conservation</h2>
        <p>
          Les données de compte sont conservées tant que le compte est actif. Après suppression, les
          identifiants personnels sont anonymisés ; les journaux de sécurité sont retenus de façon
          limitée.
        </p>
      </Card>
    </main>
  );
}
