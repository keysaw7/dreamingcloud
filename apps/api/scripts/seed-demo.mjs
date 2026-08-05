import { randomBytes } from 'node:crypto';
import argon2 from 'argon2';
import pg from 'pg';

import { loadEnvFiles } from './load-env.mjs';

loadEnvFiles();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required.');
  process.exit(1);
}

function uuidV7() {
  const bytes = Uint8Array.from(randomBytes(16));
  let timestamp = Date.now();
  for (let index = 5; index >= 0; index -= 1) {
    bytes[index] = timestamp & 0xff;
    timestamp = Math.floor(timestamp / 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const DEMO_PASSWORD = 'DemoPass123!';
const DEMO_EMAILS = ['admin@demo.local', 'lea@demo.local', 'noah@demo.local'];

const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();

try {
  await client.query('BEGIN');

  const existing = await client.query('SELECT id FROM users WHERE email = ANY($1::text[])', [
    DEMO_EMAILS,
  ]);
  const existingIds = existing.rows.map((row) => row.id);

  if (existingIds.length > 0) {
    await client.query(
      `DELETE FROM messages WHERE conversation_id IN (
         SELECT conversation_id FROM conversation_participants WHERE user_id = ANY($1::uuid[])
       )`,
      [existingIds],
    );
    await client.query('DELETE FROM conversation_participants WHERE user_id = ANY($1::uuid[])', [
      existingIds,
    ]);
    await client.query(
      `DELETE FROM conversations WHERE id IN (
         SELECT conversation_id FROM contributions WHERE contributor_id = ANY($1::uuid[])
         OR aspiration_id IN (SELECT id FROM aspirations WHERE owner_id = ANY($1::uuid[]))
       )`,
      [existingIds],
    );
    await client.query('DELETE FROM contributions WHERE contributor_id = ANY($1::uuid[])', [
      existingIds,
    ]);
    await client.query(
      `DELETE FROM contributions WHERE aspiration_id IN (
         SELECT id FROM aspirations WHERE owner_id = ANY($1::uuid[])
       )`,
      [existingIds],
    );
    await client.query('DELETE FROM comments WHERE author_id = ANY($1::uuid[])', [existingIds]);
    await client.query('DELETE FROM supports WHERE user_id = ANY($1::uuid[])', [existingIds]);
    await client.query(
      'DELETE FROM follows WHERE follower_id = ANY($1::uuid[]) OR following_id = ANY($1::uuid[])',
      [existingIds],
    );
    await client.query(
      `DELETE FROM aspiration_milestones WHERE aspiration_id IN (
         SELECT id FROM aspirations WHERE owner_id = ANY($1::uuid[])
       )`,
      [existingIds],
    );
    await client.query(
      `DELETE FROM aspiration_needs WHERE aspiration_id IN (
         SELECT id FROM aspirations WHERE owner_id = ANY($1::uuid[])
       )`,
      [existingIds],
    );
    await client.query(
      `DELETE FROM aspiration_stats WHERE aspiration_id IN (
         SELECT id FROM aspirations WHERE owner_id = ANY($1::uuid[])
       )`,
      [existingIds],
    );
    await client.query(
      `DELETE FROM feed_entries WHERE aspiration_id IN (
         SELECT id FROM aspirations WHERE owner_id = ANY($1::uuid[])
       )`,
      [existingIds],
    );
    await client.query('DELETE FROM aspirations WHERE owner_id = ANY($1::uuid[])', [existingIds]);
    await client.query('DELETE FROM notifications WHERE user_id = ANY($1::uuid[])', [existingIds]);
    await client.query('DELETE FROM auth_sessions WHERE user_id = ANY($1::uuid[])', [existingIds]);
    await client.query('DELETE FROM auth_credentials WHERE user_id = ANY($1::uuid[])', [
      existingIds,
    ]);
    await client.query('DELETE FROM user_settings WHERE user_id = ANY($1::uuid[])', [existingIds]);
    await client.query('DELETE FROM user_profiles WHERE user_id = ANY($1::uuid[])', [existingIds]);
    await client.query('DELETE FROM users WHERE id = ANY($1::uuid[])', [existingIds]);
  }

  const passwordHash = await argon2.hash(DEMO_PASSWORD, { type: argon2.argon2id });
  const now = new Date();

  const users = [
    {
      id: uuidV7(),
      email: 'admin@demo.local',
      username: 'admin',
      displayName: 'Admin Démo',
      role: 'admin',
      bio: 'Compte administrateur de démonstration.',
    },
    {
      id: uuidV7(),
      email: 'lea@demo.local',
      username: 'lea',
      displayName: 'Léa Martin',
      role: 'user',
      bio: 'Porteuse de rêves écologiques et éducatifs.',
    },
    {
      id: uuidV7(),
      email: 'noah@demo.local',
      username: 'noah',
      displayName: 'Noah Bernard',
      role: 'user',
      bio: 'Contributeur passionné de compétences techniques.',
    },
  ];

  for (const user of users) {
    await client.query(
      `INSERT INTO users (id, email, username, status, role, email_verified_at, created_at, updated_at)
       VALUES ($1, $2, $3, 'active', $4, $5, $5, $5)`,
      [user.id, user.email, user.username, user.role, now],
    );
    await client.query(
      `INSERT INTO user_profiles (user_id, display_name, bio, locale, metadata, updated_at)
       VALUES ($1, $2, $3, 'fr', '{}'::jsonb, $4)`,
      [user.id, user.displayName, user.bio, now],
    );
    await client.query(
      `INSERT INTO user_settings (user_id, profile_visibility, notification_preferences, updated_at)
       VALUES ($1, 'public', '{"email":true,"inApp":true}'::jsonb, $2)`,
      [user.id, now],
    );
    await client.query(
      `INSERT INTO auth_credentials (id, user_id, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $4)`,
      [uuidV7(), user.id, passwordHash, now],
    );
  }

  const [, lea, noah] = users;
  const aspirationDefs = [
    {
      ownerId: lea.id,
      title: 'Créer une forêt urbaine participative',
      slug: 'foret-urbaine-participative',
      story:
        'Nous voulons transformer un terrain vague en forêt comestible ouverte à tout le quartier, avec ateliers, compost et biodiversité.',
      need: { type: 'time', title: 'Bénévoles plantation' },
      milestone: 'Cartographier le terrain',
    },
    {
      ownerId: lea.id,
      title: 'Ateliers numériques pour seniors',
      slug: 'ateliers-numeriques-seniors',
      story:
        'Organiser des sessions hebdomadaires pour aider les seniors à utiliser smartphone, e-mail et démarches en ligne en toute confiance.',
      need: { type: 'skill', title: 'Formateurs patients' },
      milestone: 'Trouver une salle municipale',
    },
    {
      ownerId: lea.id,
      title: 'Bibliothèque de rue itinérante',
      slug: 'bibliotheque-rue-itinerante',
      story:
        'Un chariot de livres qui circule dans les quartiers moins desservis, avec des lectures à voix haute pour les enfants.',
      need: { type: 'material', title: 'Livres jeunesse' },
      milestone: 'Collecte des premiers cartons',
    },
    {
      ownerId: noah.id,
      title: 'Plateforme open-source de covoiturage local',
      slug: 'covoiturage-local-opensource',
      story:
        'Construire un outil simple pour mutualiser les trajets domicile-travail dans les petites villes, sans pub ni tracking.',
      need: { type: 'skill', title: 'Dev frontend React' },
      milestone: 'MVP authentification',
    },
    {
      ownerId: noah.id,
      title: 'Résidence artistique en zone rurale',
      slug: 'residence-artistique-rurale',
      story:
        'Accueillir trois artistes pendant un mois pour créer avec les habitants et exposer dans la salle des fêtes.',
      need: { type: 'contact', title: 'Mécènes locaux' },
      milestone: 'Accord mairie',
    },
  ];

  const aspirationIds = [];
  for (const def of aspirationDefs) {
    const aspirationId = uuidV7();
    aspirationIds.push(aspirationId);
    await client.query(
      `INSERT INTO aspirations (
         id, owner_id, title, slug, story, status, visibility, progress_percent, metadata, published_at, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, 'published', 'public', 10, '{}'::jsonb, $6, $6, $6)`,
      [aspirationId, def.ownerId, def.title, def.slug, def.story, now],
    );
    const needId = uuidV7();
    await client.query(
      `INSERT INTO aspiration_needs (
         id, aspiration_id, need_type, title, description, fulfilled_amount_minor, fulfilled_quantity, status, metadata, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, NULL, 0, 0, 'open', '{}'::jsonb, $5, $5)`,
      [needId, aspirationId, def.need.type, def.need.title, now],
    );
    await client.query(
      `INSERT INTO aspiration_milestones (id, aspiration_id, title, description, position, created_at)
       VALUES ($1, $2, $3, NULL, 1, $4)`,
      [uuidV7(), aspirationId, def.milestone, now],
    );
    await client.query(
      `INSERT INTO aspiration_stats (aspiration_id, support_count, comment_count, share_count, contribution_count, updated_at)
       VALUES ($1, 0, 0, 0, 0, $2)
       ON CONFLICT (aspiration_id) DO NOTHING`,
      [aspirationId, now],
    );
    def.needId = needId;
    def.id = aspirationId;
  }

  await client.query(
    `INSERT INTO supports (aspiration_id, user_id, created_at) VALUES ($1, $2, $3), ($4, $5, $3)
     ON CONFLICT DO NOTHING`,
    [aspirationDefs[0].id, noah.id, now, aspirationDefs[3].id, lea.id],
  );

  await client.query(
    `INSERT INTO comments (id, aspiration_id, author_id, parent_id, body, created_at, updated_at)
     VALUES ($1, $2, $3, NULL, $4, $5, $5), ($6, $7, $8, NULL, $9, $5, $5)`,
    [
      uuidV7(),
      aspirationDefs[0].id,
      noah.id,
      'Super projet, je peux aider pour les plantations du week-end.',
      now,
      uuidV7(),
      aspirationDefs[3].id,
      lea.id,
      'Besoin aussi de retours UX ? Je suis partante.',
    ],
  );

  await client.query(
    `INSERT INTO follows (follower_id, following_id, created_at) VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [noah.id, lea.id, now],
  );

  const conversationId = uuidV7();
  const contributionId = uuidV7();
  await client.query(
    `INSERT INTO conversations (id, kind, created_at) VALUES ($1, 'contribution', $2)`,
    [conversationId, now],
  );
  await client.query(
    `INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
     VALUES ($1, $2, $3), ($1, $4, $3)`,
    [conversationId, lea.id, now, noah.id],
  );
  await client.query(
    `INSERT INTO contributions (
       id, aspiration_id, need_id, contributor_id, status, contribution_type, description,
       conversation_id, metadata, created_at, updated_at
     ) VALUES ($1, $2, $3, $4, 'accepted', 'skill', $5, $6, $7::jsonb, $8, $8)`,
    [
      contributionId,
      aspirationDefs[0].id,
      aspirationDefs[0].needId,
      noah.id,
      'Je peux organiser les samedis matin plantation et former les bénévoles.',
      conversationId,
      JSON.stringify({ ownerId: lea.id }),
      now,
    ],
  );
  await client.query(
    `INSERT INTO messages (id, conversation_id, sender_id, body, created_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      uuidV7(),
      conversationId,
      lea.id,
      'Merci Noah ! On se retrouve samedi à 9h devant le terrain.',
      now,
    ],
  );

  await client.query('COMMIT');

  console.log('Seed démo appliqué.');
  console.log('Comptes (mot de passe: DemoPass123!):');
  for (const user of users) {
    console.log(`- ${user.email} (${user.role}) / @${user.username}`);
  }
  console.log(`Contribution acceptée: ${contributionId}`);
  console.log(`Conversation: ${conversationId}`);
  console.log(`Aspiration principale: /aspirations/${aspirationDefs[0].slug}`);
} catch (error) {
  await client.query('ROLLBACK');
  console.error(error);
  process.exit(1);
} finally {
  await client.end();
}
