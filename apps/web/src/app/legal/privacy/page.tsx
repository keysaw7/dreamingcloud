import { Card, PageShell } from '@dreamingcloud/ui';

export default function PrivacyPage() {
  return (
    <PageShell maxWidth="md" title="Politique de confidentialité">
      <Card className="space-y-4 text-[var(--dc-color-ink-soft)]">
        <p>
          DreamingCloud traite vos données personnelles pour fournir le service d’aspirations et de
          contributions, conformément au RGPD.
        </p>
        <div>
          <h2 className="text-lg font-semibold text-[var(--dc-color-ink)]">Données collectées</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Identifiants de compte (e-mail, nom d’utilisateur, profil)</li>
            <li>Contenus publiés (aspirations, commentaires, messages de contribution)</li>
            <li>Données techniques nécessaires à la sécurité (sessions, journaux d’audit)</li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--dc-color-ink)]">Vos droits</h2>
          <p className="mt-2">
            Vous pouvez exporter ou supprimer votre compte depuis votre profil. Pour toute demande,
            contactez privacy@dreamingcloud.app.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--dc-color-ink)]">Conservation</h2>
          <p className="mt-2">
            Les données de compte sont conservées tant que le compte est actif. Après suppression,
            les identifiants personnels sont anonymisés ; les journaux de sécurité sont retenus de
            façon limitée.
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
