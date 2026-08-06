import { Card, PageShell } from '@dreamingcloud/ui';

export default function TermsPage() {
  return (
    <PageShell maxWidth="md" title="Conditions d’utilisation">
      <Card className="space-y-4 text-[var(--dc-color-ink-soft)]">
        <p>
          DreamingCloud est une plateforme d’aspirations et de contributions. En créant un compte,
          vous vous engagez à publier des contenus sincères et respectueux.
        </p>
        <p>
          Les contributions non monétaires sont des engagements entre utilisateurs. La plateforme
          facilite la mise en relation et n’est pas partie aux engagements privés.
        </p>
        <p>
          Les contenus illicites, trompeurs ou abusifs peuvent être signalés et retirés. Les comptes
          peuvent être suspendus en cas de violation.
        </p>
      </Card>
    </PageShell>
  );
}
