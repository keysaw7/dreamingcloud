import { Card } from '@dreamingcloud/ui';

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Card>
        <h1 className="text-3xl font-semibold">Conditions d’utilisation</h1>
        <div className="mt-6 space-y-4 text-[var(--dc-color-muted)]">
          <p>
            DreamingCloud est une plateforme d’aspirations et de contributions. En créant un compte,
            vous vous engagez à publier des contenus sincères et respectueux.
          </p>
          <p>
            Les contributions non monétaires sont des engagements entre utilisateurs. La plateforme
            facilite la mise en relation et n’est pas partie aux engagements privés.
          </p>
          <p>
            Les contenus illicites, trompeurs ou abusifs peuvent être signalés et retirés. Les
            comptes peuvent être suspendus en cas de violation.
          </p>
        </div>
      </Card>
    </main>
  );
}
